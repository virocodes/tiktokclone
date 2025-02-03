import { integer, pgTable, text, timestamp, vector, unique, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username'),
  profileImage: text('profile_image'),
  bio: text('bio'),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastEmbeddingUpdate: timestamp('last_embedding_update').defaultNow(),
});

export const follows = pgTable('follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: text('follower_id').references(() => users.id),
  followingId: text('following_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  videoUrl: text('video_url'),
  description: text('description'),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  postId: uuid('post_id').references(() => posts.id),
  createdAt: timestamp('created_at').defaultNow(),
  },
  (likes) => ({
    unique: unique().on(likes.userId, likes.postId),
  }),
);

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id),
  userId: text('user_id').references(() => users.id),
  content: text('content'),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const commentsLikes = pgTable('comments_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  commentId: uuid('comment_id').references(() => comments.id),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  },
  (commentsLikes) => ({
    unique: unique().on(commentsLikes.userId, commentsLikes.commentId),
  }),
);

export const replies = pgTable('replies', {
  id: uuid('id').defaultRandom().primaryKey(),
  commentId: uuid('comment_id').references(() => comments.id),
  userId: text('user_id').references(() => users.id),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const repliesLikes = pgTable('replies_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  replyId: uuid('reply_id').references(() => replies.id),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  },
  (repliesLikes) => ({
    unique: unique().on(repliesLikes.userId, repliesLikes.replyId),
  }),
);

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  postId: uuid('post_id').references(() => posts.id),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});

