import { Injectable } from "@nestjs/common";
import { PostRepository } from "@project/main/(posts)/posts/posts.repository";
import { ChoicesRepository } from "@project/main/(started)/choices/choices.repository";
import { UserRepository } from "@project/main/(users)/users/users.repository";

@Injectable()
export class FeedService {
    constructor(
        private readonly choiceRepository: ChoicesRepository,
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository,
    ) {}

    async generateUserFeed() {
        // const userChoices = await this.choiceRepository.findAll(userId);
        // const choiceSlugs = userChoices.map((c) => c.slug);
        // const following = await this.userRepository.getFollowingIds(userId);
        // // Fetch recent posts from authors who share similar interests
        // const posts = await this.postRepository.findRecentPosts({
        //   authorIds: following,
        //   limit: 100,
        // });
        // const scoredPosts =
        //   posts &&
        //   posts.map((post) => ({
        //     post,
        //     score: feedAlgorithm.scorePost(
        //       {
        //         ...post,
        //         postFrom: "REGULAR_PROFILE"
        //       },
        //       userId,
        //       choiceSlugs,
        //       following,
        //     ),
        //   }));
        // // Sort by score descending
        // scoredPosts.sort((a, b) => b.score - a.score);
        // return scoredPosts.map((p) => p.post);
    }
}
