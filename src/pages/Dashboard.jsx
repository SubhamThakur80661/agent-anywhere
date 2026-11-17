import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient.js";
import { useCampaignStore } from "../store/campaignStore.js";
import { useAuthStore } from "../store/authStore.js";
import InstagramPostsPopup from "../components/InstagramPostsPopup.jsx";
import TrendingTopicPopup from "../components/TrendingTopicPopup.jsx";
import { Reveal, Lines } from "../components/motion/Reveal.jsx";
import TiltCard from "../components/motion/TiltCard.jsx";
import Magnetic from "../components/motion/Magnetic.jsx";
import { ensureGsap, motionOK, EASE_OUT } from "../lib/motion.js";
import { Plus, CalendarDays, PenLine, Lightbulb, BarChart3, FolderKanban, Settings as SettingsIcon, Image as ImageIcon, ArrowUpRight } from "lucide-react";

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

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
  const weekRef = useRef(null);

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

  // Signature moment: the seven day columns rise off the board one by one
  // when the week panel scrolls into view. Transform only; no motion means
  // the bars simply render at full height.
  useLayoutEffect(() => {
    if (!motionOK() || !weekRef.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".aa-week-bar", {
        scaleY: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: EASE_OUT,
        scrollTrigger: { trigger: weekRef.current, start: "top 88%" },
      });
    }, weekRef);
    return () => ctx.revert();
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
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const headlineLines = firstName
    ? [`${greetingForHour(new Date().getHours())},`, `${firstName}.`]
    : [`${greetingForHour(new Date().getHours())}.`, "Here is the board."];
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  const shortcuts = [
    { to: "/create", icon: PenLine, label: "Write a post with the AI copywriter" },
    { to: "/idea-generator", icon: Lightbulb, label: "Generate content ideas" },
    { to: "/calendar", icon: CalendarDays, label: "See the posting calendar" },
    { to: "/analytics", icon: BarChart3, label: "View analytics" },
    { to: "/campaigns", icon: FolderKanban, label: "Manage campaigns" },
    { to: "/settings", icon: SettingsIcon, label: "Connect platforms" },
  ];

  const ledgerStats = [
    { label: "Total campaigns", value: stats.total },
    { label: "Posts this week", value: stats.scheduledThisWeek },
    { label: "Active posts", value: stats.active },
    { label: "Total posts", value: stats.totalPosts },
  ];

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

      <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[var(--text)] pb-6">
        <div>
          <p className="kicker text-[var(--text-muted)]">
            Mission board <span className="mx-1 text-[var(--brand-600)]">/</span> {todayLabel}
          </p>
          <h1 className="display-2 mt-3">
            <Lines lines={headlineLines} accent={1} accentClass="aa-line-accent-ink" delay={0.05} />
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            Here is what is happening with your campaigns today.
          </p>
        </div>
        <Reveal delay={0.3} y={16}>
          <Magnetic>
            <Button variant="primary" size="lg" onClick={() => navigate('/create')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New campaign
            </Button>
          </Magnetic>
        </Reveal>
      </div>

      <Reveal scroll>
        <div className="grid grid-cols-2 overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)] lg:grid-cols-4">
          {ledgerStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-5 py-5 ${i > 0 ? "border-l border-[var(--border)]" : ""} ${i >= 2 ? "border-t border-[var(--border)] lg:border-t-0" : ""} ${i === 2 ? "border-l-0 lg:border-l" : ""}`}
            >
              <div className="kicker text-[var(--text-muted)]">{stat.label}</div>
              <div className="font-display mt-2 text-5xl font-bold tracking-tight text-[var(--text)]">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Reveal scroll className="lg:col-span-7" delay={0.05}>
          <Card className="h-full p-0">
            <div ref={weekRef} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker text-[var(--text-muted)]">This week</p>
                  <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[var(--text)]">
                    Seven days, pinned.
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Posts scheduled for each of the next 7 days.</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-3xl font-bold tracking-tight text-[var(--text)]">
                    {stats.scheduledThisWeek}
                  </div>
                  <div className="kicker text-[var(--text-muted)]">Pinned</div>
                </div>
              </div>
              <div
                className="mt-6 flex h-44 items-end gap-2 sm:gap-3"
                role="img"
                aria-label={`Scheduled posts per day: ${weekCounts.join(', ')}`}
              >
                {weekCounts.map((count, index) => {
                  const isToday = index === 0;
                  return (
                    <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                        {count > 0 ? count : ''}
                      </span>
                      <div
                        className={`aa-week-bar w-full max-w-12 rounded-t-[2px] ${isToday ? "bg-[var(--signal)] ring-1 ring-[var(--text)]" : "bg-[var(--text)]"}`}
                        style={{ height: `${Math.max(count > 0 ? 12 : 4, (count / maxWeekCount) * 100)}%`, opacity: count > 0 || isToday ? 1 : 0.2 }}
                      />
                      <span className={`font-mono text-[11px] ${isToday ? "font-semibold text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                        {isToday ? "Today" : weekDates[index].toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal scroll className="lg:col-span-5" delay={0.12}>
          <TiltCard className="h-full" max={3}>
            <Card className="h-full p-0">
              <div className="flex items-center justify-between px-5 pb-3 pt-5">
                <div>
                  <p className="kicker text-[var(--text-muted)]">Ledger</p>
                  <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-[var(--text)]">Recent activity</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstagramPopup(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--text)] underline decoration-[var(--signal)] decoration-2 underline-offset-4 hover:decoration-[var(--text)]"
                >
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  Instagram posts
                </button>
              </div>
              {recent.length === 0 ? (
                <div className="px-5 pb-6">
                  <p className="text-sm text-[var(--text-muted)]">
                    Nothing here yet. Create your first campaign and it will show up here.
                  </p>
                  <Link to="/create" className="mt-3 inline-block">
                    <Button variant="secondary" size="sm">Create a campaign</Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {recent.map((item, index) => (
                    <li key={index} className="aa-ledger-row flex items-start gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--text)]">{item.text}</div>
                        {item.subtitle && (
                          <div className="truncate text-xs text-[var(--text-muted)]">{item.subtitle}</div>
                        )}
                      </div>
                      <div className="whitespace-nowrap font-mono text-xs text-[var(--text-light)]">{timeAgo(item.time)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TiltCard>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Reveal scroll className="lg:col-span-5" delay={0.05}>
          <TiltCard className="h-full" max={3}>
            <Card className="h-full p-5">
              <p className="kicker text-[var(--text-muted)]">Worth a look</p>
              <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-[var(--text)]">Trending topics</h2>
              <p className="mb-4 mt-1 text-sm text-[var(--text-muted)]">Pick one to see what people are posting about it.</p>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.name}
                    type="button"
                    onClick={() => setTrendingPopup({ open: true, topic: topic.name, category: topic.name })}
                    className="rounded-[4px] border-[1.5px] border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition duration-150 hover:-translate-y-px hover:border-[var(--text)] hover:bg-[var(--signal)] hover:text-[var(--signal-ink)]"
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </Card>
          </TiltCard>
        </Reveal>

        <Reveal scroll className="lg:col-span-7" delay={0.12}>
          <TiltCard className="h-full" max={3}>
            <Card className="h-full p-5">
              <p className="kicker text-[var(--text-muted)]">Go to</p>
              <h2 className="font-display mb-2 mt-1 text-xl font-bold tracking-tight text-[var(--text)]">Shortcuts</h2>
              <div className="divide-y divide-[var(--border)]">
                {shortcuts.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="aa-ledger-row group flex items-center gap-3 py-2.5"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                    <span className="flex-1 text-sm font-medium text-[var(--text)]">{item.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--text-light)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </Card>
          </TiltCard>
        </Reveal>
      </div>
    </div>
  );
}

export default Dashboard;
