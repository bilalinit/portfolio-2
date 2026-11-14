"use client";

import { useEffect, useState } from "react";
import snapshot from "@/data/github-activity.json";
import { isGithubActivity } from "@/lib/github-contributions.mjs";
import styles from "./GithubActivity.module.css";

const levels = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));

export default function GithubActivity() {
  const [activity, setActivity] = useState(snapshot);
  useEffect(() => {
    const interval = 60 * 60 * 1000;
    let disposed = false;
    let lastAttempt = 0;
    let activeRequest: AbortController | null = null;
    const refresh = async () => {
      if (disposed || activeRequest || Date.now() - lastAttempt < interval) return;
      lastAttempt = Date.now();
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch('/api/github-activity', { signal: controller.signal });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
        const data = await response.json();
        if (!disposed && isGithubActivity(data) && Date.parse(data.refreshedAt) >= Date.parse(snapshot.refreshedAt)) setActivity(data as typeof snapshot);
      } catch {
        // Keep the last successful counts and their actual refresh date.
      } finally {
        window.clearTimeout(timeout);
        activeRequest = null;
      }
    };
    const whenVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    void refresh();
    const timer = window.setInterval(whenVisible, interval);
    document.addEventListener('visibilitychange', whenVisible);
    return () => { disposed = true; activeRequest?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', whenVisible); };
  }, []);
  const profile = activity.profiles[0];
  const width = profile.weeks.length * 14 + 32;
  const summary = `${profile.total.toLocaleString("en-US")} contributions on GitHub`;
  return <section className={styles.activity} aria-labelledby="activity-title">
    <header className={styles.heading} data-scroll-reveal="text"><h2 id="activity-title">GitHub activity</h2></header>
    <div className={styles.card} data-scroll-reveal="fade">
      <div className={styles.calendarScroll} tabIndex={0} role="region" aria-label={`Contribution calendar for ${profile.login}. Scroll horizontally to view the full year.`}>
        <svg className={styles.calendar} viewBox={`0 0 ${width} 135`} width={width} height="135" role="img" aria-label={`${summary} for ${profile.login}, ${formatDate(profile.start)} to ${formatDate(profile.end)}.`}>
          {[{ label: "Mon", day: 1 }, { label: "Wed", day: 3 }, { label: "Fri", day: 5 }].map(({ label, day }) => <text key={label} x="0" y={35 + day * 14}>{label}</text>)}
          {profile.weeks.map((week, column) => {
            const labelDay = week.find((day) => day.date.endsWith("-01")) || (column === 0 ? week[0] : undefined);
            return <g key={week[0].date}>
              {labelDay && <text x={32 + column * 14} y="12">{months[Number(labelDay.date.slice(5, 7)) - 1]}</text>}
              {week.map((day) => <rect key={day.date} x={32 + column * 14} y={25 + day.weekday * 14} width="11" height="11" rx="2" className={styles.day} data-level={levels.indexOf(day.contributionLevel)}><title>{`${day.contributionCount} ${day.contributionCount === 1 ? "contribution" : "contributions"} on ${formatDate(day.date)}`}</title></rect>)}
            </g>;
          })}
        </svg>
      </div>
      <div className={styles.caption}>
        <span>{profile.login}</span>
        <div className={styles.legend} aria-label="Contribution intensity, less to more"><span>Less</span>{levels.map((level, index) => <i key={level} className={styles.day} data-level={index} aria-hidden="true" />)}<span>More</span></div>
      </div>
    </div>
    <div className={styles.details} data-scroll-reveal="text" data-reveal-step="1">
      <h3>{summary}</h3>
      <p>Code, experiments and projects in progress.</p>
      <p className={styles.period}>{formatDate(profile.start)} – {formatDate(profile.end)}</p>
      <a href={`https://github.com/${profile.login}`} target="_blank" rel="noopener noreferrer">View GitHub profile ↗</a>
      <time dateTime={activity.refreshedAt} className={styles.updated}>Updated {formatDate(activity.refreshedAt)}</time>
    </div>
  </section>;
}
