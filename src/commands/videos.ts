import { defineCommand } from 'citty'
import { db } from '~/db/db'
import { videos } from '~/db/schema'
import { createInnertubeClient, getChannelId, getVideoIdsOfAllPublicLiveStreams, getVideoInfo } from '~/utils'

export default defineCommand({
  meta: {
    description: 'Fetch all videos data from a YouTube channel.',
  },
  args: {
    cid: {
      description: 'YouTube Channel Id or YouTube Handler',
      required: true,
      type: 'string',
    },
  },
  run: async ({ args }) => {
    const youtube = await createInnertubeClient()

    const channelId = await getChannelId(youtube, args.cid)

    const allPublicLiveStreamIds = await getVideoIdsOfAllPublicLiveStreams(youtube, channelId, 'fromOldestToLatest')

    const existingLiveStreams = await db.select({ id: videos.id }).from(videos)

    const existingLiveStreamIds = existingLiveStreams.map((liveStream) => liveStream.id)

    const newLiveStreamIds = allPublicLiveStreamIds.filter((videoId) => !existingLiveStreamIds.includes(videoId))

    for (const newLiveStreamId of newLiveStreamIds) {
      const { isLive, isUpcoming, title, startTimestamp, endTimestamp, duration } = await getVideoInfo(
        youtube,
        newLiveStreamId,
      )

      if (isLive || isUpcoming) {
        // ignore ongoing/upcoming live streams, as they do not have `endTimestamp` and `duration` data

        continue
      }

      const records = await db
        .insert(videos)
        .values({
          id: newLiveStreamId,
          title,
          startTimestamp,
          endTimestamp,
          duration,
        })
        .onConflictDoNothing()
        .returning()

      const video = records.at(0)

      if (!video) {
        continue
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`

      console.log(`✨ added new video: ${videoUrl}`)
      console.log(JSON.stringify(video, null, 2))
      console.log()
    }
  },
})
