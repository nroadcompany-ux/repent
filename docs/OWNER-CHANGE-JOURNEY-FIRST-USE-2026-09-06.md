# Journey First-use Owner Change — 2026-09-06

Status: CANDIDATE / CODED — Canonical sync pending Owner visual approval

## Owner requests implemented in this branch
- First onboarding profile step collects birth date.
- Birth date = first Journey timeline anchor.
- `profiles.created_at` = RETURN start anchor.
- Journey Home TODAY is reduced to three rows: 나의 말씀 / 기도 / 약속·실천.
- Bible reading moves below the Journey graph and is also reachable from the menu.
- Empty TODAY rows contain clearly marked UI-only examples.
- Empty Journey graph contains a clearly marked UI-only sample preview and real anchor labels.
- Journey Home app header remains sticky while scrolling.
- Search / Calendar / Menu remain in the sticky header.
- The reduced TODAY height moves the Journey graph upward so part of the graph is discoverable in the first mobile viewport.

## Non-data sample rule
Example records are presentation-only. They must not enter DB, Search, Calendar, counters, statistics, or AI memory.

## Validation gate before Canonical sync
- Typecheck + test + build PASS
- 360x800 / 390x844 / 412x915 first viewport graph peek
- sticky header scrolling without overlap/jump
- new onboarding birth-date save and resume
- existing user without birth date remains usable and can edit it in Settings
- actual data replaces corresponding examples
