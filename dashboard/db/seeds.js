const { SecurePassword } = require("@blitzjs/auth")
const { randomUUID } = require("crypto")
const { PrismaClient } = require("@prisma/client")

const seed = async () => {
  const db = new PrismaClient()
  await db.$connect()

  const simon = await db.user.create({
    data: {
      email: "simon@datafox.dev",
      name: "Simon Knott",
      hashedPassword: await SecurePassword.hash("password"),
      profilePictureUrl: "https://avatars.githubusercontent.com/u/14912729",
    },
  })

  const renard = await db.user.create({
    data: {
      email: "renard@datafox.dev",
      name: "Renard Renard",
      hashedPassword: await SecurePassword.hash("password"),
      profilePictureUrl: "http://www.renard.it/byr.jpg",
    },
  })

  const jule = await db.user.create({
    data: {
      email: "jule@datafox.dev",
      name: "Jule Schmachtenberg",
      hashedPassword: await SecurePassword.hash("password"),
      profilePictureUrl: "https://hpi.de/fileadmin/_processed_/e/9/csm_DSC02268_1_17e0b68732.jpg",
    },
  })

  const ferdous = await db.user.create({
    data: {
      email: "ferdous@datafox.dev",
      name: "Ferdous Nasri",
      hashedPassword: await SecurePassword.hash("password"),
      profilePictureUrl: "https://hpi.de/fileadmin/_processed_/a/c/csm_ferdousPic-2_bd99cb9fdc.jpg",
    },
  })

  const conrad = await db.user.create({
    data: {
      email: "conrad@datafox.dev",
      name: "Conrad Halle",
      hashedPassword: await SecurePassword.hash("password"),
    },
  })

  const wieler = await db.user.create({
    data: {
      email: "wieler@datafox.dev",
      name: "Lothar Wieler",
      hashedPassword: await SecurePassword.hash("password"),
      profilePictureUrl:
        "https://www.stuttgarter-zeitung.de/media.media.fb5bc0f8-2868-4c4c-a767-f442fb2bd2c3.original1920.jpg",
    },
  })

  const dacs = await db.organisation.create({
    data: {
      name: "DACS",
      slug: "hpi-dacs",
      ownerId: renard.id,
    },
  })

  await db.organisation.update({
    where: {
      id: dacs.id,
    },
    data: {
      members: {
        connect: [renard, ferdous, simon, jule, conrad].map((u) => ({ id: u.id })),
      },
    },
  })

  const iris = await db.dataset.create({
    data: {
      token: randomUUID(),
      slug: "iris",
      organisationId: dacs.id,
      ownerId: simon.id,
    },
  })

  await db.testRun.create({
    data: {
      datasetId: iris.id,
      id: "test-run-1",
      date: new Date("2022-05-04T13:02:46.086Z"),
      payload: "lorem ipsum dolor sit amet this is a placeholder",
    },
  })

  await db.$disconnect()
}

seed()
