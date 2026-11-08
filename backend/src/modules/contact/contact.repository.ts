import { Prisma } from "@backend/generated/prisma/client.js";
import { prisma } from "@backend/lib/prisma.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { GetContactsFilters } from "@shared/maps/filters/contacts/getContacts.type.js";

export class ContactRepository {

  public static async get(
    userId  : number,
    page    : number,
    limit   : number,
    filters : GetContactsFilters,
  ) {
    const skip = (page - 1) * limit;

    const searchCondition = filters.search
      ? Prisma.sql` AND u.name ILIKE ${`%${filters.search}%`}`
      : Prisma.empty
    ;

    let orderBy: Prisma.Sql;

    switch (filters.advancedFilter) {
      case 'AZ_NAME':
        orderBy = Prisma.sql`u.name ASC`;
        break;

      case 'ZA_NAME':
        orderBy = Prisma.sql`u.name DESC`;
        break;

      case 'MOST_RECENT_JOINS':
        orderBy = Prisma.sql`u.created_at DESC`;
        break;

      case 'LESS_RECENT_JOINS':
        orderBy = Prisma.sql`u.created_at ASC`;
        break;

      case 'MOST_ITEMS':
        orderBy = Prisma.sql`"totalItems" DESC`;
        break;

      case 'LESS_ITEMS':
        orderBy = Prisma.sql`"totalItems" ASC`;
        break;

      case 'MOST_LUMBER_BUCKS':
        orderBy = Prisma.sql`u.lumber_bucks DESC`;
        break;

      case 'LESS_LUMBER_BUCKS':
        orderBy = Prisma.sql`u.lumber_bucks ASC`;
        break;

      case 'MOST_CONTACTS':
        orderBy = Prisma.sql`"totalContacts" DESC`;
        break;

      case 'LESS_CONTACTS':
        orderBy = Prisma.sql`"totalContacts" ASC`;
        break;

      default:
        orderBy = Prisma.sql`u.name ASC`;
        break;
    }

    const [contacts, totalUsers] = await prisma.$transaction([
      prisma.$queryRaw<
        {
          id   : number;
          name : string;
          profileImageURL : string | null;
          joinedAt : Date;
          totalItems    : number;
          // lumberBucks   : number;
          // totalContacts : number;
          loggedUserContactStatus : 'CONTACT' | 'PENDING' | 'NOT_CONTACT';
        }[]
      >(Prisma.sql`
        SELECT
          u.id,
          u.name,
          u.profile_image_url AS "profileImageURL",
          u.created_at AS "joinedAt",
          -- u.lumber_bucks AS "lumberBucks",

          COALESCE(items.total, 0)::float8 AS "totalItems",

          -- COALESCE(user_contacts.total, 0)::int AS "totalContacts",

          CASE
            WHEN c.status = 'CONTACT'
              THEN 'CONTACT'

            WHEN c.status = 'PENDING'
              AND c.requester_id = ${userId}
              THEN 'REQUEST_SENT'

            WHEN c.status = 'PENDING'
              AND c.addressee_id = ${userId}
              THEN 'REQUEST_RECEIVED'

            ELSE 'NOT_CONTACT'
          END AS "loggedUserContactStatus"

        FROM users u

        LEFT JOIN LATERAL (
          SELECT SUM(ui.units) AS total
          FROM user_items ui
          WHERE ui.user_id = u.id
            AND ui.units > 0
        ) items ON true

        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS total
          FROM contacts ct
          WHERE ct.status = 'CONTACT'
            AND (
              ct.requester_id = u.id
              OR ct.addressee_id = u.id
            )
        ) user_contacts ON true

        LEFT JOIN contacts c
          ON (
            (c.requester_id = ${userId} AND c.addressee_id = u.id)
          OR
            (c.requester_id = u.id AND c.addressee_id = ${userId})
          )

        WHERE u.id <> ${userId}

        ${searchCondition}

        ORDER BY ${orderBy}, u.id ASC

        LIMIT ${limit}
        OFFSET ${skip}
      `),

      prisma.user.count({
        where : {
          id  : { not: userId },

          ...(filters.search && {
            name: {
              contains : filters.search,
              mode     : 'insensitive',
            },
          }),
        },
      }),
    ]);

    return {
      contacts,
      totalUsers,
    };
  }



  public static async createContactRequest(
    requesterId : number,
    addresseeId : number,
  ) {
    return await prisma.contact.create({
      data: {
        requesterId,
        addresseeId,
      },
      select: {
        status : true,
      }
    });
  }



  public static async findContactBetweenUsers(
    userId      : number,
    otherUserId : number,
  ) {
    return await prisma.contact.findFirst({
      where: {
        OR: [
          {
            requesterId : userId,
            addresseeId : otherUserId,
          },
          {
            requesterId : otherUserId,
            addresseeId : userId,
          },
        ],
      },
    });
  }



  public static async getReceivedRequests(
    userId : number
  ) {
    return await prisma.contact.findMany({
      where: {
        addresseeId : userId,
        status      : "PENDING",
      },
      include: {
        requester : {
          select  : {
            id   : true,
            name : true,
            profileImageURL : true,
          },
        },
      },
      orderBy: {
        createdAt : "desc",
      },
    });
  }



  public static async getUserContacts(
    userId : number
  ) {
    return await prisma.contact.findMany({
      where: {
        status: "CONTACT",
        OR: [
          { requesterId : userId },
          { addresseeId : userId },
        ],
      },
      include: {
        requester : {
          select : {
            id   : true,
            name : true,
            profileImageURL : true,
          },
        },
        addressee : {
          select  : {
            id    : true,
            name  : true,
            profileImageURL : true,
          },
        },
      },
    });
  }



  public static async acceptContactRequest(
    userId    : number,
    contactId : number,
  ) {
    return await prisma.contact.updateMany({
      where: {
        requesterId : contactId,
        addresseeId : userId,
        status      : "PENDING",
      },
      data: {
        status : "CONTACT",
      },
    });
  }



  public static async denyContactRequest(
    userId    : number,
    contactId : number,
  ) {
    return await prisma.contact.deleteMany({
      where: {
        status      : "PENDING",
        requesterId : contactId,
        addresseeId : userId,
      },
    });
  }



  public static async undoContactRequest(
    userId    : number,
    contactId : number,
  ) {
    return await prisma.contact.deleteMany({
      where: {
        status : "CONTACT",
        OR: [
          {
            requesterId : userId,
            addresseeId : contactId,
          },
          {
            requesterId : contactId,
            addresseeId : userId,
          },
        ],
      },
    });
  }



  public static async cancelContactRequest(
    userId    : number,
    contactId : number,
  ) {
    return await prisma.contact.deleteMany({
      where: {
        requesterId : userId,
        addresseeId : contactId,
        status      : 'PENDING',
      },
    });
  }


  public static async getUsers(
    userId  : number,
    page    : number,
    limit   : number,
    search? : string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      id: { not: userId },

      ...(search && {
        name: {
          contains : search,
          mode     : "insensitive",
        },
      }),
    };

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take    : limit,
        orderBy : {
          name  : "asc",
        },
        select: {
          id   : true,
          name : true,
          profileImageURL : true,
        },
      }),

      prisma.user.count({ where }),
    ]);

    return {
      users,
      totalUsers,
    };
  }



  public static async getContactDetails(
    contactId : number,
    userId    : number,
  ) {
    return await prisma.$transaction( async(tx) => {
      const [
        contact,
        itemsStats,
        contactsStats,
        loggedUserRelation,
      ] = await Promise.all([

        tx.user.findUnique({
          where  : { id: contactId },
          select : {
            id   : true,
            name : true,
            profileImageURL : true,
            lumberBucks     : true,
            createdAt       : true,

            items: {
              where: {
                units : {gt : 0 },
              },
              select : {
                units : true,
                item  : {
                  select: {
                    id          : true,
                    name        : true,
                    imageURL    : true,
                    category    : true,
                    state       : true,
                    description : true,
                    originalPrice      : true,
                    averageMarketPrice : true,
                  },
                },
              },
              take : 7,
            },

            sentContactRequests: {
              where: { status: 'CONTACT' },
              select: {
                addressee : {
                  select  : {
                    id   : true,
                    name : true,
                    profileImageURL : true,
                  },
                },
              },
              take: 10,
            },

            receivedContactRequests: {
              where: {
                status: 'CONTACT',
              },
              select: {
                requester : {
                  select  : {
                    id   : true,
                    name : true,
                    profileImageURL : true,
                  },
                },
              },
              take: 10,
            },
          },
        }),

        tx.userItem.aggregate({
          where: {
            userId : contactId,
            units : { gt : 0 },
          },
          _sum: { units : true },
        }),

        tx.contact.count({
          where: { status: 'CONTACT',
            OR: [
              { requesterId: contactId },
              { addresseeId: contactId },
            ],
          },
        }),

        tx.contact.findFirst({
          where: {
            OR: [
              {
                requesterId : userId,
                addresseeId : contactId,
              },
              {
                requesterId : contactId,
                addresseeId : userId,
              },
            ],
          },
          select: {
            status      : true,
            requesterId : true,
            addresseeId : true,
          },
        }),
      ]);

      if (!contact) return null;

      const loggedUserContactStatus =
        loggedUserRelation?.status === 'CONTACT'
          ? 'CONTACT'
          : loggedUserRelation?.status === 'PENDING'
            ? loggedUserRelation.requesterId === userId
              ? 'REQUEST_SENT'
              : 'REQUEST_RECEIVED'
            : 'NOT_CONTACT'
      ;

      const userContacts = [
        ...contact.sentContactRequests.map((relation) => relation.addressee),
        ...contact.receivedContactRequests.map((relation) => relation.requester),
      ];

      const normalizedItems = contact.items.map(({ item, units }) => ({
        ...item,
        units,
      }));

      return {
        id   : contact.id,
        name : contact.name,
        profileImageURL : contact.profileImageURL,
        lumberBucks     : contact.lumberBucks,
        joinedAt        : contact.createdAt,

        totalItems    : itemsStats._sum.units ?? 0,
        totalContacts : contactsStats,

        loggedUserContactStatus,

        contacts : userContacts.map((user) => ({
          id              : user.id,
          profileImageURL : user.profileImageURL,
          username        : user.name,
        })),

        items : normalizedItems,
      };
    });
  }
}