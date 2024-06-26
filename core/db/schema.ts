import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const videos = sqliteTable('videos', {
  id: text('id').notNull().primaryKey(),
  title: text('title'),
  startTimestamp: text('start_timestamp'),
  endTimestamp: text('end_timestamp'),
  duration: integer('duration'),
})

export const users = sqliteTable('users', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
})

export type InsertUser = typeof users.$inferInsert

export const rawTextMessage = sqliteTable('raw_text_message', {
  id: text('id').notNull().primaryKey(),
  videoId: text('video_id').notNull(),
  userId: text('user_id').notNull(),
  timestamp: integer('timestamp').notNull(),
  videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

  jsonMessage: blob('json_message').notNull(),
})

export const rawMembershipItem = sqliteTable('raw_membership_item', {
  id: text('id').notNull().primaryKey(),
  videoId: text('video_id').notNull(),
  userId: text('user_id').notNull(),
  timestamp: integer('timestamp').notNull(),
  videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

  headerPrimaryText: text('header_primary_text').notNull(),
  headerSubtext: text('header_subtext').notNull(),
  jsonMessage: blob('json_message').notNull(),
})

export const rawPaidMessage = sqliteTable('raw_paid_message', {
  id: text('id').notNull().primaryKey(),
  videoId: text('video_id').notNull(),
  userId: text('user_id').notNull(),
  timestamp: integer('timestamp').notNull(),
  videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

  headerBackgroundColor: integer('header_background_color').notNull(),
  headerTextColor: integer('header_text_color').notNull(),
  bodyBackgroundColor: integer('body_background_color').notNull(),
  bodyTextColor: integer('body_text_color').notNull(),

  purchaseAmount: text('purchase_amount').notNull(),
  jsonMessage: blob('json_message').notNull(),
})

export const rawPaidSticker = sqliteTable('raw_paid_sticker', {
  id: text('id').notNull().primaryKey(),
  videoId: text('video_id').notNull(),
  userId: text('user_id').notNull(),
  timestamp: integer('timestamp').notNull(),
  videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

  moneyChipBackgroundColor: integer('money_chip_background_color').notNull(),
  moneyChipTextColor: integer('money_chip_text_color').notNull(),
  backgroundColor: integer('background_color').notNull(),
  authorNameTextColor: integer('author_name_text_color').notNull(),

  purchaseAmount: text('purchase_amount').notNull(),
  jsonSticker: blob('json_sticker').notNull(),
})

export const rawLiveChatSponsorshipsGiftPurchaseAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_purchase_announcement',
  {
    id: text('id').notNull().primaryKey(),
    videoId: text('video_id').notNull(),
    userId: text('user_id').notNull(),
    timestampUsec: text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

    headerPrimaryText: text('header_primary_text').notNull(),
  },
)

export const rawLiveChatSponsorshipsGiftRedemptionAnnouncement = sqliteTable(
  'raw_live_chat_sponsorships_gift_redemption_announcement',
  {
    id: text('id').notNull().primaryKey(),
    videoId: text('video_id').notNull(),
    userId: text('user_id').notNull(),
    timestampUsec: text('timestamp_usec').notNull(),
    videoOffsetTimeMsec: text('video_offset_time_msec').notNull(),

    jsonMessage: text('json_message').notNull(),
  },
)
