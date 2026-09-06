import { defineCollection, z } from 'astro:content';

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

export const collections = { people, papers, areas, pages };
