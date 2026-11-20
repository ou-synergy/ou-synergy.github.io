import { defineCollection, z } from 'astro:content';
import { CORE_RANKS, parseDue, type Due } from '../utils/deadlines';

const people = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(), // "PhD Candidate"
    role_short: z.string().optional(), // "PhD" — for homepage strip
    advisor: z.string().optional(),
    joined: z.string().optional(), // "2023" or "Fall 2023"
    bio: z.string(),
    avatar: z.string().optional(), // path to image in /public, e.g. "/people/chen.jpg"
    initials: z.string(), // "MC" — used when no avatar
    email: z.string().optional(),
    github: z.string().optional(),
    scholar: z.string().optional(),
    cv: z.string().optional(),
    is_pi: z.boolean().default(false),
    is_alumni: z.boolean().default(false),
    alumni_start: z.string().optional(),
    alumni_end: z.string().optional(),
    alumni_destination: z.string().optional(), // "Google"
    order: z.number().default(100),
  }),
});

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()), // ["chen", "park", "okafor"] — person slugs
    venue: z.string(), // "ICSE 2024" — acronym + year
    venue_full: z.string().optional(), // "International Conference on Software Engineering"
    year: z.number(),
    areas: z.array(z.string()), // ["consensus-coordination"] — area slugs
    pdf_url: z.string().optional(),
    doi_url: z.string().optional(), // full https://doi.org/... link
    code_url: z.string().optional(),
    bibtex_url: z.string().optional(),
    is_workshop: z.boolean().default(false),
    is_featured: z.boolean().default(false),
  }),
});

const areas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(), // "Consensus & coordination"
    short_title: z.string().optional(), // for filter pills
    description: z.string(), // 1-line for homepage
    full_description: z.string(), // 2-3 sentences for research page
    order: z.number(), // 1-6, controls "01" through "06"
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

// Conference deadlines for /deadlines. Each YAML file in src/content/deadlines/
// is a list of conferences; the field guide is at the top of conferences.yaml.
// Dates are checked here, so a typo fails the build with a message naming the
// conference instead of showing a wrong countdown.
const dateField = z.union([z.date(), z.string()]);

const DEADLINE_FIELDS = [
  'name',
  'full',
  'tags',
  'core',
  'abstract',
  'deadline',
  'last_year',
  'where',
  'when',
  'link',
  'note',
];

const deadline = z
  .object({
    name: z.string(),
    full: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    core: z.string().optional(),
    abstract: dateField.optional(),
    deadline: dateField.optional(),
    last_year: dateField.optional(),
    where: z.string().optional(),
    when: z.string().optional(),
    link: z.string().optional(),
    note: z.string().optional(),
  })
  // Unknown keys are let through here and rejected below, so that a typo such
  // as "dealine:" fails with the conference's name instead of being ignored.
  .passthrough()
  .transform((entry, ctx) => {
    let ok = true;
    const fail = (field: string, message: string) => {
      ok = false;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${entry.name}: ${message}`,
      });
    };

    for (const key of Object.keys(entry)) {
      if (!DEADLINE_FIELDS.includes(key)) {
        fail(key, `unknown field "${key}". The fields are ${DEADLINE_FIELDS.join(', ')}.`);
      }
    }

    // `deadline: rolling` marks a venue that takes papers at any time.
    const rolling =
      typeof entry.deadline === 'string' && entry.deadline.trim().toLowerCase() === 'rolling';

    const read = (field: 'abstract' | 'deadline' | 'last_year'): Due | undefined => {
      const value = entry[field];
      if (value === undefined || (field === 'deadline' && rolling)) return undefined;
      try {
        return parseDue(value);
      } catch (error) {
        fail(field, `${field} ${(error as Error).message}`);
        return undefined;
      }
    };

    // Accept any capitalization ("a*", "unranked") and store the portal's spelling.
    const core =
      entry.core === undefined
        ? undefined
        : CORE_RANKS.find((rank) => rank.toLowerCase() === entry.core?.trim().toLowerCase());
    if (entry.core !== undefined && core === undefined) {
      fail('core', `core rank "${entry.core}" is not one of ${CORE_RANKS.join(', ')}.`);
    }

    if (entry.link !== undefined && !/^https?:\/\/\S+$/.test(entry.link)) {
      fail('link', `link "${entry.link}" should be a full address starting with https://`);
    }

    const parsed = {
      name: entry.name,
      full: entry.full,
      tags: typeof entry.tags === 'string' ? [entry.tags] : entry.tags ?? [],
      core,
      abstract: read('abstract'),
      deadline: read('deadline'),
      rolling,
      last_year: read('last_year'),
      where: entry.where,
      when: entry.when,
      link: entry.link,
      note: entry.note,
    };
    return ok ? parsed : z.NEVER;
  });

const deadlines = defineCollection({
  type: 'data',
  schema: z.array(deadline),
});

export const collections = { people, papers, areas, pages, deadlines };
