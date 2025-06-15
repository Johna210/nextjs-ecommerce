"use server";

import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create and update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // Get the product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error("Product not found");

    // Check if the user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: review.userId,
        productId: review.productId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (existingReview) {
        // Update existing review
        await tx.review.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create new review
        await tx.review.create({
          data: review,
        });
      }

      const averageRating = await tx.review.aggregate({
        _avg: {
          rating: true,
        },
        where: { productId: review.productId },
      });

      // get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // update the rating and numReviews in the product
      await tx.product.update({
        where: { id: product.id },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: "Review submitted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get reviews for a product
export async function getReviewsByProductId(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: reviews };
  } catch (error) {
    throw new Error(formatError(error));
  }
}

// Get a review by the current user
export async function getReviewByUserAndProduct(productId: string) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const userId = session.user.id;
  if (!userId) throw new Error("User ID is required");

  try {
    const review = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    return review;
  } catch (error) {
    throw new Error(formatError(error));
  }
}
