# NBN Atlas Licence Audit

**Date:** 2026-06-25
**Phase:** 02 — Species Dataset + Ethics Data Model
**Auditor:** Claude Code (gsd-executor)

## Background

Phase 3 of Scout will ingest species occurrence records from the NBN Atlas API to power the "what's near me" discovery feature. Before building against NBN Atlas data, this audit documents the licence landscape and commits to a usage decision that protects Scout against current and future legal risk.

Phase 2 is unaffected by this audit — the species reference data (common names, scientific names, TVKs) is sourced from the GBIF Backbone Taxonomy and Catalogue of Life, both published under CC0 (public domain). No occurrence records are used in Phase 2.

## Licence Types on NBN Atlas

| Licence | Meaning | Commercial Use |
|---------|---------|----------------|
| CC-BY | Attribution required | ✓ Yes |
| CC-BY-NC | Attribution + non-commercial only | ✗ No |
| CC-BY-NC-ND | Attribution + non-commercial + no derivatives | ✗ No |
| OGL v3 | Open Government Licence — attribution, commercial OK | ✓ Yes |
| CC0 | Public domain | ✓ Yes |

## Key Datasets Surveyed

| Dataset | Provider | Licence | Decision |
|---------|----------|---------|----------|
| BirdTrack | BTO | CC-BY-NC | Exclude from Phase 3 pipeline |
| BSBI Plant Records | Botanical Society of Britain & Ireland | CC-BY-NC | Exclude (plants not in scope anyway) |
| iNaturalist UK | iNaturalist/GBIF | CC-BY (research grade) | Include — CC-BY only |
| Bat Conservation Trust surveys | BCT | CC-BY-NC | Exclude |
| JNCC government datasets | JNCC / Natural England | OGL v3 | Include |
| OS OpenData | Ordnance Survey | OGL v3 | Include |
| Local Environmental Records Centres (LERCs) | Various | Varies — many CC-BY-NC | Exclude unless CC-BY confirmed |
| Countryside Survey | UKCEH | OGL v3 | Include |

## Phase 2 Scope

Phase 2 uses **zero NBN Atlas occurrence records**. The species seed data is hand-curated from public domain taxonomy sources:
- Common names: public domain / established scientific usage
- Scientific names: Catalogue of Life (CC0)
- TVK identifiers: NBN Backbone Taxonomy (CC0 — identifier scheme only, not occurrence data)

No licence concern exists for Phase 2.

## DECISION

Scout will use NBN Atlas occurrence data in Phase 3 under the following conditions:

1. **Licence filter:** All NBN Atlas API occurrence queries must include a filter for CC-BY and OGL datasets only. CC-BY-NC and CC-BY-NC-ND datasets are excluded at the API query level.

2. **Attribution:** All pages or API responses derived from NBN Atlas data must include: *"Species occurrence data © NBN Atlas contributors (nbnatlas.org)"*

3. **No raw record exposure:** Individual occurrence records (precise location, recorder name, date) are never exposed to Scout users. Only pre-aggregated, grid-square-resolution data is surfaced.

4. **Excluded datasets documented:** Before Phase 3 ships, a list of excluded CC-BY-NC dataset UIDs must be committed to `.planning/phases/03-occurrence-pipeline/NBN-EXCLUDED-DATASETS.md`.

5. **Future monetisation:** If Scout ever introduces monetisation (subscriptions, features behind paywall), this decision must be re-audited before launch. CC-BY-NC data exclusion should remain the default regardless.

## Rationale

Scout v1 is free and non-commercial. CC-BY-NC data would technically be usable under this model. However, the decision to exclude CC-BY-NC datasets now:
- Future-proofs against any monetisation path
- Reduces legal complexity and audit burden
- Maintains the same data pipeline regardless of business model
- Excludes relatively few high-value datasets (BTO BirdTrack is the main loss; iNaturalist CC-BY research-grade records provide strong coverage as a replacement)

The data quality difference between a CC-BY-only pipeline and a full CC-BY + CC-BY-NC pipeline is acceptable for Scout's v1 use case.
