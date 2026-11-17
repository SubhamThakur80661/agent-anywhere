import { useMemo, useState, useEffect } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient.js";
import { useCampaignStore } from "../store/campaignStore.js";
import { useAuthStore } from "../store/authStore.js";
import InstagramPostsPopup from "../components/InstagramPostsPopup.jsx";
import TrendingTopicPopup from "../components/TrendingTopicPopup.jsx";
import { Plus, CalendarDays, PenLine, Lightbulb, BarChart3, FolderKanban, Settings as SettingsIcon, Image as ImageIcon } from "lucide-react";

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-3xl font-semibold text-[var(--text)]">{value}</div>
    </Card>
  );
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const campaigns = useCampaignStore((state) => state.campaigns);
  const recentActivity = useCampaignStore((state) => state.recentActivity);

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showInstagramPopup, setShowInstagramPopup] = useState(false);
  const [trendingPopup, setTrendingPopup] = useState({ open: false, topic: null, category: null });

  function getWeekDates(fromDate) {
    const d = new Date(fromDate);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const copy = new Date(d);
      copy.setDate(d.getDate() + i);
      week.push(copy);
    }
    return week;
  }

  const weekDates = getWeekDates(new Date());
  // Prioritize scheduled posts over calendar events since they're more current
  const scheduledSource = useMemo(() => {
    return (scheduledPosts && scheduledPosts.length > 0)
      ? scheduledPosts
      : (calendarEvents && calendarEvents.length > 0)
        ? calendarEvents
        : (allPosts || []).filter((p) => (p.status || '').toLowerCase() === 'scheduled');
  }, [scheduledPosts, calendarEvents, allPosts]);

  const weekCounts = useMemo(() => {
    const counts = new Array(7).fill(0);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(start.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    for (const item of scheduledSource) {
      const when = new Date(
        item.scheduled_at ||
        item.scheduled_time ||
        item.scheduledAt ||
        item.start_time ||
        item.start ||
        item.date || 0
      );

      if (!isNaN(when.getTime()) && when >= start && when < end) {
        const diffDays = Math.floor((when - start) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          counts[diffDays] += 1;
        }
      }
    }
    return counts;
  }, [scheduledSource]);

  const stats = useMemo(() => {
    const posts = Array.isArray(allPosts) && allPosts.length > 0 ? allPosts : [];
    const hasPosts = posts.length > 0;

    const ids = new Set();
    if (hasPosts) {
      posts.forEach(p => {
        const key = (p.campaign_name && p.campaign_name.trim()) || p.batch_id || `post_${p.id}`;
        ids.add(key);
      });
    } else {
      campaigns.forEach(c => ids.add(c.batchId || c.campaignName || `single_${c.id}`));
    }
    const totalCampaigns = ids.size;

    const start = new Date();
    const dow = (start.getDay() + 6) % 7; // Mon=0
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - dow);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    let postsThisWeek = weekCounts.reduce((a, b) => a + b, 0);
    if (postsThisWeek === 0 && hasPosts) {
      postsThisWeek = posts.filter(p => {
        const when = new Date(p.created_at || p.scheduled_at || p.start_time || 0);
        return !isNaN(when) && when >= start && when <= end;
      }).length;
    }

    let activePosts = 0;
    if (hasPosts) {
      activePosts = posts.filter(p => {
        const s = (p.status || '').toLowerCase();
        const when = new Date(p.scheduled_at || p.created_at || 0);
        const activeStatus = s === 'scheduled' || s === 'posted' || s === 'published' || s === 'active';
        return activeStatus || (!isNaN(when) && when >= start && when <= end);
      }).length;
    } else {
      activePosts = campaigns.filter(c => {
        const s = (c.status || '').toLowerCase();
        return s === 'scheduled' || s === 'posted' || s === 'published';
      }).length;
    }

    const totalPosts = hasPosts ? posts.length : campaigns.length;
    return { total: totalCampaigns, scheduledThisWeek: postsThisWeek, active: activePosts, totalPosts };
  }, [campaigns, allPosts, weekCounts]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { loadCampaignsFromDB } = useCampaignStore.getState();
        await loadCampaignsFromDB();

        try {
          const calRes = await apiClient.getCalendarEvents();
          if (!mounted) return;
          if (calRes && calRes.success && Array.isArray(calRes.events)) {
            const normalized = calRes.events.map((ev, idx) => ({
              id: String(ev.id ?? idx),
              title: ev.title || 'Post Event',
              description: ev.description || '',
              start_time: ev.start_time || ev.start || null,
              end_time: ev.end_time || ev.end || null,
              scheduled_at: ev.start_time || ev.start || null,
              platforms: Array.isArray(ev.platforms) ? ev.platforms : (
                Array.isArray(ev.metadata?.platforms) ? ev.metadata.platforms : (
                  ev.platform ? [ev.platform] : ['Instagram']
                )
              ),
              platform: ev.platform || "",
              post_id: ev.post_id || null,
            }));
            setCalendarEvents(prev => (normalized.length ? normalized : prev));
          }
        } catch (e) {
          console.warn('Failed to load calendar events', e);
        }

        try {
          const schedRes = await apiClient.getScheduledPosts();
          if (!mounted) return;
          if (schedRes && schedRes.success && Array.isArray(schedRes.scheduled_posts)) {
            const normalized = schedRes.scheduled_posts.map((sp, idx) => ({
              id: String(sp.id ?? sp.post_id ?? sp.event_id ?? idx),
              original_description: sp.original_description || sp.caption || sp.title || sp.message || "",
              caption: sp.caption || "",
              campaign_name: sp.campaign_name || "",
              platforms: sp.platforms || [],
              platform: sp.platform || "",
              scheduled_at: sp.scheduled_at || sp.scheduled_time || sp.start_time || sp.date || null,
              status: (sp.status || "scheduled").toLowerCase(),
              start_time: sp.start_time || null,
            }));
            setScheduledPosts(prev => (normalized.length ? normalized : prev));
          }
        } catch (e) {
          console.error('Failed to load scheduled posts', e);
        }

        try {
          const allRes = await apiClient.getAllPosts({ limit: 100 });
          if (!mounted) return;
          if (allRes && allRes.success && Array.isArray(allRes.posts)) {
            const normalized = allRes.posts.map((p) => ({
              id: String(p.id),
              original_description: p.original_description || p.caption || p.title || p.message || "",
              caption: p.caption || "",
              campaign_name: p.campaign_name || "",
              platforms: p.platforms || [],
              platform: p.platform || "",
              created_at: p.created_at || p.createdAt || null,
              scheduled_at: p.scheduled_at || p.scheduled_time || p.start_time || p.scheduledAt || null,
              status: (p.status || "").toLowerCase(),
              batch_id: p.batch_id || null,
            }));
            setAllPosts(prev => (normalized.length ? normalized : prev));
          }
        } catch (e) {
          console.warn('Failed to load all posts', e);
        }
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const recent = useMemo(() => {
    if (recentActivity && recentActivity.length > 0) {
      return recentActivity.slice(0, 5).map((a) => ({
        text: a.text,
        subtitle: a.subtitle,
        time: a.time,
      }));
    }

    if (campaigns && campaigns.length > 0) {
      return campaigns
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5)
        .map(c => ({
          text: c.campaignName || c.productDescription || `Campaign created`,
          subtitle: c.platforms?.length ? `For ${c.platforms.join(', ')}` : undefined,
          time: c.createdAt || Date.now()
        }));
    }

    if (allPosts && allPosts.length > 0) {
      return allPosts
        .slice()
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5)
        .map(p => ({
          text: p.campaign_name || p.original_description || `Post ${p.id}`,
          subtitle: p.status ? `Status: ${p.status}` : undefined,
          time: new Date(p.created_at || Date.now()).getTime()
        }));
    }

    return [];
  }, [recentActivity, campaigns, allPosts]);

  const trendingTopics = [
    { name: "AI Technology" },
    { name: "Social Media" },
    { name: "Marketing" },
    { name: "Automation" }
  ];

  const maxWeekCount = Math.max(1, ...weekCounts);

  return (
    <div className="space-y-6">
      {showInstagramPopup && (
        <InstagramPostsPopup
          isOpen={showInstagramPopup}
          onClose={() => setShowInstagramPopup(false)}
        />
      )}

      {trendingPopup.open && (
        <TrendingTopicPopup
          isOpen={trendingPopup.open}
          topic={trendingPopup.topic}
          category={trendingPopup.category}
          onClose={() => setTrendingPopup({ open: false, topic: null, category: null })}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Here is what is happening with your campaigns today.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/create')}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          New campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total campaigns" value={stats.total} />
        <StatCard label="Posts this week" value={stats.scheduledThisWeek} />
        <StatCard label="Active posts" value={stats.active} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold text-[var(--text)]">Recent activity</h2>
            <button
              type="button"
              onClick={() => setShowInstagramPopup(true)}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
            >
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              Instagram posts
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 pb-6">
              <p className="text-sm text-[var(--text-muted)]">
                Nothing here yet. Create your first campaign and it will show up here.
              </p>
              <Link to="/create" className="inline-block mt-3">
                <Button variant="secondary" size="sm">Create a campaign</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recent.map((item, index) => (
                <li key={index} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{item.text}</div>
                    {item.subtitle && (
                      <div className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-light)] whitespace-nowrap">{timeAgo(item.time)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-[var(--text)] mb-1">This week</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">Posts scheduled for each of the next 7 days.</p>
          <div className="flex items-end gap-3 h-28" role="img" aria-label={`Scheduled posts per day: ${weekCounts.join(', ')}`}>
            {weekCounts.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-medium text-[var(--text-muted)]">{count > 0 ? count : ''}</span>
                <div
                  className="w-full max-w-10 rounded-t-md bg-[var(--primary)]"
                  style={{ height: `${Math.max(count > 0 ? 12 : 4, (count / maxWeekCount) * 100)}%`, opacity: count > 0 ? 1 : 0.25 }}
                />
                <span className="text-xs text-[var(--text-muted)]">
                  {weekDates[index].toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Total posts</span>
            <span className="font-semibold text-[var(--text)]">{stats.totalPosts}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold text-[var(--text)] mb-1">Trending topics</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Pick one to see what people are posting about it.</p>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic.name}
                type="button"
                onClick={() => setTrendingPopup({ open: true, topic: topic.name, category: topic.name })}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text)] hover:border-[var(--primary)] transition-colors"
              >
                {topic.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-[var(--text)] mb-4">Shortcuts</h2>
          <div className="space-y-1">
            <Link to="/create" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <PenLine className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">Write a post with the AI copywriter</span>
            </Link>
            <Link to="/idea-generator" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <Lightbulb className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">Generate content ideas</span>
            </Link>
            <Link to="/calendar" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">See the posting calendar</span>
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <BarChart3 className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">View analytics</span>
            </Link>
            <Link to="/campaigns" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <FolderKanban className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">Manage campaigns</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
              <SettingsIcon className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text)]">Connect platforms</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
