"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/posts/types";
import { getPostsForDay } from "@/lib/posts/getPostsForDay";
import { deletePostApi, updatePostApi } from "@/lib/posts/postsApi.client";

import {
  addDays,
  addMonths,
  endOfMonth,
  formatDayLabelFR,
  formatShortFR,
  isSameDay,
  sortByCreatedDesc,
  startOfDay,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/posts/calendarUtils";

import PostModal from "./PostModal";
import DayModal from "./DayModal";
import PostList from "./PostList";
import PostEditModal from "./PostEditModal";

type Mode = "day" | "3days" | "week" | "month";

const MODES = [
  { key: "day", label: "Aujourd'hui" },
  { key: "3days", label: "3 jours" },
  { key: "week", label: "1 semaine" },
  { key: "month", label: "1 mois" },
] as const;

export default function CalendarView({ posts }: { posts: Post[] }) {
  const [items, setItems] = useState<Post[]>(posts ?? []);
  const [mode, setMode] = useState<Mode>("day");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  const today = startOfDay(new Date());

  useEffect(() => {
    setItems(posts ?? []);
  }, [posts]);

  // on enlève A_LA_UNE du calendrier
  const calendarPosts = useMemo(
    () => (items ?? []).filter((p) => p.type !== "A_LA_UNE"),
    [items]
  );

  async function handleDelete(post: Post | null) {
    if (!post) return;
    const prev = items;
    setItems((current) => current.filter((p) => p.id !== post.id));
    setSelectedPost(null);
    setExpandedDay(null);
    setEditing(null);

    try {
      await deletePostApi(post.id);
    } catch (e) {
      setItems(prev);
      alert((e as Error).message);
    }
  }

  async function handleSave(
    post: Post | null,
    input: {
      content: string;
      type: Post["type"];
      startAt: Date;
      endAt?: Date;
      authorName: string;
      authorEmail?: string;
    }
  ) {
    if (!post) return;
    setSaving(true);
    try {
      const updated = await updatePostApi(post.id, input);
      setItems((current) =>
        current.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditing(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const { periodStart, periodEnd } = useMemo(() => {
    if (mode === "day") {
      const start = startOfDay(cursor);
      return { periodStart: start, periodEnd: start };
    }
    if (mode === "3days") {
      const start = startOfDay(cursor);
      return { periodStart: start, periodEnd: addDays(start, 2) };
    }
    if (mode === "week") {
      const start = startOfWeekMonday(cursor);
      return { periodStart: start, periodEnd: addDays(start, 6) };
    }
    const start = startOfMonth(cursor);
    return { periodStart: start, periodEnd: endOfMonth(cursor) };
  }, [mode, cursor]);

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let d = periodStart; d <= periodEnd; d = addDays(d, 1)) {
      result.push(d);
    }
    return result;
  }, [periodStart, periodEnd]);

  function goPrev() {
    if (mode === "day") setCursor((c) => addDays(c, -1));
    else if (mode === "3days") setCursor((c) => addDays(c, -3));
    else if (mode === "week") setCursor((c) => addDays(c, -7));
    else setCursor((c) => addMonths(c, -1));
  }

  function goNext() {
    if (mode === "day") setCursor((c) => addDays(c, 1));
    else if (mode === "3days") setCursor((c) => addDays(c, 3));
    else if (mode === "week") setCursor((c) => addDays(c, 7));
    else setCursor((c) => addMonths(c, 1));
  }

  function setModeAndReset(newMode: Mode) {
    setMode(newMode);
    setCursor(startOfDay(new Date()));
    setExpandedDay(null);
  }

  const gridCols =
    mode === "day"
      ? "grid-cols-1"
      : mode === "3days"
      ? "grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
      : mode === "week"
      ? "grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]"
      : "grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]";

  function formatLabelByMode(day: Date) {
    if (mode === "day" || mode === "3days") {
      const label = formatDayLabelFR(day);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (mode === "week") {
      const label = day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  }

  function formatPeriodRecap() {
    if (mode === "month") {
      const label = periodStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return `du ${formatShortFR(periodStart)} au ${formatShortFR(periodEnd)}`;
  }

  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? mode;
  const isDayMode = mode === "day";

  const arrowBase =
    "h-10 w-10 pb-2 flex items-center justify-center shrink-0 rounded-lg text-4xl leading-none hover:scale-95 transition-colors cursor-pointer";

  return (
    <section className="w-full" suppressHydrationWarning>
      {/* TABS FILTERS */}
      <div className="mb-4 w-fit rounded-md bg-[var(--grey)] p-1 inset-shadow-md">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`btn-tab ${
              mode === m.key ? "btn-tab--active shadow-sm" : "btn-tab--inactive"
            }`}
            onClick={() => setModeAndReset(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="p-4 shadow-sm backdrop-blur sm:p-6">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className={arrowBase} aria-label="Période précédente">
              ←
            </button>
            <div className="ml-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-semibold text-slate-700">
              {formatPeriodRecap()}
            </div>
            <button onClick={goNext} className={arrowBase} aria-label="Période suivante">
              →
            </button>

          </div>
        </div>

        <div
          className={`mt-5 grid gap-px rounded-2xl border border-slate-200/80 bg-slate-200/80 ${gridCols}`}
        >
          {days.map((day) => {
            const dayPosts = sortByCreatedDesc(getPostsForDay(calendarPosts, day));
            const postsToShow = isDayMode ? dayPosts : dayPosts.slice(0, 3);
            const remaining = Math.max(0, dayPosts.length - postsToShow.length);

            return (
              <div
                key={day.toISOString()}
                className={`min-w-0 bg-white/90 p-3 sm:p-4 ${
                  isSameDay(day, today) ? "bg-emerald-50/70" : ""
                }`}
              >
                <div
                  className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
                  onClick={() => {
                    setMode("day");
                    setCursor(startOfDay(day));
                    setExpandedDay(null);
                  }}
                >
                  <span className="truncate">{formatLabelByMode(day)}</span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                    {day.getDate()}
                  </span>
                </div>

                <div className="mt-2 text-sm text-[var(--muted)]">
                  {dayPosts.length === 0 ? (
                    <div className="text-[var(--muted-subtle)]">Aucune publication</div>
                  ) : (
                    <PostList
                      posts={postsToShow}
                      remaining={isDayMode ? 0 : remaining}
                      onSelectPost={setSelectedPost}
                      onShowMore={() => setExpandedDay(day)}
                      showMeta={isSameDay(day, today)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal : tous les posts d'un jour */}
      {expandedDay && (
        <DayModal
          day={expandedDay}
          posts={sortByCreatedDesc(getPostsForDay(calendarPosts, expandedDay))}
          onSelectPost={setSelectedPost}
          onClose={() => setExpandedDay(null)}
        />
      )}

      {/* Modal : détail post */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={(post) => {
            setEditing(post);
            setSelectedPost(null);
          }}
          onDelete={(post) => void handleDelete(post)}
        />
      )}

      {editing && (
        <PostEditModal
          post={editing}
          saving={saving}
          onCancel={() => setEditing(null)}
          onDelete={() => void handleDelete(editing)}
          onSave={(input) => void handleSave(editing, input)}
        />
      )}
    </section>
  );
}
