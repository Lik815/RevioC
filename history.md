# Revio — Cleanup History

Datum: 04.04.2026

## Gelöschte Duplikate (macOS " 2"-Kopien)

Identische Kopien, die durch macOS-Dateiduplikation entstanden sind:

| Gelöschte Datei | Original (behalten) |
|-----------------|---------------------|
| `nixpacks 2.toml` | `nixpacks.toml` |
| `apps/mobile/.env 2.example` | `apps/mobile/.env.example` |
| `apps/mobile/src/mobile-therapist-screens 2.js` | `apps/mobile/src/mobile-therapist-screens.js` |
| `apps/mobile/src/mobile-translations 2.js` | `apps/mobile/src/mobile-translations.js` |
| `apps/admin/lib/api-base 2.ts` | `apps/admin/lib/api-base.ts` |
| `apps/admin/app/error 2.tsx` | `apps/admin/app/error.tsx` |
| `apps/api/prisma/add-koeln-freelancers 2.ts` | `apps/api/prisma/add-koeln-freelancers.ts` |
| `apps/api/prisma/generate_practice_logo 2.py` | `apps/api/prisma/generate_practice_logo.py` |
| `apps/api/prisma/schema.production 2.prisma` | `apps/api/prisma/schema.production.prisma` |
| `docs/freelancer-first-appointment-mvp 2.md` | `docs/freelancer-first-appointment-mvp.md` |
| `docs/plattform-architektur-reverse-engineering 2.md` | `docs/plattform-architektur-reverse-engineering.md` |

## Gelöschte Build-Artefakte / Cache-Ordner

| Gelöschter Pfad | Grund |
|-----------------|-------|
| `apps/admin/.next_stale_20260319_180317/` | Alter Next.js Build-Cache (46+ Dateien, ~3 Wochen alt) |
| `apps/admin/.next_stale_20260320_221633/` | Alter Next.js Build-Cache |
| `apps/admin/.next_stale_20260326_0507_chunk_mismatch/` | Alter Next.js Build-Cache (chunk mismatch debug) |
| `apps/mobile/dist/` | Expo Web Build-Output — wird bei jedem Build regeneriert |
| `apps/api/dist/` | API Build-Output — wird bei jedem Build regeneriert |

## Gelöschte leere Ordner

| Gelöschter Pfad | Grund |
|-----------------|-------|
| `uploads/` (Root-Level) | Leerer Ordner — Uploads gehen nach `apps/api/uploads/` |
| `apps/uploads/` | Leerer Ordner — nie genutzt |
| `apps/admin/app/api/documents 2/` | Leerer Duplikat-Ordner |
| `apps/admin/app/(auth)/login/` | Leerer Ordner — aktive Login-Page ist `app/login/page.tsx` |
| `scripts/ralph/` | Leerer Ordner |

## Gelöschte veraltete Dokumentation

| Gelöschte Datei | Inhalt / Grund |
|-----------------|----------------|
| `claude-todo.md` | Bug-Liste vom 11.03.2026 — alle Tasks abgearbeitet (✅ in `todo.md`). Enthielt: API-URL konfigurierbar, Suchlogik, Seed-Daten, Fake-E-Mail entfernen, Praxis-Registrierung. |
| `debug.md` | Debug-Notizen vom 11.03.2026 — Live-Test-Protokoll von Admin/API. Gefundene Bugs alle gefixt. Enthielt: Endpoint-Tests, UI-Inkonsistenzen, Seed-Daten-Probleme. |
| `codex-ui-prompt.md` | Einmaliger UI-Refactor-Prompt für Codex (529 Zeilen). Design-Token-System, Theme-Updates, Component-Refactoring. Wurde umgesetzt. |
| `uiticket.md` | UI-Verbesserungsnotizen (260 Zeilen). Informationshierarchie, Header-Verdichtung, Status-Kommunikation. Wurde teilweise umgesetzt. |
| `registrationrefactor.md` | Registrierungs-Refactor-Plan (614 Zeilen). Onboarding 5→4 Schritte, E-Mail-Verifikation mit Deep Linking. Wurde umgesetzt. |

## Gelöschte nicht mehr genutzte Dateien

| Gelöschte Datei | Inhalt / Grund |
|-----------------|----------------|
| `apps/admin/lib/mock-data.ts` | Mock-Daten (51 Zeilen) — wird nirgends importiert. Admin nutzt echte API-Daten. Enthielt: summaryCards, therapistRows mit Dummy-Daten (Julia Neumann etc.). |

## Behalten

Folgende Dateien wurden bewusst NICHT gelöscht:

- `todo.md` — Aktive Roadmap
- `START.md` — Schnellstart-Anleitung
- `CLAUDE.md` — AI-Context
- `structure.md` — Architektur-Doku (sollte aktualisiert werden)
- `docs/data-model.md`, `docs/design-system.md`, `docs/email-setup.md` etc. — Aktive Doku
- `apps/api/prisma/seed.ts` — Aktives Seed-Script
- `apps/api/prisma/schema.production.prisma` — Prod-Schema
- `apps/api/prisma/add-koeln-*.ts`, `backfill-*.ts` — Einmal-Scripts (empfohlen: in `scripts/` verschieben)
