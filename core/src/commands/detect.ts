import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { env } from '~/env'
import { createInnertubeClient } from '~/utils'

const BLACKLISTED_ACCOUNTS = env.BLACKLISTED_ACCOUNTS

function parseAddChatItemAction(action: YTNodes.AddChatItemAction) {
  const addChatItemAction = action.as(YTNodes.AddChatItemAction)
  const item = addChatItemAction.item

  switch (item.type) {
    case YTNodes.LiveChatTextMessage.type: {
      const liveChatTextMessage = item.as(YTNodes.LiveChatTextMessage)

      const { id, name } = liveChatTextMessage.author

      if (BLACKLISTED_ACCOUNTS.includes(id)) {
        console.log('👀 偵測到偽裝 VTuber 的假帳號')
        console.log(name)
        console.log(`https://www.youtube.com/channel/${id}`)
        console.log()
      }

      break
    }

    case YTNodes.LiveChatMembershipItem.type:
    case YTNodes.LiveChatPaidMessage.type:
    case YTNodes.LiveChatPaidSticker.type:
    case YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type:
    case YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement.type:
    case YTNodes.LiveChatViewerEngagementMessage.type:
      // do nothing
      break

    default:
      console.log(`🚧 [${YTNodes.LiveChatTextMessage.type}] ${item.type}`)
      break
  }
}

export default defineCommand({
  meta: {
    name: 'detect',
    description: 'Running bot that will detect blacklisted accounts in live chat.',
  },
  args: {
    vid: {
      description: 'YouTube Video Id',
      required: true,
      type: 'string',
    },
  },
  run: async ({ args }) => {
    const youtube = await createInnertubeClient()

    const videoId = args.vid
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const video = await youtube.getInfo(videoId)

    const {
      is_live: isLive,
      is_upcoming: isUpcoming,
      title,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
      duration,
    } = video.basic_info

    if (args.verbose) {
      const videoInfo = {
        isLive,
        isUpcoming,
        title,
        startTimestamp,
        endTimestamp,
        duration,
      }

      console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
      console.log(JSON.stringify(videoInfo, null, 2))
      console.log()
    } else {
      console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
      console.log()
      console.log(`\t${title}`)
      console.log()
    }

    if (!isLive && !isUpcoming) {
      console.log(`🚧 only ongoing/upcoming live streams need this feature...`)

      return
    }

    const livechat = video.getLiveChat()

    livechat.on('error', (error) => {
      console.info('Live chat error:', error)
      console.trace(error)
    })

    livechat.on('end', () => {
      console.info('This live stream has ended.')
      livechat.stop()
    })

    livechat.on('chat-update', async (action) => {
      if (!action.is(YTNodes.AddChatItemAction)) {
        return
      }

      parseAddChatItemAction(action)
    })

    livechat.start()
  },
})
