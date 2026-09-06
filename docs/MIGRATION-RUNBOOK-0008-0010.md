# RETURN Migration Runbook — 0008 → 0009 → 0010

- 작성일: 2026-09-07
- 대상 Branch: `integration/owner-ux-20260907`
- 대상 DB: RETURN Production (Supabase)
- 현재 DB 상태: **0007_confession_comments_mvp 까지 적용됨**
- 목표 상태: 0010 까지 적용
- 상태: **미적용 / Owner 승인 대기**

> 이 문서는 절차서입니다. 이번 작업에서 Production 적용은 수행하지 않았습니다.
> 실제 적용은 Owner 승인 후 별도로 진행합니다.

---

## 0. 이 세 개의 마이그레이션이 하는 일

| # | 파일 | 변경 | 되돌릴 수 있나 |
|---|---|---|---|
| 0008 | `0008_journey_birth_date.sql` | `profiles.birth_date` 컬럼 추가 + 미래 날짜 금지 CHECK | 가능 (단, 적용 후 입력된 생년월일은 소실) |
| 0009 | `0009_promise_recurrence.sql` | `promises.repeat_type`, `promises.repeat_weekdays` 추가 + CHECK 2종 | 가능 (단, 적용 후 설정된 반복 설정은 소실) |
| 0010 | `0010_confession_like_dislike.sql` | `reaction_type` enum 에 `like`, `dislike` 값 추가 | **불가능 — 아래 §3.4 참조** |

세 개 모두 **추가(additive)** 변경입니다. 기존 행을 읽거나, 고치거나, 지우지 않습니다.
`prayer_*`, `repentances`, `actions`, `promise_checks`, `confession_posts`,
`confession_reactions`, `confession_comments` 는 한 줄도 건드리지 않습니다.
이 성질 자체를 회귀 테스트로 고정해 두었습니다 → `tests/legacy-compat.test.ts`
의 `migration blast radius (0008–0010)`.

### 배포 순서 (기술 권고)

**DB 먼저, 코드 나중.**

세 변경이 전부 additive이므로 현재 Production에 떠 있는 (0007 기준) 코드는 새 컬럼과
새 enum 값의 존재를 몰라도 그대로 동작합니다. 반대로 코드를 먼저 올리면:

- `src/data/journey.ts` 의 `select('birth_date, created_at')` 가 `42703` 으로 실패 →
  `anchors` 가 null 이 되어 Journey 생일 앵커가 조용히 비어 보임
- `promises` 는 `select('*')` 라 조회는 되지만 `repeat_type` 이 없어 모든 약속이 1회성으로 표시됨
- `app/(app)/confession/vote-actions.ts` 의 upsert 가 잘못된 enum 값으로 실패하는데
  **에러를 확인하지 않고 redirect** 하므로, 👍/👎 를 눌러도 아무 일도 일어나지 않음 (무음 실패)

즉 코드 선행은 "깨진 화면"이 아니라 "조용히 동작하지 않는 화면"을 만듭니다. 그래서 DB 선행입니다.

---

## 1. 적용 전 체크리스트 (Pre-flight)

### 1.1 승인 · 준비

- [ ] Owner/PM 의 Production 적용 승인 (문서 또는 Issue 코멘트로 기록)
- [ ] 적용 담당자 1인 지정. 동시에 다른 세션이 같은 DB에 DDL 을 걸지 않음을 확인
- [ ] Supabase 백업 / PITR 이 활성화되어 있고 최근 복원 지점이 존재함을 확인 (Owner 확인 항목)
- [ ] Vercel Instant Rollback 으로 되돌릴 직전 배포가 무엇인지 확인해 둠
- [ ] 적용 창(window): 아래 §1.3 기준 락 시간은 ms 단위지만, 무중단을 가정하지 말고 저트래픽 시간대 권장

### 1.2 Baseline 스냅샷 (적용 직전 실행 · 결과 보관)

