import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { env } from '~/env'
import { createInnertubeClient, getAccountName } from '~/utils'

function parseAddChatItemAction(action: YTNodes.AddChatItemAction, callback: (name: string, amount: number) => void) {
  switch (action.type) {
    case YTNodes.AddChatItemAction.type:
      const addChatItemAction = action.as(YTNodes.AddChatItemAction)
      const item = addChatItemAction.item

      switch (item.type) {
        case YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type: {
          const liveChatSponsorshipsGiftPurchaseAnnouncement = item.as(
            YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement,
          )

          const { header } = liveChatSponsorshipsGiftPurchaseAnnouncement

          if (!header) {
            break
          }

          const name = header.author_name.toString()
          const headerPrimaryText = header.primary_text.toString()

          console.log({ name, headerPrimaryText })

          const amount = Number.parseInt(headerPrimaryText.split(' ').at(1) ?? '0', 10)

          if (amount === 0) {
            break
          }

          callback(name, amount)

          break
        }

        case YTNodes.LiveChatTextMessage.type:
        case YTNodes.LiveChatMembershipItem.type:
        case YTNodes.LiveChatPaidMessage.type:
        case YTNodes.LiveChatPaidSticker.type:
        case YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement.type:
        case YTNodes.LiveChatViewerEngagementMessage.type: {
          // do nothing
          break
        }

        default:
          console.log(`🚧 [${YTNodes.LiveChatTextMessage.type}] ${item.type}`)
          break
      }
      break

    case YTNodes.AddLiveChatTickerItemAction.type:
    case YTNodes.AddBannerToLiveChatCommand.type:
    case YTNodes.RemoveBannerForLiveChatCommand.type:
      // not implement yet
      break

    default:
      console.log(`🚧 [${YTNodes.AddChatItemAction.type}] ${action.type}`)
      break
  }
}

export default defineCommand({
  meta: {
    description: 'Running bot that will notice important message in live chat.',
  },
  args: {
    vid: {
      description: 'YouTube Video Id',
      required: true,
      type: 'string',
    },
    cookie: {
      description: 'Use cookie',
      type: 'boolean',
      default: true,
    },
    count: {
      description: 'Count gifted memberships',
      type: 'boolean',
      default: false,
    },
    total: {
      description: 'Initial value for total number of gifted memberships',
      type: 'string',
      default: '0',
    },
    silent: {
      description: 'Do not send message in live chat',
      type: 'boolean',
      default: false,
    },
    debug: {
      description: 'Send hi after connection into live chat as dubugging purpose',
      type: 'boolean',
      default: false,
    },
  },
  run: async ({ args }) => {
    const youtube = await (function createClient() {
      if (!args.cookie) {
        return createInnertubeClient()
      }

      if (!env.COOKIE) {
        throw new Error('Missing environment variables COOKIE')
      }

      return createInnertubeClient({
        cookie: env.COOKIE,
      })
    })()

    console.log('is logged in?', youtube.session.logged_in)

    if (!args.cookie) {
      // Fired when waiting for the user to authorize the sign in attempt.
      youtube.session.on('auth-pending', (data) => {
        console.log(`Go to ${data.verification_url} in your browser and enter code ${data.user_code} to authenticate.`)
        console.log({ data })
      })

      // Fired when authentication is successful.
      youtube.session.on('auth', ({ credentials }) => {
        // console.log('Sign in successful:', credentials)
      })

      // Fired when the access token expires.
      youtube.session.on('update-credentials', async ({ credentials }) => {
        // console.log('Credentials updated:', credentials)
        await youtube.session.oauth.cacheCredentials()
      })

      await youtube.session.signIn()

      // You may cache the session for later use
      // If you use this, the next call to signIn won't fire 'auth-pending' instead just 'auth'.
      await youtube.session.oauth.cacheCredentials()

      console.log('is logged in?', youtube.session.logged_in)
    }

    if (!youtube.session.logged_in) {
      return
    }

    const accountName = await getAccountName(youtube)

    console.log('logged in as', accountName)
    console.log()

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

    let total = 0

    if (args.count) {
      total = Number.parseInt(args.total, 10)
    }

    const livechat = video.getLiveChat()

    // NOTE: debug purpose
    if (args.debug) {
      livechat.once('start', async () => {
        await livechat.sendMessage('hi')
      })
    }

    livechat.on('error', (error) => {
      console.info('Live chat error:', error)
      console.trace(error)
    })

    livechat.on('end', () => {
      console.info('This live stream has ended.')
      livechat.stop()
    })

    livechat.on('chat-update', async (action) => {
      if (args.count && action.is(YTNodes.AddChatItemAction)) {
        parseAddChatItemAction(action, async (name, amount) => {
          total = total + amount
          await livechat
            .sendMessage(`感謝 ${name} 種了 ${amount} 個貓草，本次直播已經累積種了 ${total} 個貓草`)
            .catch((error) => console.error(error))
        })
        return
      }

      if (!action.is(YTNodes.AddBannerToLiveChatCommand)) {
        return
      }

      console.log('debug')
      console.log()
      console.log(JSON.stringify(action, null, 2))
      console.log()

      const contents = action.banner?.contents

      if (!contents) {
        return
      }

      if (!contents.is(YTNodes.LiveChatBannerRedirect)) {
        return
      }

      const bannerMessage = contents.banner_message.toString()
      const KEYWORDS = ' and their viewers just joined. Say hello!' as const

      if (!bannerMessage.includes(KEYWORDS)) {
        return
      }

      const channelName = bannerMessage.replace(KEYWORDS, '')

      if (!args.silent) {
        await livechat.sendMessage(`歡迎【${channelName}】醬肉～`).catch((error) => console.error(error))
      }
    })

    livechat.start()
  },
})
