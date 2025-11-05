import { Injectable } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class HelperService {
  constructor(private prisma: PrismaService) {}

  async attachProductToEligiblePosts(productId: string) {
    const eligiblePosts = await this.prisma.post.findMany({
      where: {
        dedicatedAd: {
          none: {}, 
        },
        author: {
          capLevel: { not: "NONE" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5, // attach product to 5 posts max
    });

    if (!eligiblePosts.length) {
      console.log("No eligible posts found for this product.");
      return;
    }

    // Create DedicatedAd entries for each eligible post
    await this.prisma.$transaction(
      eligiblePosts.map((post) =>
        this.prisma.dedicatedAd.create({
          data: {
            postId: post.id,
            adId: productId,
            active: true,
          },
        })
      )
    );

    console.log(
      `Attached product (${productId}) to ${eligiblePosts.length} posts.`
    );
  }

}