```sql
-- A. 마이그레이션 이력 (마지막이 0007 이어야 함)
select version, name from supabase_migrations.schema_migrations order by version;

-- B. 이번 변경이 닿는 대상이 아직 없음을 확인
select
  to_regclass('public.profiles')  is not null as profiles_exists,
  to_regclass('public.promises')  is not null as promises_exists,
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='profiles' and column_name='birth_date') as birth_date_present,
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='promises'
       and column_name in ('repeat_type','repeat_weekdays')) as repeat_cols_present,
  (select count(*) from pg_enum e join pg_type t on t.oid=e.enumtypid
     where t.typname='reaction_type' and e.enumlabel in ('like','dislike')) as new_enum_present,
  (select count(*) from pg_constraint
     where conname in ('profiles_birth_date_not_future',
                       'promises_repeat_type_check',
                       'promises_repeat_weekdays_check')) as new_constraints_present;

-- C. 영향 규모 (행 수만. 본문은 조회하지 않는다)
select
  (select count(*) from public.profiles)             as profiles_rows,
  (select count(*) from public.promises)             as promises_rows,
  (select count(*) from public.confession_reactions) as reaction_rows;

-- D. 남아 있는 legacy reaction 분포 (0010 이후 무시될 행 수)
select type::text as reaction_type, count(*) as rows
from public.confession_reactions group by 1 order by 1;
```

**2026-09-07 기준 실측 baseline** (참고값 — 적용 직전에 다시 측정할 것):

| 항목 | 값 |
|---|---|
| `schema_migrations` 마지막 | `0007_confession_comments_mvp` |
| `birth_date_present` / `repeat_cols_present` / `new_enum_present` / `new_constraints_present` | 0 / 0 / 0 / 0 |
| `profiles_rows` / `promises_rows` / `reaction_rows` | 2 / 2 / 1 |
| legacy reaction 분포 | `pray_together` 1건 |
| PostgreSQL | 17.6 |

### 1.3 락(lock) 영향 예측

| 마이그레이션 | 락 | 테이블 재작성 | 예상 시간 |
|---|---|---|---|
| 0008 컬럼 추가 | ACCESS EXCLUSIVE | 없음 (nullable, default 없음) | 즉시 |
| 0008 CHECK 추가 | ACCESS EXCLUSIVE | 없음. 전 행 검증 (전부 NULL 이라 통과) | 즉시 |
| 0009 컬럼 추가 | ACCESS EXCLUSIVE | 없음 (PG 11+ 상수 default 는 fast path) | 즉시 |
| 0009 CHECK 추가 | ACCESS EXCLUSIVE | 없음. 전 행 검증 (default 값이 제약을 만족) | 즉시 |
| 0010 enum 값 추가 | 타입 레벨 락 | 없음 | 즉시 |

현재 행 수(2 / 2 / 1)에서는 모두 밀리초 단위입니다. 행이 늘어난 뒤에 적용하더라도
세 변경 모두 테이블 재작성이 없으므로 시간은 행 수에 비례하지 않습니다.

### 1.4 재실행 안전성 (같은 파일을 두 번 돌렸을 때)

| 구문 | 재실행 | 비고 |
|---|---|---|
| `add column if not exists` | **안전** | |
| `alter type ... add value if not exists` | **안전** | |
| `add constraint ...` | **실패 (42710 duplicate_object)** | PostgreSQL 에는 `add constraint if not exists` 가 없음 |

→ 0008 / 0009 는 **부분 실패 후 그대로 재실행하면 안 됩니다.** 반드시 §3 의 판단 기준을
따르십시오. 재실행이 필요하면 이미 생성된 constraint 를 먼저 drop 하거나, 실패한
statement 부터 수동으로 이어서 실행합니다.

### 1.5 사전 확인

- [ ] Supabase Advisors 에 `ERROR` 0건 (적용 전후 비교용으로 캡처)
- [ ] `npm run typecheck` / `npm test` / `npm run build` PASS (CI run URL 기록)
- [ ] `src/lib/supabase/database.types.ts` 가 0001–0010 과 정합함 (§5.2 표)

---

