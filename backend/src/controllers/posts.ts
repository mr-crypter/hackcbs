import { Response, NextFunction } from 'express';
import { AuthRequest, getUserId, isModerator } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errors';
import { Post } from '../models/Post';
import { enrichPost } from '../services/hf';
import { checkEmergencyCluster } from '../services/alerts';
import { logger } from '../config/logger';

export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { text, imageUrl, community, location } = req.body;
    const userId = getUserId(req);

    // Create draft post
    const post = new Post({
      userId,
      text,
      imageUrl: imageUrl || null,
      community,
      location: location || null,
      status: 'active',
    });

    await post.save();

    // Enrich with AI (parallel calls)
    try {
      const enrichment = await enrichPost(text);
      
      post.urgency = enrichment.urgency as any;
      post.urgencyScore = enrichment.urgencyScore;
      post.category = enrichment.category as any;
      post.categoryScore = enrichment.categoryScore;
      post.tags = enrichment.tags;

      // Auto-flag emergency posts
      if (post.urgency === 'emergency') {
        post.status = 'flagged';
      }

      await post.save();

      // Check for emergency cluster (async, don't wait)
      if (post.urgency === 'emergency') {
        checkEmergencyCluster(community).catch(err => 
          logger.error('Failed to check emergency cluster', { err })
        );
      }

      logger.info('Post created', {
        postId: post._id,
        community,
        urgency: post.urgency,
        category: post.category,
      });

      res.status(201).json({
        success: true,
        post,
      });
    } catch (error) {
      // If enrichment fails, return post with defaults
      logger.error('Post enrichment failed, using defaults', { error });
      res.status(201).json({
        success: true,
        post,
        warning: 'AI enrichment unavailable',
      });
    }
  }
);

export const listPosts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { community, urgency, category, limit, offset } = req.query as any;

    const query: any = { status: 'active' };

    if (community) query.community = community;
    if (urgency) query.urgency = urgency;
    if (category) query.category = category;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + posts.length < total,
      },
    });
  }
);

export const getPost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({
      success: true,
      post,
    });
  }
);

export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = getUserId(req);

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check permissions
    const canDelete = post.userId === userId || isModerator(req);

    if (!canDelete) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    post.status = 'removed';
    await post.save();

    logger.info('Post deleted', { postId: id, userId });

    res.json({
      success: true,
      message: 'Post deleted',
    });
  }
);

export const searchPosts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { q, community, limit } = req.body;

    const query: any = {
      $text: { $search: q },
      status: 'active',
    };

    if (community) {
      query.community = community;
    }

    const posts = await Post.find(query, {
      score: { $meta: 'textScore' },
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit || 20);

    res.json({
      success: true,
      posts,
      query: q,
    });
  }
);

