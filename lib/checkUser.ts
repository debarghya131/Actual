import { currentUser } from "@clerk/nextjs/server";

import { db } from "./prisma";

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

    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: primaryEmail,
      },
    });
  } catch (error) {
    console.error("Failed to sync authenticated user:", error);
    throw error;
  }
};
