import { prisma } from "../../src/lib/prisma";
import argon2 from 'argon2';

const users = [
  {
    name        : 'user_01',
    lumberBucks : 1000,
  },
  {
    name        : 'user_02',
    lumberBucks : 2000,
  },
  {
    name        : 'user_03',
    lumberBucks : 50200,
  },
  {
    name        : 'user_04',
    lumberBucks : 24000,
  },
  {
    name        : 'user_05',
    lumberBucks : 71000,
  },
  {
    name        : 'user_06',
    lumberBucks : 22000,
  },
  {
    name        : 'user_07',
    lumberBucks : 54000,
  },
  {
    name        : 'user_08',
    lumberBucks : 41000,
  },
  {
    name        : 'user_09',
    lumberBucks : 1000,
  },
  {
    name        : 'user_10',
    lumberBucks : 2000,
  },
  {
    name        : 'user_11',
    lumberBucks : 50200,
  },
  {
    name        : 'user_12',
    lumberBucks : 24000,
  },
  {
    name        : 'user_13',
    lumberBucks : 71000,
  },
  {
    name        : 'user_14',
    lumberBucks : 22000,
  },
  {
    name        : 'user_15',
    lumberBucks : 54000,
  },
  {
    name        : 'user_16',
    lumberBucks : 41000,
  },
  {
    name        : 'user_17',
    lumberBucks : 12000,
  },
  {
    name        : 'user_18',
    lumberBucks : 20400,
  },
  {
    name        : 'user_19',
    lumberBucks : 50200,
  },
  {
    name        : 'user_20',
    lumberBucks : 240200,
  },
  {
    name        : 'user_21',
    lumberBucks : 710200,
  },
  {
    name        : 'user_22',
    lumberBucks : 2200,
  },
  {
    name        : 'user_23',
    lumberBucks : 5000,
  },
  {
    name        : 'user_24',
    lumberBucks : 4123,
  },
  {
    name        : 'user_25',
    lumberBucks : 1000,
  },
  {
    name        : 'user_26',
    lumberBucks : 20231,
  },
  {
    name        : 'user_27',
    lumberBucks : 50223,
  },
  {
    name        : 'user_28',
    lumberBucks : 240023,
  },
  {
    name        : 'user_29',
    lumberBucks : 71000,
  },
  {
    name        : 'user_30',
    lumberBucks : 22000,
  },
  {
    name        : 'user_31',
    lumberBucks : 54000,
  },
  {
    name        : 'user_32',
    lumberBucks : 41000,
  },
  {
    name        : 'user_33',
    lumberBucks : 1000,
  },
  {
    name        : 'user_34',
    lumberBucks : 2000,
  },
  {
    name        : 'user_35',
    lumberBucks : 50200,
  },
  {
    name        : 'user_36',
    lumberBucks : 24000,
  },
  {
    name        : 'user_37',
    lumberBucks : 71000,
  },
  {
    name        : 'user_38',
    lumberBucks : 22000,
  },
  {
    name        : 'user_39',
    lumberBucks : 54000,
  },
  {
    name        : 'user_40',
    lumberBucks : 41000,
  },
  {
    name        : 'user_41',
    lumberBucks : 1000,
  },
  {
    name        : 'user_42',
    lumberBucks : 2000,
  },
  {
    name        : 'user_43',
    lumberBucks : 50200,
  },
  {
    name        : 'user_44',
    lumberBucks : 24000,
  },
  {
    name        : 'user_45',
    lumberBucks : 71000,
  },
  {
    name        : 'user_46',
    lumberBucks : 22000,
  },
  {
    name        : 'user_47',
    lumberBucks : 54000,
  },
  {
    name        : 'user_48',
    lumberBucks : 41000,
  },
  {
    name        : 'user_49',
    lumberBucks : 12000,
  },
  {
    name        : 'user_50',
    lumberBucks : 20400,
  },
  {
    name        : 'user_51',
    lumberBucks : 50200,
  },
  {
    name        : 'user_52',
    lumberBucks : 240200,
  },
  {
    name        : 'user_53',
    lumberBucks : 710200,
  },
  {
    name        : 'user_54',
    lumberBucks : 2200,
  },
  {
    name        : 'user_55',
    lumberBucks : 5000,
  },
  {
    name        : 'user_56',
    lumberBucks : 4123,
  },
  {
    name        : 'user_57',
    lumberBucks : 1000,
  },
  {
    name        : 'user_58',
    lumberBucks : 20231,
  },
  {
    name        : 'user_59',
    lumberBucks : 50223,
  },
  {
    name        : 'user_60',
    lumberBucks : 240023,
  },
  {
    name        : 'user_61',
    lumberBucks : 71000,
  },
  {
    name        : 'user_62',
    lumberBucks : 22000,
  },
  {
    name        : 'user_63',
    lumberBucks : 54000,
  },
  {
    name        : 'user_64',
    lumberBucks : 41000,
  },
];

export const seedUsers = async() => {

  const passwordHash = await argon2.hash("12345678");

  for (const user of users) {
    await prisma.user.upsert({
      where: { name : user.name },

      update: {
        ...user,
        passwordHash,
      },

      create: {
        ...user,
        passwordHash,
      },
    });
  }

  console.log("Users successfully seeded!");
};