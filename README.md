# REPENT

개인의 기도·약속·실행·회개·고백을 기록하는 여정 앱.

상태: **Implementation Sprint 1 — Foundation + Core Domain**
Working Branch: `claude/new-session-gwiqkv` (main merge 금지)

## 구조

```
app/        Next.js App Router — 화면과 Server Action
src/
  domain/       Entity / Product Lock / Actor·Permission / Lifecycle
  usecase/      Journey · Prayer · Promise · Action · Repentance · Confession · Sharing
  repository/   Repository Port 인터페이스
  adapters/     In-memory Mock 구현 (외부 Provider 미바인딩 = HOLD)
  app-runtime/  Composition Root — 인증·영속성 교체 지점
  ui/           Navigation, 공용 Empty/Error/Loading
docs/       Living Documents (docs/final/01~10 = Final Documentation)
tests/      product-lock 회귀 스캔 + 기존 AI/VGL 스위트(g07, vgl)
prototype/  LEGACY / NON-CANONICAL — 구현 근거로 사용 금지
```

의존 방향은 `Domain → Use Case → Repository Interface → Adapter → UI` 단방향이다.
Domain은 외부 계층을 import하지 않는다.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run typecheck  # tsc --noEmit
npm test           # Vitest (도메인·유스케이스·Product Lock 회귀)
npm run test:g07   # 기존 AI/VGL wording 스위트
```

## 개발 규칙

1. Product Meaning의 근거는 `docs/final/01~10`과 `docs/REPENT-MASTER-HANDOFF.md`다.
   Figma와 legacy prototype에서 역설계하지 않는다.
2. Product Lock은 `src/domain/shared/product-lock.ts`에 코드로 고정돼 있고,
   `tests/product-lock/`가 `src/`·`app/` 전체를 스캔해 재유입을 차단한다.
3. Exact Lifecycle Enum Naming은 CANDIDATE다. `src/domain/shared/lifecycle.ts`의
   내부 상태를 Canonical Product Meaning으로 승격하지 않는다.
4. CANDIDATE / OPEN / HOLD 항목은 임의 구현하지 않는다.
