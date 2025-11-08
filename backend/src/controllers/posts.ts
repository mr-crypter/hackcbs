import { Response, NextFunction } from 'express';
import { AuthRequest, getUserId, isModerator } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errors';
import { Post } from '../models/Post';
import { classifyUrgency } from '../services/hf';
import { extractTags } from '../services/gemini';
import { checkEmergencyCluster } from '../services/alerts';
import { logger } from '../config/logger';

export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { text, imageUrl, community, location } = req.body;
    const userId = getUserId(req);

    logger.info('Creating post', { userId, community, textLength: text.length });

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

    // Pipeline Flow: Gemini → HuggingFace → Merge → Store
    try {
      // Step 1: Gemini API - Extract structured tags
      const geminiExtraction = await extractTags(text, imageUrl);
      
      // Step 2: HuggingFace - Classify urgency
      const urgencyClassification = await classifyUrgency(text);

      // Step 3: Merge all enrichments
      post.category = geminiExtraction.category as any;
      post.categoryScore = geminiExtraction.confidence;
      post.entities = geminiExtraction.entities;
      post.tags = geminiExtraction.tags;
      
      // Override location if Gemini extracted one
      if (geminiExtraction.location && !location) {
        post.location = geminiExtraction.location;
      }

      post.urgency = urgencyClassification.label as any;
      post.urgencyScore = urgencyClassification.score;

      // Auto-flag emergency posts
      if (post.urgency === 'emergency') {
        post.status = 'flagged';
      }

      // Step 4: Store in MongoDB
      await post.save();

      // Check for emergency cluster (async, don't wait)
      if (post.urgency === 'emergency') {
        checkEmergencyCluster(community).catch(err => 
          logger.error('Failed to check emergency cluster', { err })
        );
      }

      logger.info('Post created with AI enrichment', {
        postId: post._id,
        community,
        urgency: post.urgency,
        urgencyScore: post.urgencyScore,
        category: post.category,
        categoryScore: post.categoryScore,
        tags: post.tags,
        entities: post.entities,
      });

      res.status(201).json({
        success: true,
        post,
        enrichment: {
          gemini: {
            category: post.category,
            entities: post.entities,
            tags: post.tags,
            confidence: post.categoryScore,
          },
          huggingface: {
            urgency: post.urgency,
            score: post.urgencyScore,
          },
        },
      });
    } catch (error) {
      // If enrichment fails, return post with defaults
      logger.error('Post enrichment failed, using defaults', { error });
      res.status(201).json({
        success: true,
        post,
        warning: 'AI enrichment unavailable - using fallback classification',
      });
    }
  }
);

export const listPosts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

