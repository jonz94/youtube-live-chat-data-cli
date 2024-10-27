import { sqliteTable } from 'drizzle-orm/sqlite-core'

export const videos = sqliteTable('videos', (c) => ({
  id: c.text('id').notNull().primaryKey(),
  title: c.text('title'),
  startTimestamp: c.text('start_timestamp'),
  endTimestamp: c.text('end_timestamp'),
  duration: c.integer('duration'),
}))

export const users = sqliteTable('users', (c) => ({
  id: c.integer('id').primaryKey(),
  channelId: c.text('channel_id').notNull().unique(),
  name: c.text('name').notNull(),
  timestamp: c.integer('timestamp').notNull(),
}))

export type InsertUser = typeof users.$inferInsert

export const rawTextMessage = sqliteTable('raw_text_message', (c) => ({
  id: c.text('id').notNull().primaryKey(),
  videoId: c.text('video_id').notNull(),
  userId: c.text('user_id').notNull(),
  timestamp: c.integer('timestamp').notNull(),
  videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

  jsonMessage: c.blob('json_message').notNull(),
}))

export const rawMembershipItem = sqliteTable('raw_membership_item', (c) => ({
  id: c.text('id').notNull().primaryKey(),
  videoId: c.text('video_id').notNull(),
  userId: c.text('user_id').notNull(),
  timestamp: c.integer('timestamp').notNull(),
  videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

  headerPrimaryText: c.text('header_primary_text').notNull(),
  headerSubtext: c.text('header_subtext').notNull(),
  jsonMessage: c.blob('json_message').notNull(),
}))

export const rawPaidMessage = sqliteTable('raw_paid_message', (c) => ({
  id: c.text('id').notNull().primaryKey(),
  videoId: c.text('video_id').notNull(),
  userId: c.text('user_id').notNull(),
  timestamp: c.integer('timestamp').notNull(),
  videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

  headerBackgroundColor: c.integer('header_background_color').notNull(),
  headerTextColor: c.integer('header_text_color').notNull(),
  bodyBackgroundColor: c.integer('body_background_color').notNull(),
  bodyTextColor: c.integer('body_text_color').notNull(),

  purchaseAmount: c.text('purchase_amount').notNull(),
  jsonMessage: c.blob('json_message').notNull(),
}))

export const rawPaidSticker = sqliteTable('raw_paid_sticker', (c) => ({
  id: c.text('id').notNull().primaryKey(),
  videoId: c.text('video_id').notNull(),
  userId: c.text('user_id').notNull(),
  timestamp: c.integer('timestamp').notNull(),
  videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

  moneyChipBackgroundColor: c.integer('money_chip_background_color').notNull(),
  moneyChipTextColor: c.integer('money_chip_text_color').notNull(),
  backgroundColor: c.integer('background_color').notNull(),
  authorNameTextColor: c.integer('author_name_text_color').notNull(),

  purchaseAmount: c.text('purchase_amount').notNull(),
  jsonSticker: c.blob('json_sticker').notNull(),
}))

export const rawLiveChatSponsorshipsGiftPurchaseAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_purchase_announcement',
  (c) => ({
    id: c.text('id').notNull().primaryKey(),
    videoId: c.text('video_id').notNull(),
    userId: c.text('user_id').notNull(),
    timestampUsec: c.text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

    headerPrimaryText: c.text('header_primary_text').notNull(),
  }),
)

export const rawLiveChatSponsorshipsGiftRedemptionAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_redemption_announcement',
  (c) => ({
    id: c.text('id').notNull().primaryKey(),
    videoId: c.text('video_id').notNull(),
    userId: c.text('user_id').notNull(),
    timestampUsec: c.text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: c.text('video_offset_time_msec').notNull(),

    jsonMessage: c.text('json_message').notNull(),
  }),
)
