import { defineCommand } from 'citty'
import { asc, eq } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { db } from '../../db/db'
import {
  channels,
  rawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  rawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  rawMembershipItem,
  rawPaidMessage,
  rawPaidSticker,
  rawTextMessage,
  videos,
} from '../../db/schema'
import { getProjectRoot } from '../utils'

export default defineCommand({
  meta: {
    name: 'json',
    description: 'Write database data into json files',
  },
  run: async () => {
    const outputDir = resolve(getProjectRoot(), 'outputs')
    mkdirSync(outputDir, { recursive: true })

    // videos
    const videoData = await db.select().from(videos)
    const videoOutputPath = resolve(outputDir, 'videos.json')
    writeFileSync(videoOutputPath, JSON.stringify(videoData), 'utf-8')

    // channels
    const channelData = await db.select().from(channels)
    const channelOutputPath = resolve(outputDir, 'channels.json')
    writeFileSync(channelOutputPath, JSON.stringify(channelData), 'utf-8')

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

      writeFileSync(userChannelOutputPath, JSON.stringify(channel), 'utf-8')

      // raw text message
      const rawTextMessageData = await db
        .select()
        .from(rawTextMessage)
        .where(eq(rawTextMessage.userId, userId))
        .orderBy(asc(rawTextMessage.timestamp))

      const userRawTextMessageOutputPath = resolve(userOutputDir, 'raw-text-messages.json')

      writeFileSync(userRawTextMessageOutputPath, JSON.stringify(rawTextMessageData), 'utf-8')

      // raw membership items
      const rawMembershipItemData = await db
        .select()
        .from(rawMembershipItem)
        .where(eq(rawMembershipItem.userId, userId))
        .orderBy(asc(rawMembershipItem.timestamp))

      const userRawMembershipItemOutputPath = resolve(userOutputDir, 'raw-membership-items.json')

      writeFileSync(userRawMembershipItemOutputPath, JSON.stringify(rawMembershipItemData), 'utf-8')

      // raw paid message
      const rawPaidMessageData = await db
        .select()
        .from(rawPaidMessage)
        .where(eq(rawPaidMessage.userId, userId))
        .orderBy(asc(rawPaidMessage.timestamp))

      const userRawPaidMessageOutputPath = resolve(userOutputDir, 'raw-paid-messages.json')

      writeFileSync(userRawPaidMessageOutputPath, JSON.stringify(rawPaidMessageData), 'utf-8')

      // raw paid sticker
      const rawPaidStickerData = await db
        .select()
        .from(rawPaidSticker)
        .where(eq(rawPaidSticker.userId, userId))
        .orderBy(asc(rawPaidSticker.timestamp))

      const userRawPaidStickerOutputPath = resolve(userOutputDir, 'raw-paid-stickers.json')

      writeFileSync(userRawPaidStickerOutputPath, JSON.stringify(rawPaidStickerData), 'utf-8')

      // raw live chat sponsorships gift purchase announcement
      const rawLiveChatSponsorshipsGiftPurchaseAnnouncementData = await db
        .select()
        .from(rawLiveChatSponsorshipsGiftPurchaseAnnouncement)
        .where(eq(rawLiveChatSponsorshipsGiftPurchaseAnnouncement.userId, userId))
        .orderBy(asc(rawLiveChatSponsorshipsGiftPurchaseAnnouncement.timestampUsec))

      const userLiveChatSponsorshipsGiftPurchaseAnnouncementOutputPath = resolve(
        userOutputDir,
        'raw-live-chat-sponsorships-gift-purchase-announcement.json',
      )

      writeFileSync(
        userLiveChatSponsorshipsGiftPurchaseAnnouncementOutputPath,
        JSON.stringify(rawLiveChatSponsorshipsGiftPurchaseAnnouncementData),
        'utf-8',
      )

      // raw live chat sponsorships gift redemption announcements
      const rawLiveChatSponsorshipsGiftRedemptionAnnouncementData = await db
        .select()
        .from(rawLiveChatSponsorshipsGiftRedemptionAnnouncement)
        .where(eq(rawLiveChatSponsorshipsGiftRedemptionAnnouncement.userId, userId))
        .orderBy(asc(rawLiveChatSponsorshipsGiftRedemptionAnnouncement.timestampUsec))

      const userLiveChatSponsorshipsGiftRedemptionAnnouncementOutputPath = resolve(
        userOutputDir,
        'raw-live-chat-sponsorships-gift-redemption-announcements.json',
      )

      writeFileSync(
        userLiveChatSponsorshipsGiftRedemptionAnnouncementOutputPath,
        JSON.stringify(rawLiveChatSponsorshipsGiftRedemptionAnnouncementData),
        'utf-8',
      )
    }
  },
})
