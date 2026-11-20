// Reads the dates in src/content/deadlines/*.yaml.
//
// A date can be written three ways:
//   2027-03-13                 23:59 Anywhere on Earth (UTC-12)
//   2027-03-13 17:00 PT        a time and a zone; daylight saving is handled
//   2027-03-13 5:00 pm UTC+2   12-hour times and UTC offsets also work
// A time with no zone is read as AoE, the usual zone for paper deadlines.

export interface Due {
  /** The moment the deadline passes, in UTC milliseconds. */
  at: number;
  /** "Sat" */
  weekday: string;
  /** "Mar 13, 2027", in the deadline's own zone. */
  day: string;
  /** "23:59 AoE" */
  time: string;
}

// Zone names that calls for papers use. Numbers are fixed offsets in minutes
// east of UTC. Strings are IANA zones, so daylight saving applies; "EST" in a
// July call almost always means Eastern time, so it maps to New York too.
const ZONES: Record<string, number | string> = {
  AOE: -720,
  UTC: 0,
  GMT: 0,
  Z: 0,
  ET: 'America/New_York',
  EST: 'America/New_York',
  EDT: 'America/New_York',
  CT: 'America/Chicago',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  MT: 'America/Denver',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  PT: 'America/Los_Angeles',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  BST: 'Europe/London',
  CET: 'Europe/Paris',
  CEST: 'Europe/Paris',
};

// CORE conference ranks (portal.core.edu.au/conf-ranks), best first. The
// deadlines page shows its rank filter buttons in this order.
export const CORE_RANKS = ['A*', 'A', 'B', 'C', 'Australasian', 'National', 'Unranked'];

const HINT = 'Write it as 2027-03-13, or with a time and zone as 2027-03-13 17:00 PT.';

// date, then optionally: time, am/pm, zone
const PATTERN =
  /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T]+(\d{1,2}):(\d{2})(?:\s*([ap])\.?m\.?)?(?:\s+(.+))?)?$/i;

const WEEKDAY = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' });
const DAY = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Turn one YAML date into a Due. Throws an Error whose message says what to
 * fix; the content schema shows that message when the build fails.
 */
export function parseDue(value: string | Date): Due {
  const text = value instanceof Date ? fromYamlDate(value) : String(value).trim();
  const match = PATTERN.exec(text);
  if (!match) throw new Error(`can't read "${text}". ${HINT}`);

  const [, y, mo, d, h, mi, ampm, zoneWritten] = match;
  const year = Number(y);
  const month = Number(mo);
  const date = Number(d);

  const midnight = new Date(Date.UTC(year, month - 1, date));
  if (midnight.getUTCMonth() !== month - 1 || midnight.getUTCDate() !== date) {
    throw new Error(`"${text}" is not a real date. ${HINT}`);
  }

  let hour = h === undefined ? 23 : Number(h);
  const minute = mi === undefined ? 59 : Number(mi);
  if (ampm) {
    if (hour < 1 || hour > 12) throw new Error(`"${text}" has an impossible time. ${HINT}`);
    hour = (hour % 12) + (ampm.toLowerCase() === 'p' ? 12 : 0);
  }
  if (hour > 23 || minute > 59) throw new Error(`"${text}" has an impossible time. ${HINT}`);

  const zoneText = zoneWritten?.trim() || 'AoE';
  const zone = readZone(zoneText);
  if (zone === null) {
    throw new Error(
      `unknown time zone "${zoneText}" in "${text}". Use AoE, UTC, ET, CT, MT, PT, ` +
        'an offset such as UTC+8, or a zone name such as Europe/Berlin.',
    );
  }

  const wall = Date.UTC(year, month - 1, date, hour, minute);
  const at = typeof zone === 'number' ? wall - zone * 60_000 : zonedToUtc(wall, zone);

  return {
    at,
    weekday: WEEKDAY.format(midnight),
    day: DAY.format(midnight),
    time: `${pad(hour)}:${pad(minute)} ${zoneLabel(zoneText)}`,
  };
}

// YAML reads an unquoted 2027-03-13 as a Date at UTC midnight. Turn it back
// into text so it goes through the same rules as everything else.
function fromYamlDate(value: Date): string {
  if (Number.isNaN(value.getTime())) return String(value);
  const date = `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  const hour = value.getUTCHours();
  const minute = value.getUTCMinutes();
  return hour === 0 && minute === 0 ? date : `${date} ${pad(hour)}:${pad(minute)} UTC`;
}

function readZone(text: string): number | string | null {
  const named = ZONES[text.toUpperCase()];
  if (named !== undefined) return named;

  const offset = /^(?:UTC|GMT)?\s*([+\-−])\s*(\d{1,2})(?::?(\d{2}))?$/i.exec(text);
  if (offset) {
    const minutes = Number(offset[2]) * 60 + Number(offset[3] ?? 0);
    if (minutes > 14 * 60) return null;
    return offset[1] === '+' ? minutes : -minutes;
  }

  if (text.includes('/')) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: text });
      return text;
    } catch {
      return null;
    }
  }
  return null;
}

function zoneLabel(text: string): string {
  if (text.toUpperCase() === 'AOE') return 'AoE';
  if (ZONES[text.toUpperCase()] !== undefined) return text.toUpperCase();
  return text;
}

// Minutes east of UTC that `timeZone` is at the instant `at`.
function offsetAt(timeZone: string, at: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return Math.round((wall - at) / 60_000);
}

// Wall-clock time in an IANA zone to UTC. The first pass uses the offset near
// the wall time; the second corrects for a daylight-saving change in between.
function zonedToUtc(wall: number, timeZone: string): number {
  const guess = wall - offsetAt(timeZone, wall) * 60_000;
  return wall - offsetAt(timeZone, guess) * 60_000;
}

/** "23 days", "1 day 5 hr", "4 hr 12 min", "9 min". Used by the countdowns. */
export function formatLeft(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days >= 2) return `${days} days`;
  if (days === 1) return hours ? `1 day ${hours} hr` : '1 day';
  if (hours >= 1) return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
  return minutes >= 1 ? `${minutes} min` : 'under a minute';
}