## 2. 적용 순서와 단계별 검증

> 반드시 **0008 → 0009 → 0010 순서**로, **한 번에 하나씩** 적용하고,
> 각 단계의 검증을 통과한 뒤에 다음으로 넘어갑니다.

### 2.1 — 0008_journey_birth_date.sql

**적용 후 검증 SQL**

```sql
-- 1) 컬럼이 nullable date 로 생겼는가
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='profiles' and column_name='birth_date';
-- 기대: birth_date | date | YES | (null)

-- 2) CHECK 제약이 생겼고 validated 상태인가
select conname, pg_get_constraintdef(oid) as def, convalidated
from pg_constraint where conname = 'profiles_birth_date_not_future';
-- 기대: check (((birth_date IS NULL) OR (birth_date <= CURRENT_DATE))) | true

-- 3) 기존 행이 하나도 깨지지 않았는가 (전부 NULL 이어야 정상)
select count(*) as total, count(birth_date) as with_birth_date from public.profiles;
-- 기대: total 은 baseline 과 동일, with_birth_date = 0

-- 4) 제약이 실제로 동작하는가 (롤백되므로 데이터는 남지 않음)
begin;
  update public.profiles set birth_date = current_date + 1
  where id = (select id from public.profiles limit 1);
rollback;
-- 기대: update 가 23514 check_violation 으로 실패한다. 성공하면 제약이 잘못된 것.
```

**확인 항목**

- [ ] 위 1)~4) 전부 기대와 일치
- [ ] `profiles` 행 수가 baseline 과 동일 (증감 없음)
- [ ] Advisors 에 새 `ERROR` 없음
- [ ] PostgREST 스키마 캐시 반영 확인 — 앱에서 `42703 column profiles.birth_date does not exist`
      가 계속 나오면 `notify pgrst, 'reload schema';` 실행

**다음 단계 진행 조건**: 위 전부 체크됨.

---

### 2.2 — 0009_promise_recurrence.sql

**적용 후 검증 SQL**

```sql
-- 1) 두 컬럼이 not null + 올바른 default 로 생겼는가
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='promises'
  and column_name in ('repeat_type','repeat_weekdays')
order by column_name;
-- 기대: repeat_type    | text     | NO | 'none'::text
--       repeat_weekdays| ARRAY    | NO | '{}'::smallint[]

-- 2) CHECK 2종
select conname, pg_get_constraintdef(oid) as def, convalidated
from pg_constraint
where conname in ('promises_repeat_type_check','promises_repeat_weekdays_check')
order by conname;
-- 기대: 둘 다 존재, convalidated = true

-- 3) 기존 약속이 전부 1회성(none)으로 채워졌는가 = 이전과 동일 동작
select repeat_type, count(*) as rows,
       count(*) filter (where repeat_weekdays = '{}') as empty_weekdays
from public.promises group by 1 order by 1;
-- 기대: none 이 baseline promises_rows 와 같은 수, empty_weekdays 도 같은 수

-- 4) 제약이 실제로 동작하는가 (둘 다 롤백)
begin;
  update public.promises set repeat_type = 'hourly'
  where id = (select id from public.promises limit 1);
rollback;
-- 기대: 23514 check_violation

begin;
  update public.promises set repeat_weekdays = '{9}'
  where id = (select id from public.promises limit 1);
rollback;
-- 기대: 23514 check_violation
```

**확인 항목**

- [ ] 위 1)~4) 전부 기대와 일치
- [ ] `promises` 행 수가 baseline 과 동일
- [ ] 기존 약속의 `repeat_type` 이 **전부 `none`** — 하나라도 다른 값이면 중단(§3.1)
- [ ] Advisors 에 새 `ERROR` 없음

**다음 단계 진행 조건**: 위 전부 체크됨.

---

### 2.3 — 0010_confession_like_dislike.sql

> ⚠️ **이 단계는 되돌릴 수 없습니다.** 실행 전에 §3.4 를 읽고, 0008/0009 가
> 모두 정상임을 확인한 뒤에 진행하십시오.

