import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { createInnertubeClient, getChannelId } from '~/utils'

export default defineCommand({
  meta: {
    description: 'Check whether a YouTube channel is currently live streaming.',
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

    const channel = await youtube.getChannel(channelId)

    const liveStreams = await channel.getLiveStreams()

    const tab = liveStreams.current_tab

    if (!tab) {
      throw new Error('live stream tab info not found')
    }

    if (!tab.is(YTNodes.Tab)) {
      console.log(tab.content)

      throw new Error(`tab type ${tab.type} not implemented`)
    }

    const tabContent = tab.content

    if (!tabContent) {
      throw new Error('live stream tab content is empty')
    }

    if (!tabContent.is(YTNodes.RichGrid)) {
      console.log(tabContent)

      throw new Error(`tab content type ${tabContent.type} not implemented`)
    }

    const currentLiveStream = tabContent.contents.filter((item) => {
      if (item.is(YTNodes.ContinuationItem)) {
        return false
      }

      if (!item.is(YTNodes.RichItem)) {
        throw new Error(`tabContent contents type ${item.type} not implemented`)
      }

      const content = item.content

      if (!content.is(YTNodes.Video)) {
        throw new Error(`tabContent contents content type ${content.type} not implemented`)
      }

      return content.duration.text.toLowerCase() === 'live'
    })

    const isLive = (currentLiveStream ?? []).length > 0

    console.log({ currentLiveStream, isLive })
  },
})
