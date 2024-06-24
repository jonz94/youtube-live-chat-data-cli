import { defineCommand } from 'citty'
import { inArray } from 'drizzle-orm'
import { db } from '../../db/db'
import { liveStreams } from '../../db/schema'
import { createInnertubeClient, getChannelId, getVideoIdsOfAllPublicLiveStreams, getVideoInfo } from '../utils'

export default defineCommand({
  meta: {
    name: 'videos',
    description: 'Fetch all videos data from a YouTube channel.',
  },
  args: {
    cid: {
      description: 'YouTube Channel Id or YouTube Handler',
      required: true,
      type: 'string',
    },
    sequential: {
      description: 'insert data one by one',
      type: 'boolean',
    },
  },
  run: async ({ args }) => {
    const youtube = await createInnertubeClient()

    const channelId = await getChannelId(youtube, args.cid)

    const allPublicLiveStreamIds = await getVideoIdsOfAllPublicLiveStreams(youtube, channelId)

    const existingLiveStreams = await db
      .select({ id: liveStreams.id })
      .from(liveStreams)
      .where(inArray(liveStreams.id, allPublicLiveStreamIds))

    const existingLiveStreamIds = existingLiveStreams.map((liveStream) => liveStream.id)

    const newLiveStreamIds = allPublicLiveStreamIds.filter((videoId) => !existingLiveStreamIds.includes(videoId))

    if (args.sequential) {
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
          .insert(liveStreams)
          .values({
            id: newLiveStreamId,
            title,
            startTimestamp,
            endTimestamp,
            duration,
          })
          .returning()

        console.log('✨ added new video:')
        console.log(JSON.stringify(records.at(0), null, 2))
        console.log()
      }

      return
    }

    const newLiveStreamDataPromises = newLiveStreamIds.map(async (newLiveStreamId) => {
      // NOTE: we fetch data sequentially to prevent hitting the rate limit from YouTube
      const { isLive, isUpcoming, title, startTimestamp, endTimestamp, duration } = await getVideoInfo(
        youtube,
        newLiveStreamId,
      )

      if (isLive || isUpcoming) {
        // ignore ongoing/upcoming live streams, as they do not have `endTimestamp` and `duration` data

        return null
      }

      return {
        id: newLiveStreamId,
        title: title ?? '',
        startTimestamp: startTimestamp ?? '',
        endTimestamp: endTimestamp ?? '',
        duration,
      }
    })

    const newLiveStreams = (await Promise.all(newLiveStreamDataPromises)).filter(Boolean)

    if (newLiveStreams.length <= 0) {
      console.log('✅ all data is already up to date')
      return
    }

    const records = await db.insert(liveStreams).values(newLiveStreams).returning()

    console.log('✨ added new videos:')
    console.log(JSON.stringify(records, null, 2))
    console.log()
  },
})