**적용 후 검증 SQL**

```sql
-- 1) enum 에 두 값이 추가되었고, 기존 3종이 그대로 남아 있는가
select string_agg(e.enumlabel, ', ' order by e.enumsortorder) as values
from pg_enum e join pg_type t on t.oid = e.enumtypid
where t.typname = 'reaction_type';
-- 기대: pray_together, received_grace, touched, like, dislike
--       (기존 3종이 하나라도 사라졌으면 즉시 중단)

-- 2) 기존 reaction 행이 그대로인가 (baseline D 와 동일해야 함)
select type::text as reaction_type, count(*) as rows
from public.confession_reactions group by 1 order by 1;
-- 기대: baseline 과 완전히 동일. 2026-09-07 기준 pray_together 1건.

-- 3) 새 값이 실제로 쓰이는가 (롤백되므로 데이터는 남지 않음)
begin;
  insert into public.confession_reactions (post_id, user_id, type)
  select p.id, p.user_id, 'like'::public.reaction_type
  from public.confession_posts p limit 1
  on conflict (post_id, user_id) do update set type = excluded.type;
rollback;
-- 기대: 에러 없이 성공. 22P02 invalid_text_representation 이면 enum 추가 실패.

-- 4) 1인 1행 제약이 그대로인가
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'public.confession_reactions'::regclass and contype = 'p';
-- 기대: primary key (post_id, user_id)
```

**확인 항목**

- [ ] 위 1)~4) 전부 기대와 일치
- [ ] **기존 legacy 행이 한 건도 변경/삭제되지 않음** (baseline D 와 완전 일치)
- [ ] Advisors 에 새 `ERROR` 없음
- [ ] `notify pgrst, 'reload schema';` 로 스키마 캐시 반영

---

### 2.4 — 전체 적용 후 최종 확인

```sql
-- 마이그레이션 이력 3건이 순서대로 추가되었는가
select version, name from supabase_migrations.schema_migrations
order by version desc limit 5;
-- 기대: ... 0008 → 0009 → 0010 순으로 존재
```

**앱 레벨 스모크 (Preview 또는 배포 직후 Production)**

| # | 경로 | 확인 |
|---|---|---|
| 1 | `/journey` | 진입 성공. 기록이 없으면 예시 그래프 + `태어난 날` / `RETURN을 시작한 날` 앵커가 보임 |
| 2 | `/settings` | 생년월일 저장 성공. 미래 날짜 입력 시 `error=birth` 로 차분한 에러 |
| 3 | `/journey` | 저장한 생년월일이 앵커에 표시됨 |
| 4 | `/promise/new` | 반복 `매주` 선택 시 요일 선택 노출. 요일 미선택 저장 → `error=weekday` |
| 5 | `/promise/new` | 시작일 > 종료일 저장 → `error=date` |
| 6 | `/promise/[id]` | 반복 라벨(`매주 월·수` 등)과 keep-rate 표시. 기존 1회성 약속은 `한 번` 유지 |
| 7 | `/confession` | 👍 / 👎 / 💬 카운트 표시. 👍 → 숫자 1 증가, 다시 👍 → 취소, 👎 → 상호 배타 전환 |
| 8 | `/confession/[id]` | 상세에서도 같은 세 숫자가 보이고 피드와 일치 |
| 9 | `/prayer`, `/prayer/folders` | 기존 기록 + 예시가 그대로 보임 (0008–0010 영향 없음을 눈으로 확인) |
| 10 | `/repentance/[id]` (legacy 4-field 기록) | `돌이킴 약속` 필드가 여전히 보임 |

- [ ] 1~10 전부 통과
- [ ] `npm test` 재실행 PASS (191/191 이상)

---

## 3. 실패 시 복구 / 중단 기준

### 3.1 즉시 중단 (ABORT) — 그 자리에서 멈추고 Owner 에게 보고

다음 중 하나라도 관측되면 **다음 마이그레이션을 실행하지 않습니다.**

