import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { db } from '../../db/db'
import { authors, type InsertAuthor } from '../../db/schema'
import { createInnertubeClient } from '../utils'

export default defineCommand({
  meta: {
    name: 'chat',
    description: 'Fetch all live chat data from a YouTube live stream.',
  },
  args: {
    vid: {
      description: 'YouTube Video Id',
      required: true,
      type: 'string',
    },
    verbose: {
      description: 'log more information',
      type: 'boolean',
    },
  },
  run: async ({ args }) => {
    const existingAuthorIds = new Set((await db.select({ id: authors.id }).from(authors)).map((author) => author.id))

    const newAuthors = new Map<InsertAuthor['id'], InsertAuthor>()

    const youtube = await createInnertubeClient()

    const videoUrl = `https://www.youtube.com/watch?v=${args.vid}`
    const video = await youtube.getInfo(args.vid)

    const {
      is_live: isLive,
      is_upcoming: isUpcoming,
      title,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
      duration,
    } = video.basic_info

    if (isLive || isUpcoming) {
      console.log(`🚧 skip ongoing/upcoming live streams`)

      return
    }

    if (args.verbose) {
      const videoInfo = {
        isLive,
        isUpcoming,
        title,
        startTimestamp,
        endTimestamp,
        duration,
      }

      console.log(`🚀 start fetching data from video: (${videoUrl})`)
      console.log(JSON.stringify(videoInfo, null, 2))
      console.log()
    } else {
      console.log(`🚀 start fetching data from video: (${videoUrl})`)
      console.log()
      console.log(`\t${title}`)
      console.log()
    }

    const livechat = video.getLiveChat()

    livechat.once('start', (initialData) => {
      initialData.actions.forEach((chatAction) => {
        switch (chatAction.type) {
          case YTNodes.ReplayChatItemAction.type:
            chatAction.as(YTNodes.ReplayChatItemAction).actions.forEach((action) => {
              switch (action.type) {
                case YTNodes.AddChatItemAction.type:
                  const item = action.as(YTNodes.AddChatItemAction).item
                  switch (item.type) {
                    case YTNodes.LiveChatTextMessage.type:
                      const { id, name } = item.as(YTNodes.LiveChatTextMessage).author

                      // chatAction.as(YTNodes.ReplayChatItemAction).video_offset_time_msec

                      if (!existingAuthorIds.has(id)) {
                        existingAuthorIds.add(id)

                        newAuthors.set(id, { id, name })
                      }
                      break

                    case YTNodes.LiveChatMembershipItem.type:
                    case YTNodes.LiveChatPaidMessage.type:
                    case YTNodes.LiveChatPaidSticker.type:
                    case YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type:
                    case YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement.type:
                    case YTNodes.LiveChatViewerEngagementMessage.type:
                      // not implement yet
                      break

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
            })
            break

          default:
            console.log(`🚧 [${YTNodes.ReplayChatItemAction.type}] ${chatAction.type}`)
            break
        }
      })

      livechat.applyFilter('LIVE_CHAT')
    })

    livechat.on('error', (error) => {
      // console.info('Live chat error:', error)
    })

    livechat.on('chat-update', async (chatAction) => {
      // console.log(JSON.stringify(chatAction, null, 2))

      switch (chatAction.type) {
        case YTNodes.ReplayChatItemAction.type:
          chatAction.as(YTNodes.ReplayChatItemAction).actions.forEach((action) => {
            switch (action.type) {
              case YTNodes.AddChatItemAction.type:
                const item = action.as(YTNodes.AddChatItemAction).item
                switch (item.type) {
                  case YTNodes.LiveChatTextMessage.type: {
                    const { id, name } = item.as(YTNodes.LiveChatTextMessage).author

                    // chatAction.as(YTNodes.ReplayChatItemAction).video_offset_time_msec

                    if (!existingAuthorIds.has(id)) {
                      existingAuthorIds.add(id)

                      newAuthors.set(id, { id, name })
                    }
                    break
                  }

                  case YTNodes.LiveChatMembershipItem.type:
                  case YTNodes.LiveChatPaidMessage.type:
                  case YTNodes.LiveChatPaidSticker.type:
                  case YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type:
                  case YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement.type:
                  case YTNodes.LiveChatViewerEngagementMessage.type:
                    // not implement yet
                    break

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
          })
          break

        default:
          console.log(`🚧 [${YTNodes.ReplayChatItemAction.type}] ${chatAction.type}`)
          break
      }
    })

    livechat.on('end', async () => {
      livechat.stop()

      const records = Array.from(newAuthors.values())

      if (records.length <= 0) {
        console.log('✅ all data is up-to-date')
        return
      }

      await db.insert(authors).values(records)

      if (args.verbose) {
        console.log(`✨ added new ${records.length} authors:`)
        console.log(JSON.stringify(records, null, 2))
        console.log()
      } else {
        console.log(`✨ added new ${records.length} authors`)
        console.log()
      }

      console.log('✅ successfully fetched data from video')
    })

    livechat.start()
  },
})
