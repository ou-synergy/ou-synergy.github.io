import { getCollection, type CollectionEntry } from 'astro:content';

type Person = CollectionEntry<'people'>;
type Paper = CollectionEntry<'papers'>;
type Area = CollectionEntry<'areas'>;

const byYearDesc = (a: Paper, b: Paper) => b.data.year - a.data.year;

/** All papers, newest first. */
export async function allPapers(): Promise<Paper[]> {
  const papers = await getCollection('papers');
  return papers.sort(byYearDesc);
}

/** Papers authored by a given person slug, newest first. */
export async function papersByPerson(personSlug: string): Promise<Paper[]> {
  const papers = await getCollection('papers');
  return papers.filter((p) => p.data.authors.includes(personSlug)).sort(byYearDesc);
}

/** Papers tagged with a given area slug, newest first. */
export async function papersByArea(areaSlug: string): Promise<Paper[]> {
  const papers = await getCollection('papers');
  return papers.filter((p) => p.data.areas.includes(areaSlug)).sort(byYearDesc);
}

/** Areas sorted by `order`. */
export async function orderedAreas(): Promise<Area[]> {
  const areas = await getCollection('areas');
  return areas.sort((a, b) => a.data.order - b.data.order);
}

/** For each area (ordered), the single most recent paper, or null. */
export async function latestPaperPerArea(): Promise<{ area: Area; latest: Paper | null }[]> {
  const areas = await orderedAreas();
  const papers = await getCollection('papers');
  return areas.map((area) => ({
    area,
    latest:
      papers
        .filter((p) => p.data.areas.includes(area.slug))
        .sort(byYearDesc)[0] || null,
  }));
}

/** Map of person slug -> person entry, for resolving author slugs to names. */
export async function getPersonMap(): Promise<Record<string, Person>> {
  const people = await getCollection('people');
  return Object.fromEntries(people.map((p) => [p.slug, p]));
}

/** The principal investigator, or the first person by order if none flagged. */
export async function getPI(): Promise<Person | undefined> {
  const people = await getCollection('people');
  const pi = people.find((p) => p.data.is_pi);
  if (pi) return pi;
  return people.sort((a, b) => a.data.order - b.data.order)[0];
}

/** Current (non-alumni) group members, PI excluded, sorted by order. */
export async function getGroup(): Promise<Person[]> {
  const people = await getCollection('people');
  return people
    .filter((p) => !p.data.is_pi && !p.data.is_alumni)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Alumni, most recent year first. */
export async function getAlumni(): Promise<Person[]> {
  const people = await getCollection('people');
  return people
    .filter((p) => p.data.is_alumni)
    .sort((a, b) => (b.data.alumni_end ?? '').localeCompare(a.data.alumni_end ?? ''));
}

/** Distinct publication years across all papers, newest first. */
export async function publicationYears(): Promise<number[]> {
  const papers = await getCollection('papers');
  return [...new Set(papers.map((p) => p.data.year))].sort((a, b) => b - a);
}
