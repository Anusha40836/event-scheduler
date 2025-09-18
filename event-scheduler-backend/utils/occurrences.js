// utils/occurrences.js

function cloneDate(d) {
  return new Date(d.getTime());
}
function addDaysUTC(d, days) {
  const r = new Date(d.getTime());
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}
function addMonthsUTC(d, months) {
  // Use UTC-based constructor to avoid local tz shifts.
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth() + months,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    )
  );
}
function sameOrAfter(a, b) {
  return a.getTime() >= b.getTime();
}

// Weekly generator:
// options:
// - startDate: Date (anchor)
// - weekdays: array of 0..6
// - interval: every N weeks
// - endDate: Date or null
// - maxOccurrences: integer or null
function generateWeeklyOccurrences({
  startDate,
  weekdays = [startDate.getUTCDay()],
  interval = 1,
  endDate = null,
  maxOccurrences = null,
}) {
  weekdays = Array.from(new Set(weekdays)).sort((a, b) => a - b);

  const results = [];
  const anchor = cloneDate(startDate);
  const anchorTime = {
    h: anchor.getUTCHours(),
    m: anchor.getUTCMinutes(),
    s: anchor.getUTCSeconds(),
    ms: anchor.getUTCMilliseconds(),
  };

  // We'll iterate week blocks starting at the week of anchor.
  // Define a base "weekStart" as the anchor itself (we'll compute within-week candidates)
  const weekStart = new Date(
    Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      anchor.getUTCDate(),
      anchorTime.h,
      anchorTime.m,
      anchorTime.s,
      anchorTime.ms
    )
  );

  let occurrences = 0;
  let weekBlock = 0;

  // guard to avoid infinite loops when neither endDate nor maxOccurrences provided
  const SAFETY_LIMIT = 10000;

  while (true) {
    const blockBase = addDaysUTC(weekStart, weekBlock * 7);
    for (const wd of weekdays) {
      const baseWeekday = blockBase.getUTCDay();
      const delta = wd - baseWeekday;
      const candidate = addDaysUTC(blockBase, delta);
      // ensure candidate keeps time-of-day
      candidate.setUTCHours(
        anchorTime.h,
        anchorTime.m,
        anchorTime.s,
        anchorTime.ms
      );

      if (!sameOrAfter(candidate, anchor)) continue;
      if (endDate && candidate.getTime() > endDate.getTime()) return results;
      if (maxOccurrences && occurrences >= maxOccurrences) return results;

      results.push(candidate);
      occurrences += 1;
      if (maxOccurrences && occurrences >= maxOccurrences) return results;
      if (results.length >= SAFETY_LIMIT) return results;
    }
    weekBlock += interval;
    // safety: if no stopping condition & very large, break
    if (!endDate && !maxOccurrences && results.length > SAFETY_LIMIT) break;
  }
  return results;
}

// Monthly generator:
// options:
// - startDate: Date (anchor)
// - monthDates: array of days-of-month (1..31)
// - interval: every N months
// - endDate: Date or null
// - maxOccurrences: integer or null
function generateMonthlyOccurrences({
  startDate,
  monthDates = [startDate.getUTCDate()],
  interval = 1,
  endDate = null,
  maxOccurrences = null,
}) {
  monthDates = Array.from(new Set(monthDates)).sort((a, b) => a - b);
  const results = [];
  const anchor = cloneDate(startDate);
  const anchorTime = {
    h: anchor.getUTCHours(),
    m: anchor.getUTCMinutes(),
    s: anchor.getUTCSeconds(),
    ms: anchor.getUTCMilliseconds(),
  };

  let monthsAdded = 0;
  let occurrences = 0;
  const SAFETY_LIMIT = 10000;

  while (true) {
    const monthStart = addMonthsUTC(
      new Date(
        Date.UTC(
          anchor.getUTCFullYear(),
          anchor.getUTCMonth(),
          1,
          anchorTime.h,
          anchorTime.m,
          anchorTime.s,
          anchorTime.ms
        )
      ),
      monthsAdded
    );
    const year = monthStart.getUTCFullYear();
    const month = monthStart.getUTCMonth();

    for (const day of monthDates) {
      // Construct candidate; Date will roll over if invalid. We'll check month equality after.
      const candidate = new Date(
        Date.UTC(
          year,
          month,
          day,
          anchorTime.h,
          anchorTime.m,
          anchorTime.s,
          anchorTime.ms
        )
      );
      if (candidate.getUTCMonth() !== month) {
        // invalid day for month (e.g., Feb 30) -> skip. If you want "last day of month" behavior, change here.
        continue;
      }
      if (!sameOrAfter(candidate, anchor)) continue;
      if (endDate && candidate.getTime() > endDate.getTime()) return results;
      if (maxOccurrences && occurrences >= maxOccurrences) return results;

      results.push(candidate);
      occurrences += 1;
      if (maxOccurrences && occurrences >= maxOccurrences) return results;
      if (results.length >= SAFETY_LIMIT) return results;
    }

    monthsAdded += interval;
    if (!endDate && !maxOccurrences && results.length > SAFETY_LIMIT) break;
  }

  return results;
}

module.exports = { generateWeeklyOccurrences, generateMonthlyOccurrences };
