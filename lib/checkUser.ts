import { currentUser } from "@clerk/nextjs/server";

import { db } from "./prisma";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
    const primaryEmail = user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new Error("Authenticated user is missing a primary email address.");
    }

    const existingUserByEmail = await db.user.findUnique({
      where: {
        email: primaryEmail,
      },
    });

    if (existingUserByEmail) {
      return await db.user.update({
        where: {
          id: existingUserByEmail.id,
        },
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: primaryEmail,
        },
      });
    }

    try {
      return await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: primaryEmail,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const userCreatedInParallel =
        (await db.user.findUnique({
          where: {
            clerkUserId: user.id,
          },
        })) ??
        (await db.user.findUnique({
          where: {
            email: primaryEmail,
          },
        }));

      if (userCreatedInParallel) {
        return userCreatedInParallel;
      }

      throw error;
    }
  } catch (error) {
    console.error("Failed to sync authenticated user:", error);
    throw error;
  }
};
