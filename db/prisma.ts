import { PrismaClient } from "@prisma/client";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
export const prisma = new PrismaClient()
  // You can keep the $extends if you absolutely need it,
  // but consider if it's truly necessary.
  .$extends({
    result: {
      product: {
        price: {
          compute(product) {
            // Ensure product.price is defined and has toString
            return product.price?.toString() ?? null;
          },
        },
        rating: {
          compute(product) {
            // Ensure product.rating is defined and has toString
            return product.rating?.toString() ?? null;
          },
        },
      },
    },
  });
