The About page renders `github-activity.json`, a real GitHub contribution-calendar snapshot.

Run `npm run refresh:github` with an authenticated GitHub CLI before rebuilding to update AhmedSaeed4's activity. The script only stores daily dates, counts, intensity levels and totals; credentials stay in the local CLI. It preserves the existing snapshot if GitHub returns an error. The frontend never needs a GitHub token or a third-party calendar service.

This is a static-export site, so the calendar shows its refresh date rather than implying a live feed. Only AhmedSaeed4 is used, matching the GitHub profile already linked in the site footer. Do not include bilalinit activity.
