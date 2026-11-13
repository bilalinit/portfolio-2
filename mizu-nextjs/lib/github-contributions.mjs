export const GITHUB_LOGIN = 'AhmedSaeed4';
export const CONTRIBUTION_LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
const DAY = 86_400_000;

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map((match) => [match[1], match[2]]));
}
function text(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}
function dateValue(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN;
  const value = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date ? value : NaN;
}

// This public GitHub response is not an API contract. Reject changed/partial
// markup instead of silently displaying an empty or misleading calendar.
export function parseGithubCalendar(html, fetchedAt = new Date().toISOString()) {
  if (typeof html !== 'string' || html.length > 1_000_000) throw new Error('Invalid GitHub calendar response');
  const counts = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attributes(match[1]).for;
    const count = text(match[2]).match(/^(No|[\d,]+) contributions? on\b/);
    if (id && count) counts.set(id, count[1] === 'No' ? 0 : Number(count[1].replaceAll(',', '')));
  }
  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const attrs = attributes(match[0]);
    const value = dateValue(attrs['data-date']);
    const level = Number(attrs['data-level']);
    const count = counts.get(attrs.id);
    if (!Number.isFinite(value) || !Number.isInteger(count) || count < 0 || !/^[0-4]$/.test(attrs['data-level'])) throw new Error('Incomplete GitHub calendar');
    days.push({ date: attrs['data-date'], contributionCount: count, contributionLevel: CONTRIBUTION_LEVELS[level], weekday: new Date(value).getUTCDay() });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 350 || days.length > 378) throw new Error('Incomplete GitHub calendar year');
  for (let i = 1; i < days.length; i++) if (dateValue(days[i].date) - dateValue(days[i - 1].date) !== DAY) throw new Error('Non-contiguous GitHub calendar');
  const total = days.reduce((sum, day) => sum + day.contributionCount, 0);
  const heading = html.match(/<h2\b[^>]*\bid="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/);
  const published = heading && text(heading[1]).match(/^([\d,]+) contributions? in\b/);
  if (!published || Number(published[1].replaceAll(',', '')) !== total) throw new Error('GitHub contribution total mismatch');
  const weeks = [];
  for (const day of days) {
    if (!weeks.length || day.weekday === 0) weeks.push([]);
    weeks.at(-1).push(day);
  }
  const result = { refreshedAt: fetchedAt, profiles: [{ login: GITHUB_LOGIN, total, start: days[0].date, end: days.at(-1).date, weeks }] };
  if (!isGithubActivity(result)) throw new Error('Invalid GitHub contribution data');
  return result;
}

export function isGithubActivity(data) {
  if (!data || !Number.isFinite(Date.parse(data.refreshedAt)) || !Array.isArray(data.profiles) || data.profiles.length !== 1) return false;
  const profile = data.profiles[0];
  if (!profile || profile.login !== GITHUB_LOGIN || !Number.isInteger(profile.total) || profile.total < 0 || !Array.isArray(profile.weeks) || profile.weeks.length < 50 || profile.weeks.length > 54) return false;
  if (profile.weeks.some((week) => !Array.isArray(week) || week.length < 1 || week.length > 7)) return false;
  const days = profile.weeks.flat();
  if (days.length < 350 || days.length > 378 || profile.start !== days[0]?.date || profile.end !== days.at(-1)?.date) return false;
  let sum = 0;
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const value = dateValue(day?.date);
    if (!Number.isFinite(value) || !Number.isInteger(day.contributionCount) || day.contributionCount < 0 || !CONTRIBUTION_LEVELS.includes(day.contributionLevel) || day.weekday !== new Date(value).getUTCDay()) return false;
    if (i && value - dateValue(days[i - 1].date) !== DAY) return false;
    sum += day.contributionCount;
  }
  return sum === profile.total;
}
