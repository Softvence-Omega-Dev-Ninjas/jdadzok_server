import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class HelperService {
  constructor(private prisma: PrismaService) {}

  async attachProductToEligiblePosts(productId: string) {
    // Step 0: Fetch the product including promotionFee
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.promotionFee <= 0) {
      console.log("Product has no promotion fee to distribute.");
      return;
    }

    // Step 1: Find eligible posts (no ad yet, author capLevel not NONE)
    const eligiblePosts = await this.prisma.post.findMany({
      where: {
        dedicatedAd: { none: {} }, // posts with no ad
        author: { capLevel: { not: "NONE" } },
      },
      orderBy: { createdAt: "desc" },
      take: 5, // attach product to 5 posts max
      include: {
        author: true, // needed for capLevel
      },
    });

    if (!eligiblePosts.length) {
      console.log("No eligible posts found for this product.");
      return;
    }

    let totalDistributed = 0; // Track total amount distributed
    const activityTable=await this.prisma.activityScore.findFirst()
    // Step 2: Prepare all operations for transaction
    const transactionOps = eligiblePosts.map((post) => {
      // Determine capLevel percentage
      let percent = 0;
      switch (post.author.capLevel) {
        case "GREEN":
          percent = activityTable?.greenPercentage as number;
          break;
        case "YELLOW":
          percent = activityTable?.yellowPercentage as number;
          break;
        case "BLACK":
          percent = activityTable?.blackPercentage as number;
          break;
        case "RED":
          percent = activityTable?.redPercentage as number;
          break;
      }

      // Calculate revenue amount for this post author
      const revenueAmount = (percent / 100) * product.promotionFee;
      totalDistributed += revenueAmount;

      return [
        // Create DedicatedAd
        this.prisma.dedicatedAd.create({
          data: {
            postId: post.id,
            adId: productId,
            active: true,
          },
        }),
        // Create Revenue record
        this.prisma.revenue.create({
          data: {
            userId: post.authorId,
            postId: post.id,
            adId: productId,
            amount: revenueAmount,
            type: "view",
          },
        }),
      ];
    });

    // Flatten all operations
    const allOps = transactionOps.flat();

    // Step 3: Execute all in a single transaction
    await this.prisma.$transaction(allOps);

    // Step 4: Update product.spent with total distributed amount
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        spent: product.spent + totalDistributed,
      },
    });

    console.log(
      `Product (${productId}) attached to ${eligiblePosts.length} posts. Total distributed: ${totalDistributed}`
    );
  }
}
