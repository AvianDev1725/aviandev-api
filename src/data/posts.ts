export type Post = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
};

const posts: Post[] = [
  { id: 1, title: "Hello Next.js", slug: "hello-nextjs", published: true },
  { id: 2, title: "Learning GSAP", slug: "learning-gsap", published: false },
  { id: 3, title: "Why TypeScript", slug: "why-typescript", published: true },
];

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getPublishedPosts() {
  return posts.filter((post) => post.published);
}

export function createPost(input: Omit<Post, 'id'>) {
  const newPost: Post = { id: posts.length + 1, ...input };
  posts.push(newPost);
  return newPost;
}