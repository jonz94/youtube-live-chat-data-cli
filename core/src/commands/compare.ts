import { createClient, type Config } from '@libsql/client'
import { defineCommand } from 'citty'
import { Table, count, inArray, notInArray } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../../db-old/schema'
import {
  oldRawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  oldRawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  oldRawMembershipItem,
  oldRawPaidMessage,
  oldRawPaidSticker,
  oldRawTextMessage,
  oldUsers,
  oldVideos,
} from '../../db-old/schema'
import { db } from '../../db/db'
import {
  rawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  rawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  rawMembershipItem,
  rawPaidMessage,
  rawPaidSticker,
  rawTextMessage,
  users,
  videos,
} from '../../db/schema'
import { difference } from '../polyfills'

export function createDatabase(config: Config) {
  const client = createClient(config)

  return drizzle(client, { schema })
}

async function getCountFromDatabaseTable(database: LibSQLDatabase<any>, tableName: Table) {
  // credits: https://orm.drizzle.team/learn/guides/count-rows
  const result = await database.select({ count: count() }).from(tableName)

  return result[0].count
}

export default defineCommand({
  meta: {
    name: 'compare',
    description: 'Compare database.',
  },
  args: {
    url: {
      description: 'Database url',
      required: true,
      type: 'string',
    },
    token: {
      description: 'Database auth token',
      type: 'string',
    },
    migrate: {
      description: 'Migrate missing old data into new database',
      type: 'boolean',
      default: false,
    },
  },
  run: async ({ args }) => {
    const [
      videosCountResult,
      usersCountResult,
      rawTextMessagesCountResult,
      rawPaidMessagesCountResult,
      rawPaidStickersCountResult,
      rawMembershipItemsCountResult,
      rawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      rawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    ] = await Promise.all([
      getCountFromDatabaseTable(db, videos),
      getCountFromDatabaseTable(db, users),
      getCountFromDatabaseTable(db, rawTextMessage),
      getCountFromDatabaseTable(db, rawPaidMessage),
      getCountFromDatabaseTable(db, rawPaidSticker),
      getCountFromDatabaseTable(db, rawMembershipItem),
      getCountFromDatabaseTable(db, rawLiveChatSponsorshipsGiftPurchaseAnnouncement),
      getCountFromDatabaseTable(db, rawLiveChatSponsorshipsGiftRedemptionAnnouncement),
    ])

    console.log({
      videosCountResult,
      usersCountResult,
      rawTextMessagesCountResult,
      rawPaidMessagesCountResult,
      rawPaidStickersCountResult,
      rawMembershipItemsCountResult,
      rawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      rawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    })

    const oldDb = createDatabase({ url: args.url, authToken: args.token })

    const [
      oldVideosCountResult,
      oldUsersCountResult,
      oldRawTextMessagesCountResult,
      oldRawPaidMessagesCountResult,
      oldRawPaidStickersCountResult,
      oldRawMembershipItemsCountResult,
      oldRawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      oldRawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    ] = await Promise.all([
      getCountFromDatabaseTable(oldDb, oldVideos),
      getCountFromDatabaseTable(oldDb, oldUsers),
      getCountFromDatabaseTable(oldDb, oldRawTextMessage),
      getCountFromDatabaseTable(oldDb, oldRawPaidMessage),
      getCountFromDatabaseTable(oldDb, oldRawPaidSticker),
      getCountFromDatabaseTable(oldDb, oldRawMembershipItem),
      getCountFromDatabaseTable(oldDb, oldRawLiveChatSponsorshipsGiftPurchaseAnnouncement),
      getCountFromDatabaseTable(oldDb, oldRawLiveChatSponsorshipsGiftRedemptionAnnouncement),
    ])

    console.log({
      oldVideosCountResult,
      oldUsersCountResult,
      oldRawTextMessagesCountResult,
      oldRawPaidMessagesCountResult,
      oldRawPaidStickersCountResult,
      oldRawMembershipItemsCountResult,
      oldRawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      oldRawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    })
    console.log()

    const userIds = (await db.select({ channelId: users.channelId }).from(users)).map((record) => record.channelId)
    const oldUserIds = (await oldDb.select({ id: oldUsers.id }).from(oldUsers)).map((record) => record.id)

    const missingUserIdsSet = difference(new Set(oldUserIds), new Set(userIds))

    const missingUsers = await oldDb
      .select()
      .from(oldUsers)
      .where(inArray(oldUsers.id, Array.from(missingUserIdsSet)))

    console.log('missingUsers')
    console.log(missingUsers)
    console.log()

    const rawTextMessageIds = (await db.select({ id: rawTextMessage.id }).from(rawTextMessage)).map(
      (record) => record.id,
    )
    const oldRawTextMessageIds = (await oldDb.select({ id: oldRawTextMessage.id }).from(oldRawTextMessage)).map(
      (record) => record.id,
    )
    const missingRawTextMessageIdsSet = difference(new Set(oldRawTextMessageIds), new Set(rawTextMessageIds))

    const missingRawTextMessages =
      missingRawTextMessageIdsSet.size <= 0
        ? []
        : await oldDb
            .select()
            .from(oldRawTextMessage)
            .where(inArray(oldRawTextMessage.id, Array.from(missingRawTextMessageIdsSet)))

    console.log('missingRawTextMessages')
    console.log(missingRawTextMessages)
    console.log()

    const rawPaidMessageIds = (await db.select({ id: rawPaidMessage.id }).from(rawPaidMessage)).map(
      (record) => record.id,
    )

    const missingRawPaidMessages = await oldDb
      .select()
      .from(oldRawPaidMessage)
      .where(notInArray(oldRawPaidMessage.id, rawPaidMessageIds))

    console.log('missingRawPaidMessages')
    console.log(missingRawPaidMessages)
    console.log()

    const rawPaidStickerIds = (await db.select({ id: rawPaidSticker.id }).from(rawPaidSticker)).map(
      (record) => record.id,
    )

    const missingRawPaidStickers = await oldDb
      .select()
      .from(oldRawPaidSticker)
      .where(notInArray(oldRawPaidSticker.id, rawPaidStickerIds))

    console.log('missingRawPaidStickers')
    console.log(missingRawPaidStickers)
    console.log()

    const rawMembershipItemIds = (await db.select({ id: rawMembershipItem.id }).from(rawMembershipItem)).map(
      (record) => record.id,
    )

    const missingRawMembershipItems = await oldDb
      .select()
      .from(oldRawMembershipItem)
      .where(notInArray(oldRawMembershipItem.id, rawMembershipItemIds))

    console.log('missingRawMembershipItems')
    console.log(missingRawMembershipItems)
    console.log()

    const rawLiveChatSponsorshipsGiftPurchaseAnnouncementIds = (
      await db
        .select({ id: rawLiveChatSponsorshipsGiftPurchaseAnnouncement.id })
        .from(rawLiveChatSponsorshipsGiftPurchaseAnnouncement)
    ).map((record) => record.id)

    const missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements = await oldDb
      .select()
      .from(oldRawLiveChatSponsorshipsGiftPurchaseAnnouncement)
      .where(
        notInArray(
          oldRawLiveChatSponsorshipsGiftPurchaseAnnouncement.id,
          rawLiveChatSponsorshipsGiftPurchaseAnnouncementIds,
        ),
      )

    console.log('missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements')
    console.log(missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements)
    console.log()

    const rawLiveChatSponsorshipsGiftRedemptionAnnouncementIds = (
      await db
        .select({ id: rawLiveChatSponsorshipsGiftRedemptionAnnouncement.id })
        .from(rawLiveChatSponsorshipsGiftRedemptionAnnouncement)
    ).map((record) => record.id)

    const missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements = await oldDb
      .select()
      .from(oldRawLiveChatSponsorshipsGiftRedemptionAnnouncement)
      .where(
        notInArray(
          oldRawLiveChatSponsorshipsGiftRedemptionAnnouncement.id,
          rawLiveChatSponsorshipsGiftRedemptionAnnouncementIds,
        ),
      )

    console.log('missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements')
    console.log(missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements)
    console.log()

    if (args.migrate) {
      if (missingRawTextMessages.length > 0) {
        console.log(`migrate ${missingRawTextMessages.length} missingRawTextMessages`)

        await db.insert(rawTextMessage).values(missingRawTextMessages).onConflictDoNothing()
      }

      if (missingRawPaidMessages.length > 0) {
        console.log(`migrate ${missingRawPaidMessages.length} missingRawPaidMessages`)

        await db.insert(rawPaidMessage).values(missingRawPaidMessages).onConflictDoNothing()
      }

      if (missingRawPaidStickers.length > 0) {
        console.log(`migrate ${missingRawPaidStickers.length} missingRawPaidStickers`)

        await db.insert(rawPaidSticker).values(missingRawPaidStickers).onConflictDoNothing()
      }

      if (missingRawMembershipItems.length > 0) {
        console.log(`migrate ${missingRawMembershipItems.length} missingRawMembershipItems`)

        await db.insert(rawMembershipItem).values(missingRawMembershipItems)
      }

      if (missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements.length > 0) {
        console.log(
          `migrate ${missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements.length} missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements`,
        )

        await db
          .insert(rawLiveChatSponsorshipsGiftPurchaseAnnouncement)
          .values(missingRawLiveChatSponsorshipsGiftPurchaseAnnouncements)
      }

      if (missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements.length > 0) {
        console.log(
          `migrate ${missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements.length} missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements`,
        )

        await db
          .insert(rawLiveChatSponsorshipsGiftRedemptionAnnouncement)
          .values(missingRawLiveChatSponsorshipsGiftRedemptionAnnouncements)
      }

      if (missingUsers.length > 0) {
        console.log(`migrate ${missingUsers.length} missingUsers`)
      }
    }
  },
})
