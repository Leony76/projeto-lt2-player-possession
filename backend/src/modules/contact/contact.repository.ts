import { Prisma } from "@backend/generated/prisma/client.js";
import { prisma } from "@backend/lib/prisma.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { GetContactsFilters } from "@shared/maps/filters/contacts/getContacts.type.js";

export class ContactRepository {

  public static async get(
    userId: number,
    page: number,
    limit: number,
    filters: GetContactsFilters,
  ) {
    const skip = (page - 1) * limit;

    const searchCondition = filters.search
      ? Prisma.sql`
          AND u.name ILIKE ${`%${filters.search}%`}
        `
      : Prisma.empty;

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

    const [contacts, totalContacts] = await prisma.$transaction([
      prisma.$queryRaw<
        {
          id: number;
          name: string;
          profileImageURL: string | null;
          joinedAt: Date;
          totalItems: number;
          lumberBucks: number;
          totalContacts: number;
          loggedUserContactStatus: string;
        }[]
      >(Prisma.sql`
        SELECT
          u.id,
          u.name,
          u.profile_image_url AS "profileImageURL",
          u.created_at AS "joinedAt",
          u.lumber_bucks AS "lumberBucks",

          COALESCE(items.total, 0)::float8 AS "totalItems",

          COALESCE(friends.total, 0)::int AS "totalContacts",

          CASE
            WHEN f.status = 'ACCEPTED'
              THEN 'FRIEND'

            WHEN f.status = 'PENDING'
              AND f.requester_id = ${userId}
              THEN 'REQUEST_SENT'

            WHEN f.status = 'PENDING'
              AND f.addressee_id = ${userId}
              THEN 'REQUEST_RECEIVED'

            ELSE 'NONE'
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
          FROM friendships fr
          WHERE fr.status = 'ACCEPTED'
            AND (
              fr.requester_id = u.id
              OR fr.addressee_id = u.id
            )
        ) friends ON true

        LEFT JOIN friendships f
          ON (
            (f.requester_id = ${userId} AND f.addressee_id = u.id)
            OR
            (f.requester_id = u.id AND f.addressee_id = ${userId})
          )

        WHERE u.id <> ${userId}

        ${searchCondition}

        ORDER BY ${orderBy}, u.id ASC

        LIMIT ${limit}
        OFFSET ${skip}
      `),

      prisma.user.count({
        where: {
          id: {
            not: userId,
          },

          ...(filters.search && {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          }),
        },
      }),
    ]);

    return {
      contacts,
      totalContacts,
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
        status: "ACCEPTED",
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



  public static async respondContactRequest(
    contactRequestId : number,
    userId            : number,
    accepted          : boolean,
  ) {
    const result = await prisma.contact.updateMany({
      where: {
        id          : contactRequestId,
        addresseeId : userId,
        status      : "PENDING",
      },
      data: {
        status : accepted ? "ACCEPTED" : "REJECTED",
      },
    });

    if (result.count === 0) {
      throw new APIError(404, "Contact request not found or already processed");
    }

    return {
      contactRequestId,
      status : accepted ? "ACCEPTED" : "REJECTED",
    };
  }



  public static async removeContact(
    userId    : number,
    contactId : number,
  ) {
    const result = await prisma.contact.deleteMany({
      where: {
        status : "ACCEPTED",
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

    if (result.count === 0) {
      throw new APIError(404, "Contact not found");
    }
  }



  public static async cancelContactRequest(
    userId    : number,
    contactId : number,
  ) {
    const result = await prisma.contact.deleteMany({
      where: {
        status : "PENDING",
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

    if (result.count === 0) {
      throw new APIError(404, "Contact not found");
    }
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
}