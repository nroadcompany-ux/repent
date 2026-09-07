-- RETURN — 0011 Promise provenance
-- Owner decision 2026-09-07 (Issue #20 §A, approved in Issue #21 §A):
-- 회개 → 돌이킴 약속 연결을 제목 prefill이 아니라 실제로 저장한다.
--
-- 규약은 0003 ShareCopy와 동일한 soft pointer다: 타입 + id, FK 없음.
-- FK를 두지 않는 이유는 회개 기록을 지워도 그 약속은 회원 본인의 다짐으로
-- 남아야 하기 때문이다. cascade 삭제도, set null 로 연결 사실이 사라지는 것도
-- 원하는 동작이 아니다.
--
-- 기존 행 backfill은 하지 않는다. 과거 약속의 출처는 알 수 없고, 제목이나
-- 시각으로 추정 매칭하면 없는 사실을 만들어내는 것이다.

alter table public.promises
  add column if not exists source_kind public.share_source_kind,
  add column if not exists source_id   uuid;

-- 반쪽 provenance 금지: 둘 다 있거나 둘 다 없거나.
alter table public.promises
  add constraint promises_source_pair_check
  check ((source_kind is null) = (source_id is null));
