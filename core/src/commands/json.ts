import { defineCommand } from 'citty'
import { asc, eq } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { db } from '~/db/db'
import {
  rawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  rawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  rawMembershipItem,
  rawPaidMessage,
  rawPaidSticker,
  rawTextMessage,
  users,
  videos,
} from '~/db/schema'
import { getProjectRoot } from '~/utils'

export default defineCommand({
  meta: {
    name: 'json',
    description: 'Write database data into json files.',
  },
  run: async () => {
    const outputDir = resolve(getProjectRoot(), 'outputs')
    mkdirSync(outputDir, { recursive: true })

    // videos
    const videoData = await db.select().from(videos)
    const videoOutputPath = resolve(outputDir, 'videos.json')
    writeFileSync(videoOutputPath, JSON.stringify(videoData), 'utf-8')

    const channelData = await db.select().from(users)

    const total = channelData.length
    let count = 0

    for (const channel of channelData) {
      const channelId = channel.channelId

      count++
      console.log(`(${count}/${total}) ${channelId}`)

      const userOutputDir = resolve(getProjectRoot(), 'outputs', channelId)
      mkdirSync(userOutputDir, { recursive: true })

      // raw text message
      const rawTextMessageData = await db
        .select()
        .from(rawTextMessage)
        .where(eq(rawTextMessage.userId, channelId))
        .orderBy(asc(rawTextMessage.timestamp))

      const userRawTextMessageOutputPath = resolve(userOutputDir, 'raw-text-messages.json')

      writeFileSync(userRawTextMessageOutputPath, JSON.stringify(rawTextMessageData), 'utf-8')

      // raw membership items
      const rawMembershipItemData = await db
        .select()
        .from(rawMembershipItem)
        .where(eq(rawMembershipItem.userId, channelId))
        .orderBy(asc(rawMembershipItem.timestamp))

      const userRawMembershipItemOutputPath = resolve(userOutputDir, 'raw-membership-items.json')

      writeFileSync(userRawMembershipItemOutputPath, JSON.stringify(rawMembershipItemData), 'utf-8')

      // raw paid message
      const rawPaidMessageData = await db
        .select()
        .from(rawPaidMessage)
        .where(eq(rawPaidMessage.userId, channelId))
        .orderBy(asc(rawPaidMessage.timestamp))

      const userRawPaidMessageOutputPath = resolve(userOutputDir, 'raw-paid-messages.json')

      writeFileSync(userRawPaidMessageOutputPath, JSON.stringify(rawPaidMessageData), 'utf-8')

      // raw paid sticker
      const rawPaidStickerData = await db
        .select()
        .from(rawPaidSticker)
        .where(eq(rawPaidSticker.userId, channelId))
        .orderBy(asc(rawPaidSticker.timestamp))

      const userRawPaidStickerOutputPath = resolve(userOutputDir, 'raw-paid-stickers.json')

      writeFileSync(userRawPaidStickerOutputPath, JSON.stringify(rawPaidStickerData), 'utf-8')

      // raw live chat sponsorships gift purchase announcement
      const rawLiveChatSponsorshipsGiftPurchaseAnnouncementData = await db
        .select()
        .from(rawLiveChatSponsorshipsGiftPurchaseAnnouncement)
        .where(eq(rawLiveChatSponsorshipsGiftPurchaseAnnouncement.userId, channelId))
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
        .where(eq(rawLiveChatSponsorshipsGiftRedemptionAnnouncement.userId, channelId))
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
