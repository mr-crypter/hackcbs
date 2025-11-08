import { Post } from '../models/Post';
import { Alert } from '../models/Alert';
import { logger } from '../config/logger';

const EMERGENCY_THRESHOLD = 3;
const TIME_WINDOW_MINUTES = 60;

export async function checkEmergencyCluster(community: string): Promise<void> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - TIME_WINDOW_MINUTES);

    const emergencyPosts = await Post.find({
      community,
      urgency: 'emergency',
      status: 'active',
      createdAt: { $gte: cutoffTime },
    });

    if (emergencyPosts.length >= EMERGENCY_THRESHOLD) {
      // Check if alert already exists for these posts
      const postIds = emergencyPosts.map(p => p._id);
      
      const existingAlert = await Alert.findOne({
        community,
        type: 'clustered_emergency',
        posts: { $in: postIds },
        createdAt: { $gte: cutoffTime },
      });

      if (!existingAlert) {
        await Alert.create({
          type: 'clustered_emergency',
          community,
          reason: `${emergencyPosts.length} emergency reports in the last ${TIME_WINDOW_MINUTES} minutes`,
          posts: postIds,
        });

        logger.warn('Emergency cluster alert created', {
          community,
          count: emergencyPosts.length,
        });
      }
    }
  } catch (error) {
    logger.error('Failed to check emergency cluster', { error, community });
  }
}

export async function createManualAlert(
  type: string,
  community: string,
  reason: string,
  postIds: string[] = []
): Promise<any> {
  try {
    const alert = await Alert.create({
      type,
      community,
      reason,
      posts: postIds,
    });

    logger.info('Manual alert created', { type, community });
    return alert;
  } catch (error) {
    logger.error('Failed to create manual alert', { error });
    throw error;
  }
}

export async function getRecentAlerts(
  community: string,
  limit = 20
): Promise<any[]> {
  try {
    const alerts = await Alert.find({ community })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('posts', 'text urgency category createdAt');

    return alerts;
  } catch (error) {
    logger.error('Failed to get recent alerts', { error, community });
    throw error;
  }
}

