import snapshot from "@/data/github-activity.json";
import styles from "./GithubActivity.module.css";

const levels = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));

export default function GithubActivity() {
  const profile = snapshot.profiles[0];
  const width = profile.weeks.length * 14 + 32;
  const summary = `${profile.total.toLocaleString("en-US")} contributions on GitHub`;
  return <section className={styles.activity} aria-labelledby="activity-title">
    <header className={styles.heading}><h2 id="activity-title">GitHub activity</h2></header>
    <div className={styles.card}>
      <div className={styles.calendarScroll} tabIndex={0} role="region" aria-label={`Contribution calendar for ${profile.login}. Scroll horizontally to view the full year.`}>
        <svg className={styles.calendar} viewBox={`0 0 ${width} 135`} width={width} height="135" role="img" aria-label={`${summary} for ${profile.login}, ${formatDate(profile.start)} to ${formatDate(profile.end)}.`}>
          {[{ label: "Mon", day: 1 }, { label: "Wed", day: 3 }, { label: "Fri", day: 5 }].map(({ label, day }) => <text key={label} x="0" y={35 + day * 14}>{label}</text>)}
          {profile.weeks.map((week, column) => {
            const labelDay = week.find((day) => day.date.endsWith("-01")) || (column === 0 ? week[0] : undefined);
            return <g key={week[0].date}>
              {labelDay && <text x={32 + column * 14} y="12">{months[Number(labelDay.date.slice(5, 7)) - 1]}</text>}
              {week.map((day) => <rect key={day.date} x={32 + column * 14} y={25 + day.weekday * 14} width="11" height="11" rx="2" className={styles.day} data-level={levels.indexOf(day.contributionLevel)}><title>{day.contributionCount} {day.contributionCount === 1 ? "contribution" : "contributions"} on {formatDate(day.date)}</title></rect>)}
            </g>;
          })}
        </svg>
      </div>
      <div className={styles.caption}>
        <span>{profile.login}</span>
        <div className={styles.legend} aria-label="Contribution intensity, less to more"><span>Less</span>{levels.map((level, index) => <i key={level} className={styles.day} data-level={index} aria-hidden="true" />)}<span>More</span></div>
      </div>
    </div>
    <div className={styles.details}>
      <h3>{summary}</h3>
      <p>Code, experiments and projects in progress.</p>
      <p className={styles.period}>{formatDate(profile.start)} – {formatDate(profile.end)}</p>
      <a href={`https://github.com/${profile.login}`} target="_blank" rel="noopener noreferrer">View GitHub profile ↗</a>
      <span className={styles.updated}>Updated {formatDate(snapshot.refreshedAt)}</span>
    </div>
  </section>;
}
