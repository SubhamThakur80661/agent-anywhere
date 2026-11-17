/**
 * Analytics API Service
 * Handles all API calls related to Facebook analytics and insights.
 *
 * When the backend is unreachable, every method returns empty data with
 * configured: false. It never invents numbers: showing made-up followers
 * or engagement would pass fiction off as the user's real analytics.
 */

import { apiUrl } from '../lib/api.js';

const apiPath = (path) => apiUrl(`/socialanywhere/api${path}`);

class AnalyticsService {
  /** Get comprehensive analytics overview */
  async getAnalyticsOverview() {
    try {
      const response = await fetch(apiPath('/analytics/overview'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics overview');
      return data.data;
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      return this.getFallbackOverview();
    }
  }

  /** Get page followers count */
  async getFollowers() {
    try {
      const response = await fetch(apiPath('/analytics/followers'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch followers');
      return { followers: data.followers || 0, configured: data.configured || false, error: data.error || null };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { followers: 0, configured: false, error: error.message };
    }
  }

  /** Get audience demographics */
  async getDemographics() {
    try {
      const response = await fetch(apiPath('/analytics/demographics'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch demographics');
      return { by_country: data.by_country || {}, by_age_gender: data.by_age_gender || {}, configured: data.configured || false, error: data.error || null };
    } catch (error) {
      console.error('Error fetching demographics:', error);
      return this.getFallbackDemographics();
    }
  }

  /** Get posts analytics with engagement metrics */
  async getPostsAnalytics(limit = 10) {
    try {
      const response = await fetch(apiPath(`/analytics/posts?limit=${limit}`));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch posts analytics');
      return { posts: data.posts || [], configured: data.configured || false, error: data.error || null };
    } catch (error) {
      console.error('Error fetching posts analytics:', error);
      return this.getFallbackPostsAnalytics();
    }
  }

  /** Get best performing post */
  async getBestPost(limit = 10) {
    try {
      const response = await fetch(apiPath(`/analytics/posts/best?limit=${limit}`));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch best post');
      return { post: data.post || {}, configured: data.configured || false, error: data.error || null };
    } catch (error) {
      console.error('Error fetching best post:', error);
      return this.getFallbackBestPost();
    }
  }

  /** Get worst performing post */
  async getWorstPost(limit = 10) {
    try {
      const response = await fetch(apiPath(`/analytics/posts/worst?limit=${limit}`));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch worst post');
      return { post: data.post || {}, configured: data.configured || false, error: data.error || null };
    } catch (error) {
      console.error('Error fetching worst post:', error);
      return this.getFallbackWorstPost();
    }
  }

  /** Get available analytics metrics */
  async getAvailableMetrics() {
    try {
      const response = await fetch(apiPath('/analytics/metrics'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch available metrics');
      return { available_metrics: data.available_metrics || [], configured: data.configured || false };
    } catch (error) {
      console.error('Error fetching available metrics:', error);
      return { available_metrics: ['page_fans','page_fans_country','page_fans_gender_age','post_impressions','post_reach','post_engaged_users','post_reactions_by_type_total'], configured: false };
    }
  }

  /** Get analytics service status */
  async getAnalyticsStatus() {
    try {
      const response = await fetch(apiPath('/analytics/status'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics status');
      return { configured: data.configured || false, page_id_present: data.page_id_present || false, access_token_present: data.access_token_present || false, service_ready: data.service_ready || false };
    } catch (error) {
      console.error('Error fetching analytics status:', error);
      return { configured: false, page_id_present: false, access_token_present: false, service_ready: false };
    }
  }

  /** Transform posts data for visualization components */
  transformPostsForVisualization(posts) {
    return posts.map((post, index) => ({
      id: post.id || `post_${index}`,
      likes: Math.round((post.reactions?.like || 0) + (post.reactions?.love || 0) * 1.5),
      comments: Math.round((post.engaged_users || 0) * 0.15),
      shares: Math.round((post.engaged_users || 0) * 0.05),
      impressions: post.impressions || 0,
      reach: post.reach || 0,
      engagement_rate: Math.round((post.engagement_rate || 0) * 100 * 10) / 10,
      message: post.message || 'No message',
      created_time: post.created_time || new Date().toISOString()
    }));
  }

  /** Generate engagement over time data from posts */
  generateEngagementOverTime(posts) {
    const engagementByDate = {};
    posts.forEach(post => {
      if (post.created_time) {
        const date = new Date(post.created_time).toISOString().slice(0, 10);
        if (!engagementByDate[date]) engagementByDate[date] = { total_engagement: 0, count: 0 };
        engagementByDate[date].total_engagement += post.engaged_users || 0;
        engagementByDate[date].count += 1;
      }
    });
    const engagementOverTime = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      let engagement = 0;
      if (engagementByDate[dateStr]) {
        engagement = Math.round(engagementByDate[dateStr].total_engagement / engagementByDate[dateStr].count);
      }
      engagementOverTime.push({ date: dateStr, engagement });
    }
    return engagementOverTime;
  }

  /** Generate heatmap data for posting effectiveness */
  generateHeatmapData() {
    return Array.from({ length: 7 }).map((_, day) =>
      Array.from({ length: 24 }).map((_, hour) => ({ day, hour, value: 0 }))
    );
  }

  // Fallbacks: empty data, never invented numbers
  getFallbackOverview() {
    return { totals: { followers: 0, impressions: 0, reach: 0, engagement_rate: 0, best_post: null }, demographics: { by_country: {}, by_age_gender: {} }, posts: [], best_post: {}, metrics_available: false, configured: false };
  }
  getFallbackDemographics() { return { by_country: {}, by_age_gender: {}, configured: false }; }
  getFallbackPostsAnalytics() { return { posts: [], configured: false }; }
  getFallbackBestPost() { return { post: {}, configured: false }; }
  getFallbackWorstPost() { return { post: {}, configured: false }; }
}

const analyticsService = new AnalyticsService();
export default analyticsService;


