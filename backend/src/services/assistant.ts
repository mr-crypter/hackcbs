import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { Post } from '../models/Post';

// Initialize Gemini API
let genAI: GoogleGenerativeAI | null = null;

if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
} else {
  logger.warn('Gemini API key not configured - assistant will be unavailable');
}

export interface AssistantResponse {
  response: string;
  sources?: Array<{
    postId: string;
    text: string;
    category: string;
    urgency: string;
    createdAt: Date;
  }>;
}

/**
 * Answer user questions about community posts using Gemini AI
 * Fetches recent posts for context and uses Gemini to generate helpful answers
 */
export async function askAssistant(
  query: string,
  community?: string
): Promise<AssistantResponse> {
  if (!genAI) {
    logger.warn('Assistant called but Gemini API not initialized', {
      hasApiKey: !!config.geminiApiKey,
    });
    return {
      response: "I'm sorry, the AI assistant is currently unavailable. Please check back later.",
    };
  }
  
  logger.info('Assistant query received', {
    queryLength: query.length,
    community: community || 'all',
    hasApiKey: !!config.geminiApiKey,
  });

  try {
    // Fetch recent posts for context (last 50 posts, optionally filtered by community)
    const queryFilter: any = { status: 'active' };
    if (community) {
      queryFilter.community = community;
    }

    const recentPosts = await Post.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('text category urgency location createdAt community')
      .lean();

    logger.info('Fetched posts for assistant context', {
      postCount: recentPosts.length,
      community: community || 'all',
    });
    
    // Log warning if no posts found
    if (recentPosts.length === 0) {
      logger.warn('No posts found for assistant context', { community: community || 'all' });
    }

    // Build context from posts
    const postsContext = recentPosts.length > 0
      ? recentPosts
          .map((post, idx) => {
            const date = new Date(post.createdAt).toLocaleDateString();
            return `Post ${idx + 1} (${date}, ${post.category}, ${post.urgency}):
- Text: "${post.text}"
${post.location ? `- Location: ${post.location}` : ''}
${post.community ? `- Community: ${post.community}` : ''}`;
          })
          .join('\n\n')
      : 'No recent posts available in the community.';

    // Create prompt for Gemini
    const prompt = `You are a helpful community assistant for a local community platform. 
Your job is to answer questions about community posts, events, safety alerts, and local information.

**Context - Recent Community Posts:**
${postsContext || 'No recent posts available.'}

**User Question:** "${query}"

**Instructions:**
1. Answer the user's question based on the community posts provided above
2. If the question asks about specific information (events, safety alerts, etc.), reference relevant posts
3. Be concise, friendly, and helpful
4. If you don't have enough information to answer, say so politely
5. If asked about events, mention dates and locations if available
6. If asked about safety alerts, prioritize urgent/emergency posts
7. Format your response naturally, as if talking to a neighbor

**Your Response:**`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // Using latest available model
    
    logger.info('Calling Gemini API', {
      promptLength: prompt.length,
      postsCount: recentPosts.length,
      model: 'gemini-2.5-pro',
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Gemini returned empty response');
    }

    // Find relevant posts that might have informed the answer
    const relevantPosts = recentPosts
      .filter(post => {
        const queryLower = query.toLowerCase();
        const postTextLower = post.text.toLowerCase();
        return (
          queryLower.split(' ').some(word => postTextLower.includes(word)) ||
          post.category.toLowerCase().includes(queryLower) ||
          post.urgency === 'emergency'
        );
      })
      .slice(0, 5) // Limit to 5 most relevant
      .map(post => ({
        postId: post._id.toString(),
        text: post.text,
        category: post.category,
        urgency: post.urgency,
        createdAt: post.createdAt,
      }));

    logger.info('Assistant query processed', {
      queryLength: query.length,
      postsUsed: recentPosts.length,
      relevantPosts: relevantPosts.length,
    });

    return {
      response: responseText.trim(),
      sources: relevantPosts.length > 0 ? relevantPosts : undefined,
    };
  } catch (error: any) {
    // Log detailed error information - also log to console for immediate visibility
    const errorDetails = {
      error: error?.message,
      errorName: error?.name,
      errorStack: error?.stack,
      query: query.substring(0, 100),
      hasGeminiKey: !!config.geminiApiKey,
    };
    
    logger.error('Assistant query failed, using fallback', errorDetails);
    console.error('❌ Assistant Error (using fallback):', errorDetails);

    // Use smart fallback instead of generic error message
    return await fallbackAssistant(query, community);
  }
}

/**
 * Fallback assistant that works without Gemini API
 * Searches posts and returns relevant information
 */
async function fallbackAssistant(
  query: string,
  community?: string
): Promise<AssistantResponse> {
  try {
    // Fetch posts
    const queryFilter: any = { status: 'active' };
    if (community) {
      queryFilter.community = community;
    }

    const posts = await Post.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (posts.length === 0) {
      return {
        response: "I don't have any recent posts to analyze right now. Please check back once some posts have been created in your community.",
      };
    }

    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(w => w.length > 2);

    // Search for relevant posts
    const relevantPosts = posts.filter(post => {
      const textLower = post.text.toLowerCase();
      return keywords.some(keyword => textLower.includes(keyword)) ||
             post.category?.toLowerCase().includes(queryLower) ||
             post.urgency === 'emergency';
    });

    // Check for specific question types
    const isSafetyQuestion = /fire|emergency|danger|accident|crime|alert/i.test(query);
    const isEventQuestion = /event|festival|celebration|gathering|meeting/i.test(query);
    
    if (relevantPosts.length === 0) {
      // No relevant posts found
      if (isSafetyQuestion) {
        const safetyPosts = posts.filter(p => p.category === 'Safety' || p.urgency !== 'normal');
        if (safetyPosts.length === 0) {
          return {
            response: "Good news! I don't see any recent safety alerts or emergencies in your community.",
          };
        }
      }
      
      return {
        response: `I couldn't find any posts specifically about "${query}". However, there are ${posts.length} recent posts in your community. Try asking about specific topics like safety, events, or public works.`,
      };
    }

    // Build response from relevant posts
    const emergencyPosts = relevantPosts.filter(p => p.urgency === 'emergency');
    const urgentPosts = relevantPosts.filter(p => p.urgency === 'urgent');

    let response = '';

    if (emergencyPosts.length > 0) {
      response += `⚠️ **Emergency Alert:** There ${emergencyPosts.length === 1 ? 'is' : 'are'} ${emergencyPosts.length} emergency post(s):\n\n`;
      emergencyPosts.slice(0, 3).forEach((post, idx) => {
        const date = new Date(post.createdAt).toLocaleDateString();
        response += `${idx + 1}. (${date}) ${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}\n`;
        if (post.location) response += `   📍 ${post.location}\n`;
        response += '\n';
      });
    } else if (urgentPosts.length > 0) {
      response += `⚡ I found ${urgentPosts.length} urgent post(s):\n\n`;
      urgentPosts.slice(0, 3).forEach((post, idx) => {
        const date = new Date(post.createdAt).toLocaleDateString();
        response += `${idx + 1}. (${date}) ${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}\n`;
        if (post.location) response += `   📍 ${post.location}\n`;
        response += '\n';
      });
    } else {
      response += `I found ${relevantPosts.length} relevant post(s):\n\n`;
      relevantPosts.slice(0, 5).forEach((post, idx) => {
        const date = new Date(post.createdAt).toLocaleDateString();
        const categoryEmoji = post.category === 'Safety' ? '⚠️' : 
                            post.category === 'Events' ? '🎉' :
                            post.category === 'Public Works' ? '🏗️' : '📌';
        response += `${categoryEmoji} ${idx + 1}. (${date}) ${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}\n`;
        if (post.location) response += `   📍 ${post.location}\n`;
        response += '\n';
      });
    }

    if (relevantPosts.length > 5) {
      response += `\n(Showing 5 of ${relevantPosts.length} relevant posts)`;
    }

    logger.info('Fallback assistant response generated', {
      postsFound: posts.length,
      relevantPosts: relevantPosts.length,
    });

    return {
      response: response.trim(),
      sources: relevantPosts.slice(0, 5).map(post => ({
        postId: post._id.toString(),
        text: post.text,
        category: post.category,
        urgency: post.urgency,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    logger.error('Fallback assistant also failed', { error: error?.message });
    return {
      response: "I'm having trouble accessing the community posts right now. Please try again in a moment.",
    };
  }
}

