/*
 * REPENT — UX Validation Prototype (ux-v1-2)
 * NON-CANONICAL. Owner review only.
 *
 * Minimal state + routing so the CROSS-FLOW CONTINUITY can actually be clicked
 * through: every screen knows where the user came from (Entry Context), what it
 * optionally leads to (Next Optional Action) and how to get back (Return Target).
 *
 * Nothing here is production logic. No scoring, no automatic repentance, no
 * automatic sharing — every bridge is an explicit user choice.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ state */

  var KINDS = {
    prayer: { label: '기도', color: '#8B5CF6' },
    promise: { label: '약속', color: '#6D45C6' },
    action: { label: '실행', color: '#4FA6D9' },
    repentance: { label: '회개', color: '#C77DBB' },
    confession: { label: '고백', color: '#5BB58C' },
  };

  var store = { records: [], nextId: 1 };

  /** Navigation context stack — powers Entry Context + Return CTA. */
  var stack = [];
  var current = { screen: 'intro', ctx: null };

  function dayOffset(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

  function prettyDay(iso) {
    var parts = iso.split('-');
    return Number(parts[1]) + '월 ' + Number(parts[2]) + '일';
  }

  function add(type, title, body, extra) {
    var rec = {
      id: 'r' + store.nextId++,
      type: type,
      title: title,
      body: body || '',
      day: dayOffset(0),
    };
    if (extra) Object.keys(extra).forEach(function (k) { rec[k] = extra[k]; });
    store.records.push(rec);
    return rec;
  }

  function byType(type) {
    return store.records.filter(function (r) { return r.type === type; });
  }

  function findById(id) {
    return store.records.filter(function (r) { return r.id === id; })[0];
  }

  function resetData() {
    store.records = [];
    store.nextId = 1;
  }

  /** Demo records for the "already has history" states. */
  function seedData() {
    resetData();
    store.records = [
      { id: 'r1', type: 'prayer', title: '조급한 마음을 내려놓게 해주세요', body: '요즘 마음이 자꾸 앞서갑니다.', day: dayOffset(9) },
      { id: 'r2', type: 'promise', title: '매일 아침 10분 먼저 기도하기', body: '', day: dayOffset(9), status: 'active' },
      { id: 'r3', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(7), promiseId: 'r2' },
      {
        id: 'r4',
        type: 'repentance',
        title: '말로 사람을 아프게 했던 일',
        body: '말로 사람을 아프게 했던 일\n\n지친다는 이유로 아이에게 큰 소리를 냈습니다.\n\n피곤함이 이유가 될 수 없다는 걸 알게 됐습니다.\n\n먼저 미안하다고 말하기',
        day: dayOffset(5),
      },
      { id: 'r5', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(3), promiseId: 'r2' },
      { id: 'r6', type: 'confession', title: '작은 은혜', body: '별것 아닌 하루였는데 마음이 조용했습니다.', day: dayOffset(2), privacy: 'masked' },
      { id: 'r7', type: 'prayer', title: '가족을 위해', body: '', day: dayOffset(1) },
      { id: 'r8', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(0), promiseId: 'r2' },
      { id: 'r9', type: 'promise', title: '한 주에 한 번 안부 전하기', body: '', day: dayOffset(4), status: 'closed' },
    ];
    store.nextId = 10;
  }

  /* --------------------------------------------------------------- routing */

  var screens = {};

  function el(id) { return document.getElementById(id); }

  function nav(screen, ctx, opts) {
    if (!opts || !opts.replace) {
      if (current.screen !== screen) stack.push({ screen: current.screen, ctx: current.ctx });
    }
    current = { screen: screen, ctx: ctx || null };
    render();
  }

  function back() {
    var prev = stack.pop();
    current = prev || { screen: 'journey', ctx: null };
    render();
  }

  function render() {
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (node) {
      node.classList.toggle('is-active', node.id === 'screen-' + current.screen);
    });

    var showNav = ['journey', 'prayer', 'promise', 'repentance', 'confession'].indexOf(current.screen) >= 0;
    el('nav').style.display = showNav ? 'grid' : 'none';

    var navKey = current.screen;
    Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (node) {
      if (node.dataset.tab === navKey) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });

    renderContext();

    if (screens[current.screen]) screens[current.screen](current.ctx || {});

    var scroller = document.querySelector('#screen-' + current.screen + ' .scroll');
    if (scroller) scroller.scrollTop = 0;
  }

  /** Entry Context strip — small, always at the top, never blocking. */
  function renderContext() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-context]'), function (node) {
      var ctx = current.ctx;
      if (!ctx || !ctx.label) { node.style.display = 'none'; return; }
      node.style.display = 'flex';
      node.innerHTML =
        '<span class="context__label">' + ctx.label + '</span>' +
        '<span class="context__value">' + (ctx.value || '') + '</span>';
    });
  }

  /* ----------------------------------------------------------------- toast */

  var toastTimer = null;

  /** Every saved record reports where it landed on the Journey. */
  function markerToast(kindLabel) {
    var t = el('toast');
    el('toast-text').textContent = '여정에 ' + kindLabel + ' 기록이 남았어요';
    t.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-shown'); }, 4200);
  }

  el('toast-go').addEventListener('click', function () {
    el('toast').classList.remove('is-shown');
    nav('journey');
  });

  /* ------------------------------------------------------- return CTA block */

  function returnBlock(ctx) {
    if (!ctx || !ctx.returnTo) return '';
    return (
      '<button class="cta cta--ghost" data-return="' + ctx.returnTo + '"' +
      (ctx.returnId ? ' data-return-id="' + ctx.returnId + '"' : '') + '>' +
      (ctx.returnLabel || '돌아가기') +
      '</button>'
    );
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-return]') : null;
    if (!btn) return;
    var target = btn.dataset.return;
    var id = btn.dataset.returnId;
    if (target === 'promise-detail' && id) nav('promise-detail', { promiseId: id });
    else nav(target);
  });

  /* ---------------------------------------------------------- life curve */

  /**
   * Points only. One lane per record kind, one dot per record.
   * A day with no record produces no dot, nothing is interpolated between
   * dots, and no line or trend is drawn — this is not a growth graph.
   */
  function renderCurve(target, records, days) {
    var lanes = ['prayer', 'promise', 'action', 'repentance', 'confession'];
    var W = 330, H = 132, padL = 34, padR = 8, padT = 10, padB = 18;
    var innerW = W - padL - padR;
    var laneH = (H - padT - padB) / lanes.length;

    var today = new Date();
    function xFor(iso) {
      var d = new Date(iso + 'T00:00:00');
      var diff = Math.round((today - d) / 86400000);
      var t = 1 - Math.min(diff, days) / days;
      return padL + t * innerW;
    }

    var svg = ['<svg class="curve" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="기록이 있는 날의 표시">'];

    lanes.forEach(function (kind, i) {
      var y = padT + laneH * i + laneH / 2;
      svg.push('<line class="curve__grid" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" />');
      svg.push('<text class="curve__lane-label" x="0" y="' + (y + 3) + '">' + KINDS[kind].label + '</text>');
    });

    records.forEach(function (r) {
      var i = lanes.indexOf(r.type);
      if (i < 0) return;
      var y = padT + laneH * i + laneH / 2;
      var x = xFor(r.day);
      if (x < padL) return;
      svg.push('<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="5" fill="' + KINDS[r.type].color + '" />');
    });

    svg.push('<text class="curve__axis" x="' + padL + '" y="' + (H - 4) + '">' + days + '일 전</text>');
    svg.push('<text class="curve__axis" x="' + (W - padR) + '" y="' + (H - 4) + '" text-anchor="end">오늘</text>');
    svg.push('</svg>');

    target.innerHTML = svg.join('');
  }

  function legendHtml() {
    return Object.keys(KINDS)
      .map(function (k) {
        return '<span><i style="background:' + KINDS[k].color + '"></i>' + KINDS[k].label + '</span>';
      })
      .join('');
  }

  /* --------------------------------------------------------------- screens */

  screens.intro = function () {};

  /* 02 — three optional questions */
  var qIndex = 0;
  var qAnswers = ['', '', ''];
  var QUESTIONS = [
    { q: '오늘 하나님께 드리고 싶은 기도가 있나요?', ph: '짧게 한 문장이어도 좋습니다.', type: 'prayer' },
    { q: '마음에 남아 있는 약속이나 결단이 있나요?', ph: '지키지 못해도 괜찮습니다.', type: 'promise' },
    { q: '오늘 실천하고 싶은 한 가지가 있나요?', ph: '아주 작은 것이어도 좋습니다.', type: 'action' },
  ];

  screens.questions = function () {
    var q = QUESTIONS[qIndex];
    el('q-dots').innerHTML = QUESTIONS.map(function (_, i) {
      return '<i class="' + (i <= qIndex ? 'is-on' : '') + '"></i>';
    }).join('');
    el('q-title').textContent = q.q;
    el('q-input').placeholder = q.ph;
    el('q-input').value = qAnswers[qIndex];
    el('q-next').textContent = qIndex === QUESTIONS.length - 1 ? '기록하고 여정 시작하기' : '다음';
  };

  function questionAdvance(save) {
    if (save) qAnswers[qIndex] = el('q-input').value.trim();
    if (qIndex < QUESTIONS.length - 1) {
      qIndex++;
      screens.questions();
      return;
    }
    var created = [];
    qAnswers.forEach(function (text, i) {
      if (text) created.push(add(QUESTIONS[i].type, text, ''));
    });
    nav('first-saved', { created: created.length });
  }

  el('q-next').addEventListener('click', function () { questionAdvance(true); });
  el('q-skip').addEventListener('click', function () { questionAdvance(false); });

  /* 03 — first record landed on the journey */
  screens['first-saved'] = function (ctx) {
    var n = ctx.created || 0;
    el('fs-title').textContent = n > 0 ? '첫 기록이 여정에 남았어요' : '여정을 시작할 준비가 됐어요';
    el('fs-body').textContent =
      n > 0
        ? '오늘 남긴 ' + n + '개의 기록이 여정의 첫 점이 되었습니다. 앞으로 기록이 쌓이면 이곳에서 지나온 시간을 돌아볼 수 있어요.'
        : '지금은 비어 있어도 괜찮습니다. 기도 한 줄부터 천천히 남겨보세요.';
    renderCurve(el('fs-curve'), store.records, 14);
    el('fs-legend').innerHTML = legendHtml();
  };

  /* 04 — journey */
  var journeyRange = 'week';
  var RANGE_DAYS = { today: 1, week: 7, month: 30, year: 365, all: 365 };

  screens.journey = function () {
    var d = new Date();
    el('j-date').textContent =
      d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';

    var has = store.records.length > 0;
    var days = RANGE_DAYS[journeyRange];

    Array.prototype.forEach.call(document.querySelectorAll('#j-ranges .chip'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.range === journeyRange));
    });

    el('j-sample').style.display = has ? 'none' : 'inline-flex';
    el('j-caption').textContent = has
      ? '기록이 있는 날에만 점이 남습니다. 비어 있는 날은 표시되지 않아요.'
      : '기록이 쌓이면 이곳에서 나와 하나님 사이의 시간을 돌아볼 수 있어요. 아래는 예시입니다.';

    var demo = [
      { type: 'prayer', day: dayOffset(6) },
      { type: 'promise', day: dayOffset(5) },
      { type: 'action', day: dayOffset(3) },
      { type: 'action', day: dayOffset(1) },
      { type: 'confession', day: dayOffset(0) },
    ];

    renderCurve(el('j-curve'), has ? store.records : demo, has ? days : 7);
    el('j-legend').innerHTML = legendHtml();

    var cutoff = dayOffset(days - 1);
    var recent = store.records
      .filter(function (r) { return r.day >= cutoff; })
      .sort(function (a, b) { return a.day < b.day ? 1 : -1; });

    if (recent.length === 0) {
      el('j-recent').innerHTML =
        '<div class="empty"><p class="empty__title">이 기간에는 기록이 없습니다.</p>' +
        '<p class="empty__body">기록이 없는 날은 여정에 점으로 남지 않습니다.</p></div>';
    } else {
      el('j-recent').innerHTML = recent
        .map(function (r) {
          return (
            '<li class="tl__day"><span class="tl__date">' + prettyDay(r.day) + '</span>' +
            '<span class="tl__item"><span class="tl__kind">' + KINDS[r.type].label + '</span>' +
            r.title + '</span></li>'
          );
        })
        .join('');
    }

    el('j-tp').innerHTML = has
      ? '<div class="card"><div class="card__top"><div><p class="card__title">이 시기를 터닝포인트로 표시할까요?</p>' +
        '<p class="card__meta">' + prettyDay(dayOffset(5)) + ' 전후 · 확인은 직접 하셔야 남습니다</p></div></div>' +
        '<div class="card__actions"><button class="btn-sm btn-sm--fill">확인</button>' +
        '<button class="btn-sm">나중에</button></div></div>'
      : '<p class="note">아직 표시할 터닝포인트가 없습니다.</p>';
  };

  Array.prototype.forEach.call(document.querySelectorAll('#j-ranges .chip'), function (c) {
    c.addEventListener('click', function () {
      journeyRange = c.dataset.range;
      screens.journey();
    });
  });

  /* 05 — prayer */
  screens.prayer = function () {
    var all = byType('prayer');
    var weekCut = dayOffset(6);
    el('p-week').textContent = all.filter(function (r) { return r.day >= weekCut; }).length;
    el('p-total').textContent = all.length;

    var last = all[all.length - 1];
    el('p-recent').innerHTML = last
      ? '최근 기도: <b>' + last.title + '</b> · ' + prettyDay(last.day)
      : '아직 남긴 기도가 없습니다. 한 문장부터 시작해도 좋습니다.';

    el('p-title-input').value = '';
    el('p-body-input').value = '';
  };

  el('p-save').addEventListener('click', function () {
    var title = el('p-title-input').value.trim();
    var body = el('p-body-input').value.trim();
    if (!title && !body) { el('p-title-input').focus(); return; }
    var rec = add('prayer', title || body.slice(0, 24), body);
    markerToast('기도');
    nav('prayer-bridge', { prayerId: rec.id, title: rec.title });
  });

  /* 05b — prayer → promise bridge (optional, never forced) */
  screens['prayer-bridge'] = function (ctx) {
    el('pb-quote').textContent = ctx.title || '';
  };

  el('pb-make-promise').addEventListener('click', function () {
    nav('promise', {
      label: '기도에서 이어짐',
      value: current.ctx && current.ctx.title,
      openCompose: true,
      sourcePrayerId: current.ctx && current.ctx.prayerId,
    });
  });

  el('pb-done').addEventListener('click', function () { nav('journey', null, { replace: true }); });
  el('pb-history').addEventListener('click', function () { nav('prayer-history'); });

  /* 06 — prayer history */
  screens['prayer-history'] = function () {
    var all = byType('prayer').slice().reverse();
    el('ph-list').innerHTML = all.length
      ? all
          .map(function (r) {
            return (
              '<li class="card"><p class="card__meta">' + prettyDay(r.day) + '</p>' +
              '<p class="card__title">' + r.title + '</p>' +
              (r.body ? '<p class="card__body">' + r.body + '</p>' : '') + '</li>'
            );
          })
          .join('')
      : '<div class="empty"><p class="empty__title">아직 기도 기록이 없습니다.</p></div>';
  };

  /* 07 — promise dashboard */
  screens.promise = function (ctx) {
    var all = byType('promise');
    var active = all.filter(function (r) { return r.status !== 'closed'; });
    el('pr-active').textContent = active.length;
    el('pr-closed').textContent = all.length - active.length;

    var last = all[all.length - 1];
    if (last) {
      var acts = byType('action').filter(function (a) { return a.promiseId === last.id; });
      el('pr-recent').innerHTML =
        '최근 약속: <b>' + last.title + '</b>' +
        (acts.length ? ' · 최근 실행 ' + prettyDay(acts[acts.length - 1].day) : ' · 아직 실행 없음');
    } else {
      el('pr-recent').textContent = '아직 남긴 약속이 없습니다.';
    }

    el('pr-compose').style.display = ctx && ctx.openCompose ? 'block' : 'none';
    el('pr-new-input').value = '';

    el('pr-list').innerHTML = all.length
      ? all
          .slice()
          .reverse()
          .map(function (r) {
            var acts = byType('action').filter(function (a) { return a.promiseId === r.id; });
            var lastAct = acts[acts.length - 1];
            return (
              '<li class="card"><div class="card__top"><div>' +
              '<p class="card__title">' + r.title + '</p>' +
              '<p class="card__meta">실행 ' + acts.length + '회' +
              (lastAct ? ' · 최근 ' + prettyDay(lastAct.day) : '') + '</p></div>' +
              (r.status === 'closed' ? '<span class="badge badge--done">마무리됨</span>' : '<span class="badge">진행 중</span>') +
              '</div><div class="card__actions">' +
              '<button class="btn-sm btn-sm--fill" data-open-promise="' + r.id + '">실행 추가</button>' +
              '<button class="btn-sm" data-reflect-promise="' + r.id + '">돌아보기</button>' +
              '</div></li>'
            );
          })
          .join('')
      : '<div class="empty"><p class="empty__title">아직 약속이 없습니다.</p>' +
        '<p class="empty__body">기도에서 마음에 남은 것이 있다면 한 줄로 적어보세요.</p></div>';
  };

  el('pr-new-save').addEventListener('click', function () {
    var text = el('pr-new-input').value.trim();
    if (!text) { el('pr-new-input').focus(); return; }
    var extra = { status: 'active' };
    if (current.ctx && current.ctx.sourcePrayerId) extra.sourcePrayerId = current.ctx.sourcePrayerId;
    var rec = add('promise', text, '', extra);
    markerToast('약속');
    nav('promise-detail', { promiseId: rec.id, label: '방금 남긴 약속', value: rec.title });
  });

  document.addEventListener('click', function (e) {
    var open = e.target.closest && e.target.closest('[data-open-promise]');
    if (open) { nav('promise-detail', { promiseId: open.dataset.openPromise }); return; }
    var refl = e.target.closest && e.target.closest('[data-reflect-promise]');
    if (refl) {
      var p = findById(refl.dataset.reflectPromise);
      nav('reflection', { promiseId: p.id, label: '약속에서 이어짐', value: p.title, returnTo: 'promise-detail', returnId: p.id, returnLabel: '약속으로 돌아가기' });
    }
  });

  /* 08 — promise detail + action */
  screens['promise-detail'] = function (ctx) {
    var p = findById(ctx.promiseId);
    if (!p) { nav('promise'); return; }
    el('pd-title').textContent = p.title;
    var acts = byType('action').filter(function (a) { return a.promiseId === p.id; });
    el('pd-meta').textContent =
      '실행 ' + acts.length + '회' + (acts.length ? ' · 최근 ' + prettyDay(acts[acts.length - 1].day) : '') +
      ' · ' + (p.status === 'closed' ? '마무리됨' : '진행 중');

    el('pd-status').innerHTML =
      p.status === 'closed'
        ? '<span class="badge badge--done">마무리됨</span>'
        : '<button class="badge" id="pd-close">마무리됨으로 표시</button>';

    var closeBtn = el('pd-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        p.status = 'closed';
        screens['promise-detail']({ promiseId: p.id });
      });
    }

    el('pd-action-input').value = '';

    el('pd-actions').innerHTML = acts.length
      ? acts
          .slice()
          .reverse()
          .map(function (a) {
            return (
              '<li class="tl__day"><span class="tl__date">' + prettyDay(a.day) + '</span>' +
              '<span class="tl__item">' + a.title + '</span></li>'
            );
          })
          .join('')
      : '<p class="note">아직 실행 기록이 없습니다. 실행이 없어도 약속은 그대로 유효합니다.</p>';

    el('pd-return').innerHTML = returnBlock(ctx);
  };

  el('pd-action-save').addEventListener('click', function () {
    var p = findById(current.ctx.promiseId);
    var text = el('pd-action-input').value.trim();
    if (!text) { el('pd-action-input').focus(); return; }
    var rec = add('action', text, '', { promiseId: p.id });
    markerToast('실행');
    nav('reflection', {
      actionId: rec.id,
      promiseId: p.id,
      label: '실행에서 이어짐',
      value: rec.title,
      returnTo: 'promise-detail',
      returnId: p.id,
      returnLabel: '약속으로 돌아가기',
    });
  });

  el('pd-reflect').addEventListener('click', function () {
    var p = findById(current.ctx.promiseId);
    nav('reflection', {
      promiseId: p.id,
      label: '약속에서 이어짐',
      value: p.title,
      returnTo: 'promise-detail',
      returnId: p.id,
      returnLabel: '약속으로 돌아가기',
    });
  });

  /* 09 — reflection bridge */
  screens.reflection = function (ctx) {
    var p = ctx.promiseId ? findById(ctx.promiseId) : null;
    el('rf-title').textContent = ctx.actionId
      ? '오늘 이 약속을 어떻게 살아냈나요?'
      : '이 약속과 관련해 다시 돌아보고 싶은 마음이 있나요?';
    el('rf-sub').textContent = p ? p.title : '';
    el('rf-return').innerHTML = returnBlock(ctx);
  };

  el('rf-record-only').addEventListener('click', function () {
    markerToast('돌아봄');
    var c = current.ctx;
    if (c && c.returnTo === 'promise-detail') nav('promise-detail', { promiseId: c.returnId });
    else nav('journey');
  });

  el('rf-retry').addEventListener('click', function () {
    var c = current.ctx;
    nav('promise-detail', { promiseId: c.promiseId, label: '다시 시도', value: '오늘 할 수 있는 한 가지를 적어보세요' });
  });

  el('rf-edit').addEventListener('click', function () {
    var c = current.ctx;
    nav('promise-detail', { promiseId: c.promiseId, label: '약속 수정', value: '내용을 다시 적어도 괜찮습니다' });
  });

  el('rf-repent').addEventListener('click', function () {
    var c = current.ctx;
    var p = c.promiseId ? findById(c.promiseId) : null;
    nav('repentance', {
      label: '실행에서 이어짐',
      value: p ? p.title : '',
      returnTo: 'promise-detail',
      returnId: c.promiseId,
      returnLabel: '약속으로 돌아가기',
    });
  });

  /* 10 — repentance (both entries: standalone and continued) */
  screens.repentance = function (ctx) {
    var all = byType('repentance');
    var monthCut = dayOffset(29);
    el('rp-month').textContent = all.filter(function (r) { return r.day >= monthCut; }).length;
    el('rp-total').textContent = all.length;

    var last = all[all.length - 1];
    el('rp-recent').innerHTML = last
      ? '최근 기록: <b>' + last.title + '</b> · ' + prettyDay(last.day)
      : '지난 기억도 괜찮습니다. 지금 마음에 남아 있는 것부터 적어보세요.';

    el('rp-sin').value = '';
    el('rp-behavior').value = '';
    el('rp-insight').value = '';
    el('rp-turn').value = '';
    el('rp-scripture-panel').style.display = 'none';
    el('rp-scripture-panel').innerHTML = '';
    el('rp-return').innerHTML = returnBlock(ctx);
  };

  /**
   * Scripture is offered as references the user picks from — never as a verdict
   * on what they wrote. Full text stays out (license HOLD).
   */
  el('rp-scripture').addEventListener('click', function () {
    var panel = el('rp-scripture-panel');
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    panel.innerHTML =
      '<div class="preview"><p class="preview__tag">참고할 말씀 후보</p>' +
      '<p class="note" style="margin-bottom:10px">직접 고르실 수 있습니다. 어떤 말씀이 맞는지는 앱이 정하지 않습니다.</p>' +
      '<label class="checkline"><input type="checkbox"><span>' +
      '<span class="checkline__label">시편 51:10</span><br>' +
      '<span class="checkline__value">직접 관련</span></span></label>' +
      '<label class="checkline"><input type="checkbox"><span>' +
      '<span class="checkline__label">요한일서 1:9</span><br>' +
      '<span class="checkline__value">직접 관련</span></span></label>' +
      '<label class="checkline"><input type="checkbox"><span>' +
      '<span class="checkline__label">잠언 15:1</span><br>' +
      '<span class="checkline__value">주제 관련</span></span></label>' +
      '<label class="checkline" style="border-bottom:0"><input type="checkbox"><span>' +
      '<span class="checkline__label">누가복음 15:11-32</span><br>' +
      '<span class="checkline__value">묵상 후보</span></span></label>' +
      '<p class="note" style="margin-top:10px">본문 전문은 라이선스 확보 후 제공합니다.</p></div>';
  });

  el('rp-to-promise').addEventListener('click', function () {
    nav('promise', {
      label: '회개 기록에서 이어짐',
      value: el('rp-turn').value.trim() || '돌이키고 싶은 방향',
      openCompose: true,
      returnTo: 'repentance',
      returnLabel: '회개 기록으로 돌아가기',
    });
  });

  el('rp-to-action').addEventListener('click', function () {
    var promises = byType('promise').filter(function (p) { return p.status !== 'closed'; });
    if (promises.length) {
      var p = promises[promises.length - 1];
      nav('promise-detail', {
        promiseId: p.id,
        label: '회개 기록에서 이어짐',
        value: p.title,
        returnTo: 'repentance',
        returnLabel: '회개 기록으로 돌아가기',
      });
    } else {
      nav('promise', {
        label: '회개 기록에서 이어짐',
        value: '실행을 담을 약속을 먼저 남겨주세요',
        openCompose: true,
        returnTo: 'repentance',
        returnLabel: '회개 기록으로 돌아가기',
      });
    }
  });

  el('rp-finish').addEventListener('click', function () {
    var sin = el('rp-sin').value.trim();
    var behavior = el('rp-behavior').value.trim();
    var insight = el('rp-insight').value.trim();
    var turn = el('rp-turn').value.trim();
    var filled = [sin, behavior, insight, turn].filter(Boolean);
    if (!filled.length) { el('rp-sin').focus(); return; }
    var rec = add('repentance', filled[0], filled.join('\n\n'));
    markerToast('회개');
    nav('repentance-bridge', {
      recordId: rec.id,
      returnTo: current.ctx && current.ctx.returnTo,
      returnId: current.ctx && current.ctx.returnId,
      returnLabel: current.ctx && current.ctx.returnLabel,
    });
  });

  /* 10b — repentance → optional share bridge (never automatic) */
  screens['repentance-bridge'] = function (ctx) {
    el('rb-return').innerHTML = returnBlock(ctx);
  };

  el('rb-share').addEventListener('click', function () {
    nav('sharecopy', { recordId: current.ctx.recordId, label: '회개 기록에서 이어짐', value: '고른 항목만 나눠집니다' });
  });

  el('rb-keep').addEventListener('click', function () {
    var c = current.ctx;
    if (c && c.returnTo === 'promise-detail' && c.returnId) nav('promise-detail', { promiseId: c.returnId });
    else nav('journey');
  });

  el('rb-history').addEventListener('click', function () { nav('repentance-history'); });

  /* 11 — repentance history */
  screens['repentance-history'] = function () {
    var all = byType('repentance').slice().reverse();
    el('rh-list').innerHTML = all.length
      ? all
          .map(function (r) {
            return (
              '<li class="card"><p class="card__meta">' + prettyDay(r.day) + '</p>' +
              '<p class="card__body">' + (r.body || r.title) + '</p></li>'
            );
          })
          .join('')
      : '<div class="empty"><p class="empty__title">아직 회개 기록이 없습니다.</p></div>';
  };

  /* 12 — confession feed */
  var SAMPLE_FEED = [
    { who: '이름 비공개', type: '기도', when: '2시간 전', body: '오래 붙잡고 있던 일을 오늘은 그냥 맡기기로 했습니다.' },
    { who: '김은혜', type: '은혜', when: '5시간 전', body: '별일 없는 하루였는데, 저녁에 마음이 이상하게 잔잔했어요.' },
    { who: '이름 비공개', type: '고백', when: '어제', body: '아이에게 또 큰 소리를 냈습니다. 미안하다고 말하고 왔습니다.' },
    { who: '박소망', type: '일상', when: '어제', body: '출근길에 라디오에서 나온 찬양 한 소절이 하루 종일 맴돌았습니다.' },
  ];

  screens.confession = function () {
    var mine = byType('confession').slice().reverse().map(function (r) {
      return {
        who: r.privacy === 'named' ? '나' : '이름 비공개',
        type: r.ctype || '고백',
        when: prettyDay(r.day),
        body: r.body || r.title,
        mine: true,
      };
    });

    el('cf-list').innerHTML = mine
      .concat(SAMPLE_FEED)
      .map(function (p) {
        return (
          '<article class="post"><div class="post__meta">' +
          '<span class="post__who">' + p.who + '</span><span>·</span><span>' + p.type + '</span>' +
          '<span>·</span><span>' + p.when + '</span>' +
          (p.mine ? '<span>·</span><span>내 기록</span>' : '') +
          '</div><p class="post__body">' + p.body + '</p>' +
          '<div class="post__actions"><button class="react" aria-pressed="false">함께 기도해요</button></div>' +
          '</article>'
        );
      })
      .join('');
  };

  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('.react');
    if (!r) return;
    r.setAttribute('aria-pressed', r.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });

  el('cf-compose').addEventListener('click', function () { nav('composer'); });

  /* 13 — composer */
  var composerType = '기도';
  var composerPrivacy = 'masked';

  screens.composer = function () {
    el('cp-input').value = '';
    Array.prototype.forEach.call(document.querySelectorAll('#cp-types .chip'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.type === composerType));
    });
    Array.prototype.forEach.call(document.querySelectorAll('#cp-privacy .privacy__opt'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.privacy === composerPrivacy));
    });
  };

  Array.prototype.forEach.call(document.querySelectorAll('#cp-types .chip'), function (c) {
    c.addEventListener('click', function () { composerType = c.dataset.type; screens.composer(); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('#cp-privacy .privacy__opt'), function (c) {
    c.addEventListener('click', function () { composerPrivacy = c.dataset.privacy; screens.composer(); });
  });

  el('cp-save').addEventListener('click', function () {
    var text = el('cp-input').value.trim();
    if (!text) { el('cp-input').focus(); return; }
    add('confession', text.slice(0, 24), text, { privacy: composerPrivacy, ctype: composerType });
    markerToast('고백');
    nav('confession', null, { replace: true });
  });

  /* 14 — ShareCopy preview → confession */
  screens.sharecopy = function (ctx) {
    var rec = ctx.recordId ? findById(ctx.recordId) : null;
    var parts = rec ? (rec.body || rec.title).split('\n\n') : ['돌아본 내용', '고백한 내용'];
    var labels = ['죄를 돌아보기', '구체적으로 돌아보기', '새롭게 깨달은 것', '돌이키기'];

    el('sc-fields').innerHTML = parts
      .map(function (v, i) {
        return (
          '<label class="checkline"><input type="checkbox" data-field="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
          '<span><span class="checkline__label">' + (labels[i] || '내용') + '</span><br>' +
          '<span class="checkline__value">' + v + '</span></span></label>'
        );
      })
      .join('');

    el('sc-return').innerHTML = returnBlock(ctx);
    updateSharePreview();
  };

  function updateSharePreview() {
    var picked = [];
    Array.prototype.forEach.call(document.querySelectorAll('#sc-fields input:checked'), function (i) {
      picked.push(i.parentNode.querySelector('.checkline__value').textContent);
    });
    el('sc-preview').innerHTML = picked.length
      ? '<p class="preview__tag">이대로 보여집니다</p><p class="post__body">' + picked.join('\n\n') + '</p>' +
        '<p class="note" style="margin-top:12px">이름 비공개 · 원본과 분리된 사본입니다</p>'
      : '<p class="note">나눌 항목을 하나 이상 선택해 주세요.</p>';
  }

  el('sc-fields').addEventListener('change', updateSharePreview);

  el('sc-publish').addEventListener('click', function () {
    var picked = document.querySelectorAll('#sc-fields input:checked').length;
    if (!picked) return;
    var texts = [];
    Array.prototype.forEach.call(document.querySelectorAll('#sc-fields input:checked'), function (i) {
      texts.push(i.parentNode.querySelector('.checkline__value').textContent);
    });
    add('confession', texts[0].slice(0, 24), texts.join('\n\n'), { privacy: 'masked', ctype: '고백' });
    markerToast('고백');
    nav('confession', null, { replace: true });
  });

  /* ------------------------------------------------------- nav + chrome */

  Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (n) {
    n.addEventListener('click', function () { nav(n.dataset.tab); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (b) {
    b.addEventListener('click', function () { nav(b.dataset.go); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (b) {
    b.addEventListener('click', back);
  });

  /* Prototype-only screen index (not part of the product UI) */
  var INDEX = [
    ['01 Intro', 'intro', 'reset'],
    ['02 3 Questions', 'questions', 'reset'],
    ['03 첫 기록 → 여정 안착', 'first-saved', 'first'],
    ['04 Journey — 신규/빈 상태', 'journey', 'reset'],
    ['05 Journey — 기록 있음', 'journey', 'seed'],
    ['06 Prayer', 'prayer', 'seed'],
    ['07 Prayer → 약속 브릿지', 'prayer-bridge', 'seed'],
    ['08 Prayer History', 'prayer-history', 'seed'],
    ['09 Promise Dashboard', 'promise', 'seed'],
    ['10 Promise Detail + Action', 'promise-detail', 'seed'],
    ['11 Reflection Bridge', 'reflection', 'seed'],
    ['12 Repentance — 직접 진입', 'repentance', 'seed'],
    ['13 Repentance — 실행에서 이어짐', 'repentance', 'seed-linked'],
    ['14 회개 → 나누기 브릿지', 'repentance-bridge', 'seed'],
    ['15 Repentance History', 'repentance-history', 'seed'],
    ['16 Confession Feed', 'confession', 'seed'],
    ['17 Confession Composer', 'composer', 'seed'],
    ['18 ShareCopy → Confession Preview', 'sharecopy', 'seed'],
  ];

  el('proto-index-list').innerHTML = INDEX.map(function (row, i) {
    return '<li><button data-idx="' + i + '">' + row[0] + '<br><span>' + row[1] + '</span></button></li>';
  }).join('');

  el('proto-index-list').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-idx]');
    if (!b) return;
    var row = INDEX[Number(b.dataset.idx)];
    var mode = row[2];

    if (mode === 'reset') resetData();
    if (mode === 'seed' || mode === 'seed-linked') seedData();
    if (mode === 'first') { resetData(); add('prayer', '조급한 마음을 내려놓게 해주세요', ''); }

    stack = [];
    var ctx = null;
    if (row[1] === 'promise-detail') ctx = { promiseId: 'r2' };
    if (row[1] === 'reflection') {
      ctx = { promiseId: 'r2', actionId: 'r8', label: '실행에서 이어짐', value: '아침 10분 기도', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    }
    if (row[1] === 'repentance' && mode === 'seed-linked') {
      ctx = { label: '실행에서 이어짐', value: '매일 아침 10분 먼저 기도하기', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    }
    if (row[1] === 'repentance-bridge') ctx = { recordId: 'r4', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    if (row[1] === 'sharecopy') ctx = { recordId: 'r4', label: '회개 기록에서 이어짐', value: '고른 항목만 나눠집니다' };
    if (row[1] === 'first-saved') ctx = { created: 1 };
    if (row[1] === 'prayer-bridge') ctx = { prayerId: 'r7', title: '가족을 위해' };

    closeIndex();
    current = { screen: row[1], ctx: ctx };
    render();
  });

  function openIndex() { el('proto-index').classList.add('is-open'); }
  function closeIndex() { el('proto-index').classList.remove('is-open'); }

  el('proto-menu').addEventListener('click', openIndex);
  el('proto-index-close').addEventListener('click', closeIndex);

  el('proto-loop').addEventListener('click', function () {
    resetData();
    qIndex = 0;
    qAnswers = ['', '', ''];
    stack = [];
    closeIndex();
    current = { screen: 'intro', ctx: null };
    render();
  });

  /* ------------------------------------------------------------- start */

  resetData();
  render();
})();