| 신호 | 의미 |
|---|---|
| 검증 SQL 결과가 "기대"와 다름 | 적용이 의도대로 되지 않음 |
| 기존 행 수가 baseline 과 다름 | 데이터가 변경됨 — additive 가정 위반 |
| `reaction_type` 에서 기존 3종 중 하나라도 사라짐 | 과거 데이터 해석 불가 |
| `promises.repeat_type` 에 `none` 이 아닌 기존 행이 있음 | 기존 약속의 의미가 바뀜 |
| CHECK 제약이 `convalidated = false` | 제약이 기존 행을 검증하지 못함 |
| Advisors 에 새 `ERROR` | 보안/무결성 회귀 |
| 마이그레이션이 락 대기로 30초 이상 진행되지 않음 | 다른 트랜잭션과 충돌 — 취소하고 재시도 |

중단 시 절차: ① 실행 중단 ② 현재 상태를 §1.2 스냅샷 SQL 로 기록 ③ 코드는 배포하지 않음
④ 필요하면 §3.2/§3.3 롤백 ⑤ Owner 보고.

### 3.2 0008 롤백

```sql
alter table public.profiles drop constraint if exists profiles_birth_date_not_future;
alter table public.profiles drop column if exists birth_date;
```

- **데이터 손실 위험**: 적용 후 회원이 입력한 생년월일이 있으면 함께 사라집니다.
  적용 직후, 앱 트래픽이 붙기 전이라면 무손실입니다.
- 롤백 전 확인: `select count(birth_date) from public.profiles;` 가 0 이면 무손실.
  0 이 아니면 **롤백하지 말고 Owner 판단을 받으십시오** (회원 데이터 삭제는 Product Decision).

### 3.3 0009 롤백

```sql
alter table public.promises drop constraint if exists promises_repeat_type_check;
alter table public.promises drop constraint if exists promises_repeat_weekdays_check;
alter table public.promises drop column if exists repeat_type;
alter table public.promises drop column if exists repeat_weekdays;
```

- **데이터 손실 위험**: 적용 후 설정된 반복 약속 설정이 사라지고, 해당 약속은 1회성으로 되돌아갑니다.
- 롤백 전 확인: `select count(*) from public.promises where repeat_type <> 'none';` 가 0 이면 무손실.
  0 이 아니면 **롤백하지 말고 Owner 판단**.

### 3.4 0010 롤백 — **불가능**

PostgreSQL 에는 `ALTER TYPE ... DROP VALUE` 가 없습니다. 한 번 추가한 enum 값은
타입을 새로 만들어 모든 의존 컬럼을 옮기는 방식으로만 제거할 수 있고, 그 과정에서
이미 `like` / `dislike` 로 저장된 회원의 반응 행을 삭제하거나 다른 값으로 바꿔야 합니다.

→ **이것은 회원 데이터 처리에 대한 Product Decision 이므로 임의로 수행하지 않습니다.**
0010 을 되돌려야 하는 상황이 오면 HOLD 로 올리고 Owner 결정을 받으십시오.

현실적인 대응은 DB 롤백이 아니라 **코드 롤백**입니다:

- Vercel Instant Rollback 으로 직전 배포로 되돌림
- 추가된 enum 값은 DB 에 남지만, 이전 코드는 그 값을 쓰지도 읽지도 않으므로 무해
- 남아 있는 `like` / `dislike` 행은 이전 코드에서 그냥 무시됨 (구 코드의 tally 는 3종만 셈)

즉 0010 은 "DB 는 그대로 두고 코드만 되돌린다"가 정답입니다.

### 3.5 부분 실패 (한 파일 안에서 중간 statement 실패)

0008 / 0009 는 파일 안에 `add column` 과 `add constraint` 가 나뉘어 있습니다.
컬럼은 생겼는데 constraint 에서 실패한 경우:

- 파일 전체를 그대로 재실행하지 마십시오 → `add column if not exists` 는 통과하지만
  이미 생성된 constraint 가 있다면 `42710` 으로 다시 실패합니다.
