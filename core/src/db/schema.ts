import { sqliteTable } from 'drizzle-orm/sqlite-core'

export const videos = sqliteTable('videos', (t) => ({
  id: t.text('id').notNull().primaryKey(),
  title: t.text('title'),
  startTimestamp: t.text('start_timestamp'),
  endTimestamp: t.text('end_timestamp'),
  duration: t.integer('duration'),
}))

export const users = sqliteTable('users', (t) => ({
  id: t.integer('id').primaryKey(),
  channelId: t.text('channel_id').notNull().unique(),
  name: t.text('name').notNull(),
  timestamp: t.integer('timestamp').notNull(),
}))

export type InsertUser = typeof users.$inferInsert

export const rawTextMessage = sqliteTable('raw_text_message', (t) => ({
  id: t.text('id').notNull().primaryKey(),
  videoId: t.text('video_id').notNull(),
  userId: t.text('user_id').notNull(),
  timestamp: t.integer('timestamp').notNull(),
  videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

  jsonMessage: t.blob('json_message').notNull(),
}))

export const rawMembershipItem = sqliteTable('raw_membership_item', (t) => ({
  id: t.text('id').notNull().primaryKey(),
  videoId: t.text('video_id').notNull(),
  userId: t.text('user_id').notNull(),
  timestamp: t.integer('timestamp').notNull(),
  videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

  headerPrimaryText: t.text('header_primary_text').notNull(),
  headerSubtext: t.text('header_subtext').notNull(),
  jsonMessage: t.blob('json_message').notNull(),
}))

export const rawPaidMessage = sqliteTable('raw_paid_message', (t) => ({
  id: t.text('id').notNull().primaryKey(),
  videoId: t.text('video_id').notNull(),
  userId: t.text('user_id').notNull(),
  timestamp: t.integer('timestamp').notNull(),
  videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

  headerBackgroundColor: t.integer('header_background_color').notNull(),
  headerTextColor: t.integer('header_text_color').notNull(),
  bodyBackgroundColor: t.integer('body_background_color').notNull(),
  bodyTextColor: t.integer('body_text_color').notNull(),

  purchaseAmount: t.text('purchase_amount').notNull(),
  jsonMessage: t.blob('json_message').notNull(),
}))

export const rawPaidSticker = sqliteTable('raw_paid_sticker', (t) => ({
  id: t.text('id').notNull().primaryKey(),
  videoId: t.text('video_id').notNull(),
  userId: t.text('user_id').notNull(),
  timestamp: t.integer('timestamp').notNull(),
  videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

  moneyChipBackgroundColor: t.integer('money_chip_background_color').notNull(),
  moneyChipTextColor: t.integer('money_chip_text_color').notNull(),
  backgroundColor: t.integer('background_color').notNull(),
  authorNameTextColor: t.integer('author_name_text_color').notNull(),

  purchaseAmount: t.text('purchase_amount').notNull(),
  jsonSticker: t.blob('json_sticker').notNull(),
}))

export const rawLiveChatSponsorshipsGiftPurchaseAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_purchase_announcement',
  (t) => ({
    id: t.text('id').notNull().primaryKey(),
    videoId: t.text('video_id').notNull(),
    userId: t.text('user_id').notNull(),
    timestampUsec: t.text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

    headerPrimaryText: t.text('header_primary_text').notNull(),
  }),
)

export const rawLiveChatSponsorshipsGiftRedemptionAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_redemption_announcement',
  (t) => ({
    id: t.text('id').notNull().primaryKey(),
    videoId: t.text('video_id').notNull(),
    userId: t.text('user_id').notNull(),
    timestampUsec: t.text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: t.text('video_offset_time_msec').notNull(),

    jsonMessage: t.text('json_message').notNull(),
  }),
)
