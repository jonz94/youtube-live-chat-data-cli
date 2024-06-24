import { defineCommand } from 'citty'
import { isProduction } from '../../env'
import { createInnertubeClient, getChannelId, getVideoIdsOfAllPublicLiveStreams } from '../utils'

export default defineCommand({
  meta: {
    name: 'authors',
    description: 'Fetch all live chat authors data from a YouTube live stream.',
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

    const allPublicLiveStreamIds = await getVideoIdsOfAllPublicLiveStreams(youtube, channelId)

    for (const videoId of allPublicLiveStreamIds) {
      if (isProduction()) {
        console.log(`pnpm run start chat --vid="${videoId}"`)
        return
      }

      console.log(`pnpm run start-dev chat --vid="${videoId}"`)
    }
  },
})