- 실패한 statement 만 원인을 고쳐 개별 실행하거나, §3.2/§3.3 으로 되돌린 뒤 처음부터 다시 적용합니다.
- 어느 쪽이든 §1.2 스냅샷을 다시 찍어 현재 상태를 확정한 뒤에 판단합니다.

---

## 4. Migration Readiness 요약

| 항목 | 상태 |
|---|---|
| 마이그레이션 파일 3종 존재 · 번호 연속 · squash 없음 | PASS (테스트로 고정) |
| additive only (기존 테이블 무변경) | PASS (테스트로 고정) |
| 기존 행이 새 제약을 위반하지 않음 | PASS (전부 NULL / default 값) |
| `database.types.ts` ↔ 0001–0010 정합 | PASS (§5.2) |
| 재실행 안전성 | 부분적 — `add constraint` 는 재실행 불가 (§1.4) |
| 롤백 가능성 | 0008 / 0009 가능, **0010 불가** (§3.4) |
| Production 적용 | **미적용 — Owner 승인 대기** |

---

## 5. 부록

### 5.1 회귀 테스트 매핑

| 검증 대상 | 테스트 |
|---|---|
| 0008–0010 이 다른 테이블을 건드리지 않음 | `tests/legacy-compat.test.ts` › migration blast radius |
| 기존 Prayer 기록 무영향 | `tests/legacy-compat.test.ts` › legacy prayer records |
| 기존 Promise/Action 기록이 1회성으로 유지됨 | `tests/legacy-compat.test.ts` › legacy promise / action records |
| 기존 Repentance 4-field 기록 읽기 유지 | `tests/legacy-compat.test.ts` › legacy repentance records |
| 기존 legacy reaction 행이 무시되고 파괴되지 않음 | `tests/legacy-compat.test.ts` › legacy confession reaction rows |
| Journey 생일 앵커 | `tests/owner-ux-paths.test.ts` › journey birth anchor |
| Repentance 3-step 직접 저장 | `tests/owner-ux-paths.test.ts` › repentance three-step direct save |
| Promise 반복 / keep-rate | `tests/owner-ux-paths.test.ts` › promise recurrence and keep-rate |
| Confession 좋아요/싫어요/댓글 수 | `tests/owner-ux-paths.test.ts` › confession like / dislike / comment count |

### 5.2 `database.types.ts` ↔ 마이그레이션 대조

| 마이그레이션 | DB | `database.types.ts` | 정합 |
|---|---|---|---|
| 0008 | `profiles.birth_date date NULL` | `birth_date: string \| null` | ✅ |
| 0009 | `promises.repeat_type text NOT NULL default 'none'` | `repeat_type: PromiseRepeatType` | ✅ |
| 0009 | `promises.repeat_weekdays smallint[] NOT NULL default '{}'` | `repeat_weekdays: number[]` | ✅ |
| 0009 | CHECK `in ('none','daily','weekly','monthly','yearly')` | `PromiseRepeatType = 'none' \| 'daily' \| 'weekly' \| 'monthly' \| 'yearly'` | ✅ |
| 0010 | enum + `like`, `dislike` (기존 3종 유지) | `ReactionType = 'pray_together' \| 'received_grace' \| 'touched' \| 'like' \| 'dislike'` | ✅ |

### 5.3 남은 HOLD

| ID | 내용 | 필요한 것 |
|---|---|---|
| HOLD-1 | Production 0008–0010 적용 | Owner 승인 → 이 문서 §1~§2 수행 |
| HOLD-2 | 같은 게시물에 legacy 반응이 있는 회원이 👍 를 누르면, PK `(post_id, user_id)` 때문에 **본인 행**이 like 로 갱신됨. 자동 파괴는 없으나 보존이 필요하면 스키마 변경이 필요 | Product Decision |
| HOLD-3 | Repentance empty-draft (`startRepentance()` 가 버튼 누름 즉시 draft insert) | `RETURN-ISSUE-INQUIRY-2026-09-07.md` Q1–Q4 회신 |
