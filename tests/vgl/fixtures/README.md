# VGL AC Fixtures

**AC Canonical Source Imported = NO**

`VGL-RPT-AC-001~065`의 실제 Input/Expected Verdict 원문은 이 세션에서 접근
가능한 어떤 소스(Repository, 연결된 Notion Workspace)에도 존재하지 않는다.
Notion의 `REPENT PM Working Hub`에는 "65 AC Execution Prep = READY 65/65"라는
상태값과 G-Gate ↔ AC 번호 매핑(`runtime/config/gates.json` 참조), Human Review
대상 2건의 제목만 있고 65건 전체 본문은 없다.

PM이 `VGL_for_REPENT_Upper_Session_Report_Package_v0.3.zip`
(`Evidence_v0.2/02_VGL_for_REPENT_RedTeam_65_v0.2.md`)에 원문이 있다고
2026-09-05에 전달했으나, **이 zip은 세션 업로드 디렉토리에 실제로 존재하지
않음**(검색 확인 완료) — 채팅에서 설명된 파일 경로/내용을 근거로 65건을
재구성하지 않았다. 실제 파일이 이 대화에 첨부돼야 한다.

**기억으로 재작성하지 않는다.** 아래 파일들은 원문이 아니다:

- `ac-cases.schema.json` — 원문이 들어올 스키마 정의
- `smoke-cases.json` — Runner/Validator 배선을 검증하기 위한 자체 제작
  스모크 테스트 5건 (`SMOKE-01`~`SMOKE-05`, `VGL-RPT-AC-` 접두어 사용 안 함 —
  공식 65 AC와 혼동 금지)

## 원문 확보 후 절차

1. PM이 `VGL-RPT-AC-001~065` 원문을 이 폴더에 `ac-cases.official.json`
   (스키마 준수, 각 항목 `source` 필드 필수)으로 전달.
2. `node tests/vgl/runner/run.mjs --cases tests/vgl/fixtures/ac-cases.official.json --provider openai --official`
   로 실제 실행 (`OPENAI_API_KEY` 필요).
3. 결과는 `tests/vgl/results/`에 JSONL로 남는다.
