import {ifddAspects} from '../Env';

/**
 * Which tab a show view opens.
 *
 * The path of a tab is the name of its context (`product`,
 * `breaker.grid.example.ifdd.de`) or a fixed name (`base`, `explore`). Links
 * from outside point at these paths, so they stay stable: never a position
 * (`/show/2`), which would differ between users who see different contexts.
 *
 * One rule decides the tab a view opens with: the aspect tab of the resource
 * (`organisations` -> `organisation`), else the first tab. The list, the
 * references and the redirect of the show view all use it.
 */

/** The aspect of a REST resource of this UI ("organisations" -> "organisation"), else null. */
export const aspectOfResource = (resource) =>
    ifddAspects.find(aspect => `${aspect}s` === resource) || null;

/** The path of a show view, opened in a tab if one is given. */
export const showPath = (resource, id, tab) =>
    `/${resource}/${encodeURIComponent(id)}/show${tab ? `/${tab}` : ''}`;

/** The tab a show view opens with: the aspect tab if the record has it, else the first tab. */
export const firstTab = (paths, aspect) => (paths.includes(aspect) ? aspect : paths[0]);
