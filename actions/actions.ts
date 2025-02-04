'use server';

import { db } from '@/db';
import { users, posts, likes, comments, replies, commentsLikes, repliesLikes, follows, notes } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function createUser(id: string, username: string, profileImage: string) {
  const randomEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  const result = await db.insert(users).values({
    id: id,
    username: username,
    profileImage: profileImage,
    bio: '',
    embedding: randomEmbedding,
  });
  return result;
}

export async function createPost(userId: string, videoUrl: string, description: string, embedding: number[]) {
  const result = await db.insert(posts).values({
    userId: userId,
    videoUrl: videoUrl,
    description: description,
    embedding: embedding,
  });
  return result;
}

export async function getVideos(userId?: string | null) {
  // First get all likes for this user if they're logged in
  const userLikes = userId ? await db
    .select({ postId: likes.postId })
    .from(likes)
    .where(eq(likes.userId, userId)) : [];

  // Create a Set of liked post IDs for quick lookup
  const likedPostIds = new Set(userLikes.map(like => like.postId));
  if (userId) {
    const userEmbedding = await getUserEmbedding(userId);
    if (userEmbedding) {
        // Convert the embedding array to a properly formatted vector string
        const vectorString = `[${userEmbedding}]`;
        
        let query = db
            .select({
            id: posts.id,
            videoUrl: posts.videoUrl,
            description: posts.description,
            createdAt: posts.createdAt,
            username: users.username,
            profileImage: users.profileImage,
            userId: posts.userId,
            embedding: posts.embedding,
            likes: sql<number>`COUNT(DISTINCT ${likes.id})`.as('likes'),
            ...(userId ? {
                similarity: sql<number>`1 - (${posts.embedding} <=> ${sql.raw(`'${vectorString}'::vector`)})`.as('similarity')
            } : {})
            })
            .from(posts)
            .leftJoin(users, eq(posts.userId, users.id))
            .leftJoin(likes, eq(posts.id, likes.postId));
        

        const result = await query
            .groupBy(posts.id, posts.videoUrl, posts.description, posts.createdAt, 
                    users.username, users.profileImage, posts.userId, posts.embedding);
        

        // Map the results and add has_liked property
        const finalResult = result.map(video => ({
            ...video,
            has_liked: likedPostIds.has(video.id)
        }));

        return finalResult;
    } else {
    // If no user embedding, just return all videos
    const query = db
        .select({
            id: posts.id,
            videoUrl: posts.videoUrl,
            description: posts.description,
            createdAt: posts.createdAt,
            username: users.username,
            profileImage: users.profileImage,
            userId: posts.userId,
            embedding: posts.embedding,
            likes: sql<number>`COUNT(DISTINCT ${likes.id})`.as('likes')
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(likes, eq(posts.id, likes.postId));

    const result = await query
        .groupBy(posts.id, posts.videoUrl, posts.description, posts.createdAt,
                users.username, users.profileImage, posts.userId, posts.embedding);

    // Map the results and add has_liked property
    const finalResult = result.map(video => ({
        ...video,
        has_liked: likedPostIds.has(video.id)
    }));

    return finalResult;
    }
  }
}

export async function getUser(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result;
}

export async function likePost(userId: string, postId: string) {
  const result = await db.insert(likes).values({
    userId: userId,
    postId: postId,
  });
  return result;
}

export async function toggleLike(userId: string, postId: string) {
  // First check if the like exists
  const existingLike = await db
    .select()
    .from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.postId, postId)
    ));

  if (existingLike.length > 0) {
    // Unlike
    await db
      .delete(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.postId, postId)
      ));
    return false;
  } else {
    // Like
    await db.insert(likes).values({
      userId: userId,
      postId: postId,
    });
    await updateUserEmbedding(userId);
    return true;
  }
}

export async function updateUserEmbedding(userId: string, likeThreshold: number = 3) {
    // First check how many likes since last update
    const likeCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          sql`${likes.createdAt} > (
            SELECT last_embedding_update 
            FROM ${users} 
            WHERE id = ${userId}
          )`
        )
      );

    // If not enough new likes, skip update
    if (likeCount[0].count < likeThreshold) return;

    // Get user's liked posts since last update
    const likedPosts = await db
      .select({
        embedding: posts.embedding,
      })
      .from(likes)
      .innerJoin(posts, eq(likes.postId, posts.id))
      .where(
        and(
          eq(likes.userId, userId),
          sql`${likes.createdAt} > (
            SELECT last_embedding_update 
            FROM ${users} 
            WHERE id = ${userId}
          )`
        )
      );
  
    if (likedPosts.length === 0) return;
  
    // Get current user embedding
    const currentUser = await db.select().from(users).where(eq(users.id, userId));
    const currentEmbedding = currentUser[0].embedding;

    // Calculate average embedding from liked posts
    const averageEmbedding = likedPosts.reduce((acc, post) => {
      return acc.map((val: number, idx: number) => val + (post.embedding?.[idx] ?? 0));
    }, new Array(1536).fill(0)).map((val: number) => val / likedPosts.length);

    // Learning rate determines how much we move towards the new embedding (0.3 = 30%)
    const learningRate = 0.3;
    
    // Calculate updated embedding as weighted average between current and new
    const updatedEmbedding = currentEmbedding?.map((currentVal: number, idx: number) => {
      const targetVal = averageEmbedding[idx];
      return currentVal + (targetVal - currentVal) * learningRate;
    });
  
    // Update user's embedding and lastEmbeddingUpdate timestamp
    await db
      .update(users)
      .set({ 
        embedding: updatedEmbedding,
        lastEmbeddingUpdate: sql`NOW()`
      })
      .where(eq(users.id, userId));
}

export async function getUserEmbedding(userId: string) {
  const result = await db.select().from(users).where(eq(users.id, userId));
  return result[0].embedding;
}