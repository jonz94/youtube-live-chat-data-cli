import { defineCommand } from 'citty'
import { asc, eq } from 'drizzle-orm'
import { json2csv } from 'json-2-csv'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { db } from '~/db/db'
import { rawTextMessage, users } from '~/db/schema'

interface Image {
  url: string
  width: number
  height: number
}

interface Emoji {
  emoji_id: string
  image: Image[]
  is_custom: boolean
}

interface Run {
  text: string
  emoji?: Emoji
}

interface JsonMessage {
  runs: Run[]
  text: string
}

function parseJsonMessage(text?: string) {
  if (!text) {
    return null
  }

  const parsedText = JSON.parse(text) as JsonMessage

  return parsedText.runs
    .map((run) => {
      if (run.emoji) {
        return '<貼圖>'
      }

      return run.text
    })
    .join('')
}

export default defineCommand({
  meta: {
    description: 'Export database data into CSV file.',
  },
  args: {
    vid: {
      description: 'YouTube Video Id',
      required: true,
      type: 'string',
    },
    filename: {
      description: 'Output filename',
      required: false,
      type: 'string',
    },
  },
  run: async ({ args }) => {
    const videoId = args.vid
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    // raw text message
    const rawTextMessageData = await db
      .select()
      .from(rawTextMessage)
      .where(eq(rawTextMessage.videoId, videoId))
      .orderBy(asc(rawTextMessage.timestamp))

    const items = []

    for await (const data of rawTextMessageData) {
      const user = await db.query.users.findFirst({
        where: eq(users.channelId, data.userId),
      })

      const timestamp = Math.floor(Number(data.videoOffsetTimeMsec) / 1000)

      const item = {
        YouTube使用者名稱: user?.name ?? '',
        時間軸: timestamp,
        '網址連結(含時間軸)': `${videoUrl}&t=${timestamp}s`,
        留言內容: parseJsonMessage(data.jsonMessage as string),
      }

      items.push(item)
    }

    const filename = args.filename
      ? args.filename.endsWith('.csv')
        ? args.filename
        : args.filename.concat('.csv')
      : 'output.csv'

    const outputPath = resolve(cwd(), filename)
    const csv = json2csv(items)

    writeFileSync(outputPath, csv, 'utf-8')
  },
})
