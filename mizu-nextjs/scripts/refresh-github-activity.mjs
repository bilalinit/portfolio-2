import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Refresh at review/deploy time. Authentication stays in gh, never in the site.
const gh = process.env.GH_PATH || (process.platform === 'win32' ? 'C:/Program Files/GitHub CLI/gh.exe' : 'gh');
const users = ['AhmedSaeed4'];
const fields = 'login contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel weekday } } } }';
const query = `{ ${users.map((login, i) => `profile${i}: user(login: "${login}") { ${fields} }`).join(' ')} }`;
const response = JSON.parse(execFileSync(gh, ['api', 'graphql', '-f', `query=${query}`], { encoding: 'utf8' }));
if (response.errors) throw new Error('GitHub could not return contribution calendars. Existing snapshot preserved.');
const profiles = users.map((login, i) => {
  const user = response.data[`profile${i}`];
  if (!user || user.login.toLowerCase() !== login.toLowerCase()) throw new Error(`Missing calendar for ${login}`);
  const calendar = user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks.map((week) => week.contributionDays);
  const days = weeks.flat();
  if (!days.length || days.some((day) => !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.contributionCount) || day.contributionCount < 0)) throw new Error(`Invalid calendar for ${login}`);
  return { login: user.login, total: calendar.totalContributions, start: days[0].date, end: days.at(-1).date, weeks };
});
writeFileSync(fileURLToPath(new URL('../data/github-activity.json', import.meta.url)), JSON.stringify({ refreshedAt: new Date().toISOString(), profiles }, null, 2) + '\n');
for (const profile of profiles) console.log(`${profile.login}: ${profile.total} contributions, through ${profile.end}`);
