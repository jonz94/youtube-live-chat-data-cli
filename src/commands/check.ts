import { defineCommand } from 'citty'
import { db } from '~/db/db'
import { rawTextMessage, videos } from '~/db/schema'
import { createInnertubeClient, getVideoInfo } from '~/utils'

export default defineCommand({
  meta: {
    name: 'check',
    description: 'Check database.',
  },
  run: async () => {
    const allVideoIds = (await db.select({ videoId: videos.id }).from(videos)).map((video) => video.videoId)
    const textMessageVideoIds = (await db.select({ videoId: rawTextMessage.videoId }).from(rawTextMessage)).map(
      (textMessage) => textMessage.videoId,
    )

    const noTextMessageVideoIds = allVideoIds.filter((id) => !textMessageVideoIds.includes(id))

    if (noTextMessageVideoIds.length <= 0) {
      return
    }

    const youtube = await createInnertubeClient()

    for (const videoId of noTextMessageVideoIds) {
      const videoInfo = await getVideoInfo(youtube, videoId)

      console.log(`⚠️  video has no text message: (https://www.youtube.com/watch?v=${videoId})`)
      console.log(JSON.stringify(videoInfo, null, 2))
      console.log()
    }
  },
})
