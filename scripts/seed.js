/* eslint-disable no-console */
const dotenv = require('dotenv')
dotenv.config()
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()
import { users } from './userSeed'
import { groups } from './groupSeed'

async function main() {
  await db.groupRole.deleteMany({})
  for (let group of groups) {
    await db.group.upsert({
      where: { id: group.id },
      update: group,
      create: group,
    })
  }
  let userEmails = users.map((user) => user.email)
  await db.user.deleteMany({ where: { email: { in: userEmails } } })
  for (let user of users) {
    await db.user.create({
      data: user,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })