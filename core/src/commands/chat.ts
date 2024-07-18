import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { db } from '~/db/db'
import {
  rawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  rawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  rawMembershipItem,
  rawPaidMessage,
  rawPaidSticker,
  rawTextMessage,
  users,
} from '~/db/schema'
import { createInnertubeClient } from '~/utils'

function convertTimestampUsec2timestamp(timestampUsec: string) {
  return Number(timestampUsec.slice(0, -3))
}

async function parseReplayChatItemAction(replayChatItemAction: YTNodes.ReplayChatItemAction, videoId: string) {
  for (const action of replayChatItemAction.actions) {
    switch (action.type) {
      case YTNodes.AddChatItemAction.type:
        const addChatItemAction = action.as(YTNodes.AddChatItemAction)
        const item = addChatItemAction.item

        switch (item.type) {
          case YTNodes.LiveChatTextMessage.type: {
            const liveChatTextMessage = item.as(YTNodes.LiveChatTextMessage)

            const { id, name } = liveChatTextMessage.author
            const timestamp = liveChatTextMessage.timestamp

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawTextMessage)
                .values({
                  id: liveChatTextMessage.id,
                  userId: id,
                  videoId,
                  timestamp,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,
                  jsonMessage: JSON.stringify(liveChatTextMessage.message),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatMembershipItem.type: {
            const liveChatMembershipItem = item.as(YTNodes.LiveChatMembershipItem)

            const { id, name } = liveChatMembershipItem.author
            const timestamp = liveChatMembershipItem.timestamp

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawMembershipItem)
                .values({
                  id: liveChatMembershipItem.id,
                  userId: id,
                  videoId,
                  timestamp,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,
                  headerPrimaryText: liveChatMembershipItem.header_primary_text.toString(),
                  headerSubtext: liveChatMembershipItem.header_subtext.toString(),
                  jsonMessage: JSON.stringify(liveChatMembershipItem.message),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatPaidMessage.type: {
            const liveChatPaidMessage = item.as(YTNodes.LiveChatPaidMessage)

            const { id, name } = liveChatPaidMessage.author
            const timestamp = liveChatPaidMessage.timestamp

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawPaidMessage)
                .values({
                  id: liveChatPaidMessage.id,
                  userId: id,
                  videoId,
                  timestamp,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,

                  headerBackgroundColor: liveChatPaidMessage.header_background_color,
                  headerTextColor: liveChatPaidMessage.header_text_color,
                  bodyBackgroundColor: liveChatPaidMessage.body_background_color,
                  bodyTextColor: liveChatPaidMessage.body_text_color,

                  purchaseAmount: liveChatPaidMessage.purchase_amount,
                  jsonMessage: JSON.stringify(liveChatPaidMessage.message),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatPaidSticker.type: {
            const liveChatPaidSticker = item.as(YTNodes.LiveChatPaidSticker)

            const { id, name } = liveChatPaidSticker.author
            const timestamp = liveChatPaidSticker.timestamp

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawPaidSticker)
                .values({
                  id: liveChatPaidSticker.id,
                  userId: id,
                  videoId,
                  timestamp,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,

                  moneyChipBackgroundColor: liveChatPaidSticker.money_chip_background_color,
                  moneyChipTextColor: liveChatPaidSticker.money_chip_text_color,
                  backgroundColor: liveChatPaidSticker.background_color,
                  authorNameTextColor: liveChatPaidSticker.author_name_text_color,

                  purchaseAmount: liveChatPaidSticker.purchase_amount,
                  jsonSticker: JSON.stringify(liveChatPaidSticker.sticker),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type: {
            const liveChatSponsorshipsGiftPurchaseAnnouncement = item.as(
              YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement,
            )

            const { header } = liveChatSponsorshipsGiftPurchaseAnnouncement

            if (!header) {
              break
            }

            const id = liveChatSponsorshipsGiftPurchaseAnnouncement.author_external_channel_id
            const name = header.author_name.toString()
            const timestamp = convertTimestampUsec2timestamp(
              liveChatSponsorshipsGiftPurchaseAnnouncement.timestamp_usec,
            )

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawLiveChatSponsorshipsGiftPurchaseAnnouncement)
                .values({
                  id: liveChatSponsorshipsGiftPurchaseAnnouncement.id,
                  userId: id,
                  videoId,
                  timestampUsec: liveChatSponsorshipsGiftPurchaseAnnouncement.timestamp_usec,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,

                  headerPrimaryText: header.primary_text.toString(),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement.type: {
            const liveChatSponsorshipsGiftRedemptionAnnouncement = item.as(
              YTNodes.LiveChatSponsorshipsGiftRedemptionAnnouncement,
            )

            const id = liveChatSponsorshipsGiftRedemptionAnnouncement.author_external_channel_id
            const name = liveChatSponsorshipsGiftRedemptionAnnouncement.author_name.toString()
            const timestamp = convertTimestampUsec2timestamp(
              liveChatSponsorshipsGiftRedemptionAnnouncement.timestamp_usec,
            )

            await Promise.all([
              db.insert(users).values({ channelId: id, name, timestamp }).onConflictDoNothing(),

              db
                .insert(rawLiveChatSponsorshipsGiftRedemptionAnnouncement)
                .values({
                  id: liveChatSponsorshipsGiftRedemptionAnnouncement.id,
                  userId: id,
                  videoId,
                  timestampUsec: liveChatSponsorshipsGiftRedemptionAnnouncement.timestamp_usec,
                  videoOffsetTimeMsec: replayChatItemAction.video_offset_time_msec,

                  jsonMessage: JSON.stringify(liveChatSponsorshipsGiftRedemptionAnnouncement.message),
                })
                .onConflictDoNothing(),
            ])

            break
          }

          case YTNodes.LiveChatViewerEngagementMessage.type:
            // do nothing
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
  }
}

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

    if (isLive || isUpcoming) {
      console.log(`🚧 skip ongoing/upcoming live streams: (${videoUrl})`)
      console.log()
      console.log(`\t${title}`)
      console.log()

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
            const replayChatItemAction = chatAction.as(YTNodes.ReplayChatItemAction)

            parseReplayChatItemAction(replayChatItemAction, videoId)

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
      switch (chatAction.type) {
        case YTNodes.ReplayChatItemAction.type:
          const replayChatItemAction = chatAction.as(YTNodes.ReplayChatItemAction)

          parseReplayChatItemAction(replayChatItemAction, videoId)

          break

        default:
          console.log(`🚧 [${YTNodes.ReplayChatItemAction.type}] ${chatAction.type}`)
          break
      }
    })

    livechat.on('end', async () => {
      livechat.stop()

      console.log('✅ successfully fetched data from video')
    })

    livechat.start()
  },
})
