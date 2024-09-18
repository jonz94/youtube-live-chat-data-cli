import { defineCommand } from 'citty'
import { eq } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { YTNodes } from 'youtubei.js'
import { db } from '~/db/db'
import { users } from '~/db/schema'
import { createInnertubeClient, getChannel, getProjectRoot } from '~/utils'

interface ChannelInfo {
  name: string
  avatar: string | null
}

async function getChannelInfoFromHeader(
  header: YTNodes.C4TabbedHeader | YTNodes.CarouselHeader | YTNodes.InteractiveTabbedHeader | YTNodes.PageHeader,
) {
  if (header.is(YTNodes.C4TabbedHeader)) {
    return {
      name: header.author.name,
      avatar: header.author.best_thumbnail?.url ?? null,
    } satisfies ChannelInfo
  }

  if (header.is(YTNodes.PageHeader)) {
    const name = header.page_title
    const image = header.content?.image

    if (!image) {
      return {
        name,
        avatar: null,
      } satisfies ChannelInfo
    }

    if (image.is(YTNodes.DecoratedAvatarView)) {
      return {
        name,
        avatar: image.avatar?.image.at(0)?.url ?? null,
      } satisfies ChannelInfo
    }

    return {
      name,
      avatar: image.image.at(0)?.url ?? null,
    } satisfies ChannelInfo
  }

  console.log('new header type:', header.type)
  console.log(JSON.stringify(header, null, 2))

  return null
}

export default defineCommand({
  meta: {
    name: 'avatar',
    description: 'Export channel-related data from the database to JSON files, and save user avatars as image files.',
  },
  args: {
    update: {
      description: 'Update channel name simultaneously',
      type: 'boolean',
      default: false,
    },
  },
  run: async ({ args }) => {
    const outputDir = resolve(getProjectRoot(), 'outputs')
    mkdirSync(outputDir, { recursive: true })

    const channelOutputPath = resolve(outputDir, 'channels.json')
    const channelData = await db
      .select({ id: users.channelId, name: users.name, timestamp: users.timestamp })
      .from(users)

    if (!args.update) {
      writeFileSync(channelOutputPath, JSON.stringify(channelData), 'utf-8')
    }

    const youtube = await createInnertubeClient({ lang: 'zh-TW' })

    const total = channelData.length
    let count = 0

    for (const channel of channelData) {
      const userId = channel.id

      count++
      console.log(`(${count}/${total}) ${userId}`)

      const userOutputDir = resolve(getProjectRoot(), 'outputs', userId)
      mkdirSync(userOutputDir, { recursive: true })

      // channel
      const userChannelOutputPath = resolve(userOutputDir, 'channel.json')

      // avatar
      const youtubeChannel = await getChannel(youtube, userId)

      if (youtubeChannel === null) {
        continue
      }

      const header = youtubeChannel.header

      if (!header) {
        console.log(`the channel ${userId} has no header...`)
        continue
      }

      const channelInfo = await getChannelInfoFromHeader(header)

      if (!channelInfo) {
        writeFileSync(userChannelOutputPath, JSON.stringify(channel), 'utf-8')
        continue
      }

      if (args.update) {
        const { name } = channelInfo

        const updatedRecords = await db.update(users).set({ name }).where(eq(users.channelId, userId)).returning()
        const updatedRecord = updatedRecords.at(0)

        if (!updatedRecord) {
          console.log(`update channel ${userId} failed...`)

          writeFileSync(userChannelOutputPath, JSON.stringify(channel), 'utf-8')
        } else {
          const updatedChannel = {
            id: updatedRecord.channelId,
            name,
            timestamp: updatedRecord.timestamp,
          }

          writeFileSync(userChannelOutputPath, JSON.stringify(updatedChannel), 'utf-8')
        }
      } else {
        writeFileSync(userChannelOutputPath, JSON.stringify(channel), 'utf-8')
      }

      if (!channelInfo.avatar) {
        console.log(`the channel ${userId} has no avatar...`)
        continue
      }

      const image = await fetch(channelInfo.avatar)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => Buffer.from(arrayBuffer))

      const userAvatarOutputPath = resolve(userOutputDir, 'avatar.jpg')
      writeFileSync(userAvatarOutputPath, image)
    }
  },
})
