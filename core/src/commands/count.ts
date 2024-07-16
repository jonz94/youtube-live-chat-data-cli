import { defineCommand } from 'citty'
import { Table, count } from 'drizzle-orm'
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

async function getCountFromDatabaseTable(tableName: Table) {
  // credits: https://orm.drizzle.team/learn/guides/count-rows
  const result = await db.select({ count: count() }).from(tableName)

  return result[0].count
}

export default defineCommand({
  meta: {
    name: 'count',
    description: 'Count the number of data for each data type.',
  },
  run: async () => {
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
      getCountFromDatabaseTable(videos),
      getCountFromDatabaseTable(users),
      getCountFromDatabaseTable(rawTextMessage),
      getCountFromDatabaseTable(rawPaidMessage),
      getCountFromDatabaseTable(rawPaidSticker),
      getCountFromDatabaseTable(rawMembershipItem),
      getCountFromDatabaseTable(rawLiveChatSponsorshipsGiftPurchaseAnnouncement),
      getCountFromDatabaseTable(rawLiveChatSponsorshipsGiftRedemptionAnnouncement),
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
  },
})
