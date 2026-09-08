# RETURN Platform Status

Owner Decision 2026-09-08 — **PLATFORM TRANSITION GOVERNANCE**. RETURN은 Flutter Mobile로 완전 전환한다.

## 1. Platform Status

| Platform | Status |
|---|---|
| RETURN Flutter (`nroadcompany-ux/return-mobile`) | **CURRENT CANONICAL CLIENT** |
| Existing Next.js (`nroadcompany-ux/repent`, 이 repo) | **LEGACY REFERENCE** |
| Supabase | **CURRENT SHARED BACKEND** |
| Future PC Web | **FUTURE PLATFORM** |

## 2. Legacy Rule (이 repo)

기존 Next.js는 **삭제하지 않는다.** 보존 목적:

- Historical Implementation Reference
- Backend Logic Reference
- Feature Parity Check
- Future PC Web Reference
- Rollback / Recovery Reference

단:

- Next.js를 **Current Product Source로 취급하지 않는다.**
- Flutter 이후 신규 Product Change를 **자동으로 Next.js에 동기화하지 않는다.**

## 3. Product Source Priority (충돌 시)

1. Owner Latest Decision
2. Flutter Current Canonical
3. Shared Product / Backend Canonical
4. Figma Current
5. Next.js Legacy Reference

**Legacy code가 최신 Product Decision을 덮어쓰면 안 된다.**

## 4. Shared Canonical (Flutter / PC / Web 공통 Source)

- Product Definition (`docs/00`)
- Theology / Product Guardrail (`docs/04`, `docs/06`)
- Product Lock (`src/domain/product-lock.ts` — 값의 출처. Flutter는 이를 미러하고 출처를 명시)
- Owner Decisions (`docs/10`)
- Backend Schema (`supabase/migrations/`)
- RLS (`supabase/migrations/`)
- Data Dictionary (`docs/05`)
- Core Domain Meaning

이 항목들은 이 repo에 **계속 기록**되며, 여기서는 Legacy가 아니라 Shared Canonical이다.

## 5. Future PC Rule

Future PC Web는 기존 Next.js를 그대로 부활시키지 않는다. 그 시점의 Flutter Current Product를 기준으로 PC UX에 맞게 새로 설계한다. Existing Next.js는 Reference만 사용한다.

## 6. 이 repo에서 계속 유효한 것

- 보안 불변식: SERVICE_ROLE_KEY · AI API KEY · Naver Secret 클라이언트 노출 금지, `.env` 커밋 금지, RLS 없이 Production GO 금지, 회개/기도 원문의 로그·Analytics 기록 금지
- Production Supabase 변경은 Owner 지시로만
- `main` merge · Production deploy는 Owner 지시로만
