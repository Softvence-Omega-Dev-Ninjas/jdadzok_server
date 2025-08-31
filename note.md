```ts
async getFeedByUserChoices(userId: string) {
  const userChoices = await this.repository.findAll(userId);
  const choiceSlugs = userChoices.map(choice => choice.slug);

  const posts = await this.repository.findFeedPosts(choiceSlugs);
  return posts;
}
```
