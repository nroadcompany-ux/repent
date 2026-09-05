이 폴더는 `tests/vgl/runner/run.mjs` 실행 결과(Evidence Log)가 쌓이는 곳이다.

현재 커밋에 포함된 `run-*.jsonl` / `run-*.summary.json`은 **스모크 테스트
1회 실행분**이다(`smoke-cases.json` 5건, `--provider mock`). 공식
`VGL-RPT-AC-001~065` 실행 결과가 아니다 — Runner/Validator 배선이 실제로
동작하는지 증명하기 위한 것.

공식 실행 결과가 쌓이면 이 스모크 실행 파일과 섞이지 않도록 구분할 것
(파일명이 이미 run_id로 구분되긴 하나, summary 리포트 작성 시 official
필드로 반드시 필터링).
