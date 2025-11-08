import { Post, CategoryType } from '../models/Post';
import { Summary } from '../models/Summary';
import { logger } from '../config/logger';

interface CategoryStats {
  [key: string]: {
    total: number;
    emergency: number;
    urgent: number;
    normal: number;
  };
}

export async function generateDailySummary(
  community: string,
  dateISO: string
): Promise<any> {
  try {
    // Check if summary already exists
    const existing = await Summary.findOne({ community, dateISO });
    if (existing) {
      return existing;
    }

    // Parse date for query
    const date = new Date(dateISO);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch posts for the day
    const posts = await Post.find({
      community,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: 'active',
    });

    if (posts.length === 0) {
      const emptySummary = await Summary.create({
        community,
        dateISO,
        summaryText: `No activity reported in ${community} on ${dateISO}.`,
        stats: {
          total: 0,
          emergency: 0,
          urgent: 0,
          normal: 0,
        },
      });
      return emptySummary;
    }

    // Calculate stats
    const stats = {
      total: posts.length,
      emergency: posts.filter(p => p.urgency === 'emergency').length,
      urgent: posts.filter(p => p.urgency === 'urgent').length,
      normal: posts.filter(p => p.urgency === 'normal').length,
    };

    // Group by category
    const categoryStats: CategoryStats = {};
    posts.forEach(post => {
      if (!categoryStats[post.category]) {
        categoryStats[post.category] = {
          total: 0,
          emergency: 0,
          urgent: 0,
          normal: 0,
        };
      }
      categoryStats[post.category].total++;
      categoryStats[post.category][post.urgency]++;
    });

    // Generate summary text (rule-based)
    const summaryText = generateSummaryText(community, dateISO, stats, categoryStats);

    // Save summary
    const summary = await Summary.create({
      community,
      dateISO,
      summaryText,
      stats,
    });

    logger.info('Daily summary generated', { community, dateISO, stats });

    return summary;
  } catch (error) {
    logger.error('Failed to generate daily summary', { error, community, dateISO });
    throw error;
  }
}

function generateSummaryText(
  community: string,
  dateISO: string,
  stats: any,
  categoryStats: CategoryStats
): string {
  const parts: string[] = [];

  // Opening
  parts.push(`Daily Summary for ${community} on ${dateISO}:`);
  parts.push(`\nTotal posts: ${stats.total}`);

  // Urgency breakdown
  if (stats.emergency > 0) {
    parts.push(`🚨 Emergency reports: ${stats.emergency}`);
  }
  if (stats.urgent > 0) {
    parts.push(`⚠️ Urgent reports: ${stats.urgent}`);
  }
  parts.push(`✓ Normal posts: ${stats.normal}`);

  // Category breakdown
  parts.push('\n**Activity by Category:**');
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.total - a.total);

  sortedCategories.forEach(([category, catStats]) => {
    const urgencyNote = catStats.emergency > 0 
      ? ` (${catStats.emergency} emergency)` 
      : catStats.urgent > 0 
        ? ` (${catStats.urgent} urgent)` 
        : '';
    parts.push(`- ${category}: ${catStats.total}${urgencyNote}`);
  });

  // Closing insight
  if (stats.emergency > 0) {
    parts.push('\n⚠️ **Action needed:** Multiple emergency reports require immediate attention.');
  } else if (stats.urgent > 3) {
    parts.push('\n📢 **Note:** Higher than usual urgent activity today.');
  } else {
    parts.push('\n✅ Community activity within normal range.');
  }

  return parts.join('\n');
}

export async function getOrCreateDailySummary(
  community: string,
  date?: string
): Promise<any> {
  const dateISO = date || new Date().toISOString().split('T')[0];
  return generateDailySummary(community, dateISO);
}

