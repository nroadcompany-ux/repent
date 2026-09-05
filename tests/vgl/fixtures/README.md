# VGL AC Fixtures

**AC Canonical Source Imported = YES** (2026-09-05, `REPENT_VGL_Runtime_Canonical_Import_Pack.zip` 실제 첨부·확인)

`ac-cases.official.json` — `VGL-RPT-AC-001~065` 원문(문장/판정/이유), Red-Team
No.1~65와 순서 그대로 매핑됨. **원본과 byte-identical 복사본**이며, 이 세션에서
직접 독립 재검증했다(제공된 `source_integrity` 메타데이터를 그대로 믿지
않고 `tests/vgl/runner/validate-official.mjs`로 원본 `source/` 마크다운과
diff): 65/65 건 전부 문장·판정·이유 변경 0건 확인.

- `ac-cases.official.json` — 공식 65 AC 원문 (수정 금지)
- `source/02_VGL_for_REPENT_RedTeam_65_v0.2.md` — 원본 Evidence 문서 (수정 금지)
- `ac-cases.schema.json` — 위 파일의 실제 구조에 맞춰 갱신된 스키마
- `smoke-cases.json` — 자체 제작 스모크 테스트 5건 (여전히 공식 AC 아님 — 별도 목적)

## 검증 스크립트

```bash
# 구조·건수·ID·Verdict 어휘·원본 대조 (API Key 불필요)
node tests/vgl/runner/validate-official.mjs

# Validator 단독 진단 — 공식 Model Run 아님, Runtime Output(모델 호출) 생략
# (test_sentence를 후보 출력으로 간주해 Validator에 직접 투입)
node tests/vgl/runner/validator-dryrun.mjs
```

`validator-dryrun.mjs` 결과(2026-09-05 실행): 65건 중 REWRITE 2건은 Validator가
아예 모델링하지 않은 verdict라 미지원 처리, 나머지 63건 중 **34건만 일치, 29건
불일치**(대부분 실제 Red-Team 문장을 현재 정규식이 못 잡음). 이건 "Official
65 AC Actual Test Run"이 아니라 Validator 자체의 현재 취약점을 보여주는
진단이다 — Validator 패턴 보강이 별도 작업으로 필요함을 뜻한다.

## 남은 것

- Model Provider API Key 없음 → 진짜 Runtime Output(Provider 실제 호출) 포함한
  Official 65 AC Actual Test Run은 아직 NOT RUN
- Validator 패턴이 실제 Red-Team 65건 상당수를 못 잡음 → 정규식 보강 필요
  (이번 라운드 범위 밖, 별도 작업으로 진행 예정)
