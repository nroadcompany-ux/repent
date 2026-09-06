/*
 * REPENT — UX Validation Prototype (ux-v1-2)
 * NON-CANONICAL. Owner review only.
 *
 * Minimal state + routing so the cross-flow continuity can actually be clicked
 * through: every screen knows where the user came from (Entry Context), what it
 * optionally leads to, and how to get back (Return Target).
 *
 * Nothing here is production logic. No scoring, no automatic repentance, no
 * automatic sharing, and no judgement of whether a prayer is right or selfish —
 * the discernment prompts are questions the user asks themselves.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ data */

  var KINDS = {
    prayer: { label: '기도', color: '#6D4AFF' },
    script: { label: '기도문', color: '#9A7CFF' },
    promise: { label: '약속', color: '#4A2FD6' },
    action: { label: '실행', color: '#3E9BD6' },
    repentance: { label: '회개', color: '#C06FB8' },
    confession: { label: '고백', color: '#22A06B' },
  };

  /** Prayer groups. Grouping is a user-facing organiser, not a status. */
  var PRAYER_GROUPS = [
    { id: 'soul', icon: '🙏', name: '영혼을 위한 중보', desc: '아직 예수님을 모르는 이들, 마음이 멀어진 이들을 위해',
      discern: '그 사람이 변하기를 바라는 마음에, 내가 편해지고 싶은 마음이 섞여 있지는 않나요?' },
    { id: 'family', icon: '🏠', name: '가족', desc: '함께 사는 사람들, 멀리 있는 가족을 위해',
      discern: '가족이 잘되기를 바라는 마음 안에, 내 뜻대로 되기를 바라는 마음은 없나요?' },
    { id: 'health', icon: '🌱', name: '건강', desc: '몸과 마음의 회복을 위해',
      discern: '회복을 구하면서도, 그 시간 동안 하나님과 함께 있기를 구하고 있나요?' },
    { id: 'finance', icon: '💼', name: '재정과 일', desc: '생계와 일터, 필요한 것들을 위해',
      discern: '지금 필요한 것을 구하는 마음과, 더 갖고 싶은 마음 사이에서 이 기도는 어디쯤에 있나요?' },
    { id: 'church', icon: '⛪', name: '교회와 사역', desc: '섬기는 자리와 함께하는 공동체를 위해',
      discern: '섬김을 구하는 마음에, 인정받고 싶은 마음이 함께 있지는 않나요?' },
    { id: 'self', icon: '🕊️', name: '나 자신', desc: '내 마음과 태도, 하나님과의 관계를 위해',
      discern: '고쳐달라고 구하는 것과, 고치기로 마음먹는 것 중 지금은 어느 쪽에 가깝나요?' },
  ];

  function groupById(id) {
    return PRAYER_GROUPS.filter(function (g) { return g.id === id; })[0] || PRAYER_GROUPS[5];
  }

  var store = { records: [], nextId: 1 };
  var stack = [];
  var current = { screen: 'intro', ctx: null };

  function dayOffset(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function prettyDay(iso) {
    var p = iso.split('-');
    return Number(p[1]) + '월 ' + Number(p[2]) + '일';
  }

  function daysSince(iso) {
    return Math.max(0, Math.round((new Date() - new Date(iso + 'T00:00:00')) / 86400000));
  }

  function add(type, title, body, extra) {
    var rec = { id: 'r' + store.nextId++, type: type, title: title, body: body || '', day: dayOffset(0) };
    if (extra) Object.keys(extra).forEach(function (k) { rec[k] = extra[k]; });
    store.records.push(rec);
    return rec;
  }

  function byType(t) { return store.records.filter(function (r) { return r.type === t; }); }
  function findById(id) { return store.records.filter(function (r) { return r.id === id; })[0]; }

  function resetData() { store.records = []; store.nextId = 1; }

  function seedData() {
    resetData();
    store.records = [
      { id: 'r1', type: 'prayer', group: 'self', title: '조급한 마음을 내려놓게 해주세요',
        body: '자꾸 앞서갑니다. 결과부터 계산하다가 하루가 다 갑니다.', day: dayOffset(24),
        hearts: { give: '기다릴 줄 아는 마음', receive: '조급하지 않은 하루', praise: '끝까지 기다렸구나' } },
      { id: 'r2', type: 'promise', title: '매일 아침 10분 먼저 기도하기', body: '', day: dayOffset(20),
        status: 'active', sourcePrayerId: 'r1',
        // Gaps on purpose: a day without a mark is just empty, not a failure.
        group: 'daily',
        context: '아침마다 쫓기듯 하루를 시작하는 게 마음에 걸렸습니다.',
        purpose: '하루를 하나님 앞에서 먼저 시작하고 싶습니다.',
        // Gaps on purpose: a day without a mark is just empty, not a failure.
        checks: (function () {
          var c = {};
          [1, 2, 4, 5, 8, 9, 11].forEach(function (n) { c[dayOffset(n)] = true; });
          return c;
        })() },
      { id: 'r16', type: 'promise', title: '40일 새벽기도 이어가기', body: '', day: dayOffset(22),
        status: 'active', group: 'season',
        context: '올해는 한 번 끝까지 해보고 싶다는 마음이 들었습니다.',
        purpose: '흔들릴 때마다 돌아올 자리를 만들어두려고 합니다.',
        due: (function () {
          var d = new Date();
          d.setDate(d.getDate() + 18);
          return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        })(),
        checks: (function () {
          var c = {};
          [0, 1, 3, 4, 6, 7, 10, 12, 13, 15, 16, 18, 19, 21].forEach(function (n) { c[dayOffset(n)] = true; });
          return c;
        })() },
      { id: 'r3', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(14), promiseId: 'r2' },
      { id: 'r4', type: 'repentance', title: '말로 사람을 아프게 했던 일',
        body: '말로 사람을 아프게 했던 일\n\n지친다는 이유로 아이에게 큰 소리를 냈습니다.\n\n피곤함이 이유가 될 수 없다는 걸 알게 됐습니다.\n\n먼저 미안하다고 말하기',
        day: dayOffset(9) },
      { id: 'r5', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(6), promiseId: 'r2' },
      { id: 'r6', type: 'confession', title: '작은 은혜', body: '별것 아닌 하루였는데 저녁에 마음이 조용했습니다.',
        day: dayOffset(4), privacy: 'masked', ctype: '은혜' },
      { id: 'r7', type: 'prayer', group: 'family', title: '아이가 마음 편히 자라기를',
        body: '요즘 부쩍 말수가 줄었습니다.', day: dayOffset(12),
        hearts: { give: '먼저 들어주는 마음', receive: '아이와의 편한 저녁', praise: '끝까지 들어줬구나' } },
      { id: 'r8', type: 'action', title: '아침 10분 기도', body: '', day: dayOffset(0), promiseId: 'r2' },
      { id: 'r9', type: 'promise', title: '한 주에 한 번 안부 전하기', body: '', day: dayOffset(30),
        status: 'closed', group: 'people' },
      { id: 'r17', type: 'promise', title: '하루 세 번 짧게 기도하기', body: '', day: dayOffset(6),
        status: 'active', group: 'daily', dailyTarget: 3,
        context: '길게는 못 해도 자주 떠올리고 싶었습니다.',
        purpose: '하루 중에 하나님을 잊지 않으려고요.',
        checks: (function () {
          var c = {};
          c[dayOffset(0)] = 2;
          c[dayOffset(1)] = 3;
          c[dayOffset(2)] = 1;
          c[dayOffset(4)] = 3;
          c[dayOffset(5)] = 3;
          return c;
        })() },
      { id: 'r10', type: 'prayer', group: 'soul', title: '동생이 다시 교회에 나오기를',
        body: '오래 기다리고 있습니다.', day: dayOffset(60),
        hearts: { give: '재촉하지 않는 마음', receive: '동생과의 편한 대화', praise: '끝까지 기다렸구나' } },
      { id: 'r11', type: 'prayer', group: 'health', title: '어머니 허리가 회복되기를',
        body: '', day: dayOffset(40),
        hearts: { give: '자주 찾아뵙는 마음', receive: '어머니의 편한 밤', praise: '곁에 있어줬구나' } },
      { id: 'r12', type: 'prayer', group: 'finance', title: '이번 달 생활비',
        body: '', day: dayOffset(8),
        hearts: { give: '염려 대신 맡기는 마음', receive: '이번 달을 넘길 힘', praise: '흔들려도 맡겼구나' } },
      { id: 'r13', type: 'prayer', group: 'church', title: '주일학교 아이들',
        body: '', day: dayOffset(18),
        hearts: { give: '준비하는 시간', receive: '아이들과 통하는 한마디', praise: '작은 자리를 지켰구나' } },
      { id: 'r14', type: 'script', occasion: '주일예배 대표기도', title: '8월 마지막 주 주일예배 대표기도',
        body: '사랑의 하나님, 한 주간도 저희를 지켜주셔서 감사합니다.\n\n각자의 자리에서 애쓰다 온 마음들을 아시오니, 오늘 이 시간만큼은 내려놓고 주님 앞에 앉게 하여 주옵소서.\n\n지난 한 주 마음이 무거웠던 이들, 병상에 있는 이들, 오늘 이 자리에 오지 못한 이들을 기억하여 주옵소서.\n\n예수님의 이름으로 기도드립니다. 아멘.',
        day: dayOffset(11) },
      { id: 'r15', type: 'script', occasion: '가정예배', title: '어머니 생신 가정예배 기도',
        body: '하나님, 어머니에게 허락하신 세월을 감사합니다.\n\n지나온 날들 속에 하나님이 함께하셨음을 저희가 압니다.\n\n남은 날에도 건강 주시고, 저희가 그 곁을 잘 지키게 하여 주옵소서.',
        day: dayOffset(3) },
    ];
    store.nextId = 20;
  }

  /* --------------------------------------------------------------- routing */

  var screens = {};
  function el(id) { return document.getElementById(id); }

  var TAB_SCREENS = ['journey', 'prayer', 'promise', 'repentance', 'confession'];

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
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (n) {
      n.classList.toggle('is-active', n.id === 'screen-' + current.screen);
    });

    // The comments screen has its own input pinned to the bottom.
    var hideNav = current.screen === 'intro' || current.screen === 'comments';
    el('nav').style.display = hideNav ? 'none' : 'grid';

    Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (n) {
      var owner = current.screen.split('-')[0];
      if (n.dataset.tab === current.screen || n.dataset.tab === owner) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });

    renderContext();
    if (screens[current.screen]) screens[current.screen](current.ctx || {});

    var sc = document.querySelector('#screen-' + current.screen + ' .scroll');
    if (sc) sc.scrollTop = 0;
  }

  function renderContext() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-context]'), function (n) {
      var ctx = current.ctx;
      if (!ctx || !ctx.label) { n.style.display = 'none'; return; }
      n.style.display = 'flex';
      n.innerHTML = '<span class="context__label">' + ctx.label + '</span>' +
        '<span class="context__value">' + (ctx.value || '') + '</span>';
    });
  }

  function returnBlock(ctx) {
    if (!ctx || !ctx.returnTo) return '';
    return '<button class="cta cta--ghost" data-return="' + ctx.returnTo + '"' +
      (ctx.returnId ? ' data-return-id="' + ctx.returnId + '"' : '') + '>' +
      (ctx.returnLabel || '돌아가기') + '</button>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-return]') : null;
    if (!b) return;
    if (b.dataset.return === 'promise-detail' && b.dataset.returnId) nav('promise-detail', { promiseId: b.dataset.returnId });
    else nav(b.dataset.return);
  });

  /* ----------------------------------------------------------------- toast */

  var toastTimer = null;

  function markerToast(label) {
    var t = el('toast');
    el('toast-text').textContent = '여정에 ' + label + ' 기록이 남았어요';
    t.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-shown'); }, 4200);
  }

  el('toast-go').addEventListener('click', function () {
    el('toast').classList.remove('is-shown');
    nav('journey');
  });

  /* ------------------------------------------------------------ coach marks */

  var COACH = [
    { target: '#tour-life', title: '지나온 시간이 한눈에', body: '인생 그래프예요. 좌우로 밀면 지난 시간이 이어집니다. 점을 누르면 그날의 생각이 나옵니다.' },
    { target: '.nav__item[data-tab="prayer"]', title: '기도는 제목별로 묶여요', body: '가족, 재정, 영혼을 위한 중보처럼 묶음을 만들고 그 안에 제목을 쌓아둡니다. 응답 여부를 기록하거나 점수를 매기지 않습니다.' },
    { target: '.nav__item[data-tab="promise"]', title: '기도가 약속으로', body: '기도하다 마음에 남은 결단을 약속으로 적습니다. 오늘 할 수 있는 실행은 그 약속 안에 쌓입니다.' },
    { target: '.nav__item[data-tab="repentance"]', title: '오늘 일도, 오래된 기억도', body: '실행이 계획과 달랐을 때뿐 아니라, 마음에 오래 남은 일도 직접 꺼내어 기록할 수 있습니다.' },
    { target: '.nav__item[data-tab="confession"]', title: '원하는 만큼만 나눠요', body: '다른 분들의 이야기를 읽고, 내 기록 중 고른 부분만 나눌 수 있습니다. 이름은 가릴 수 있고, 누가 더 많이 공감받았는지로 줄 세우지 않습니다.' },
    { target: '.nav__item[data-tab="journey"]', title: '모든 기록은 여정에 남아요', body: '기도·약속·실행·회개·고백이 각각 흩어지지 않고, 여정에 하나의 점으로 모입니다.' },
    { target: null, title: '기도 한 줄부터 시작해볼까요?', body: '지금 마음에 있는 것을 한 문장만 남겨도 여정의 첫 점이 됩니다.', cta: '기도 남기러 가기' },
  ];

  var coachIndex = 0;

  function positionCoach() {
    var step = COACH[coachIndex];
    var ring = el('coach-ring');
    var card = el('coach-card');
    var dRect = document.querySelector('.device').getBoundingClientRect();
    var vh = window.innerHeight;

    if (!step.target) {
      ring.style.display = 'none';
      card.style.top = '';
      card.style.bottom = '110px';
      return;
    }

    var node = document.querySelector(step.target);
    if (!node) { ring.style.display = 'none'; return; }

    var r = node.getBoundingClientRect();
    var pad = 6;

    // The overlay is viewport-fixed, so vertical values are viewport-relative
    // and horizontal ones are measured from the device's left edge.
    ring.style.display = 'block';
    ring.style.left = (r.left - dRect.left - pad) + 'px';
    ring.style.top = (r.top - pad) + 'px';
    ring.style.width = (r.width + pad * 2) + 'px';
    ring.style.height = (r.height + pad * 2) + 'px';

    // Measure the card before choosing a side — a tall target (the life curve)
    // leaves too little room above, and placing it there clipped the card off
    // the top of the screen.
    card.style.top = '0px';
    card.style.bottom = '';
    var cardH = card.offsetHeight;
    var gap = 18;
    var safeTop = 44; // below the prototype bar
    var safeBottom = 12;

    var roomBelow = vh - r.bottom - gap - safeBottom;
    var roomAbove = r.top - gap - safeTop;

    if (roomBelow >= cardH) {
      card.style.top = (r.bottom + gap) + 'px';
      card.style.bottom = '';
    } else if (roomAbove >= cardH) {
      card.style.top = '';
      card.style.bottom = (vh - r.top + gap) + 'px';
    } else {
      // Neither side fits: pin it to the bottom above the tab bar.
      card.style.top = '';
      card.style.bottom = '84px';
    }
  }

  function renderCoach() {
    var step = COACH[coachIndex];

    // Bring an in-page target into view before measuring it. Nav targets are
    // fixed, so they never need this.
    if (step.target && step.target.indexOf('.nav__item') !== 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    el('coach-step').textContent = '사용법 ' + (coachIndex + 1) + ' / ' + COACH.length;
    el('coach-title').textContent = step.title;
    el('coach-body').textContent = step.body;
    el('coach-next').textContent = step.cta || (coachIndex === COACH.length - 1 ? '시작하기' : '다음');
    el('coach-dots').innerHTML = COACH.map(function (_, i) {
      return '<i class="' + (i === coachIndex ? 'is-on' : '') + '"></i>';
    }).join('');
    positionCoach();
  }

  function openCoach() {
    coachIndex = 0;
    el('coach').classList.add('is-open');
    renderCoach();
  }

  function closeCoach() { el('coach').classList.remove('is-open'); }

  el('coach-next').addEventListener('click', function () {
    if (coachIndex < COACH.length - 1) { coachIndex++; renderCoach(); return; }
    closeCoach();
    nav('prayer');
  });

  el('coach-skip').addEventListener('click', closeCoach);
  // The tour is replayed from the menu sheet now that the app bar is the brand bar.
  window.addEventListener('resize', function () {
    if (el('coach').classList.contains('is-open')) positionCoach();
  });

  /* ---------------------------------------------------------- record curve */

  function renderCurve(target, records, days) {
    var lanes = ['prayer', 'script', 'promise', 'action', 'repentance', 'confession'];
    var W = 330, H = 146, padL = 40, padR = 8, padT = 8, padB = 18;
    var innerW = W - padL - padR;
    var laneH = (H - padT - padB) / lanes.length;
    var today = new Date();

    function xFor(iso) {
      var d = new Date(iso + 'T00:00:00');
      var diff = Math.round((today - d) / 86400000);
      return padL + (1 - Math.min(diff, days) / days) * innerW;
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
      var x = xFor(r.day);
      if (x < padL) return;
      var y = padT + laneH * i + laneH / 2;
      svg.push('<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="4.5" fill="' + KINDS[r.type].color + '" />');
    });

    svg.push('<text class="curve__axis" x="' + padL + '" y="' + (H - 3) + '">' + days + '일 전</text>');
    svg.push('<text class="curve__axis" x="' + (W - padR) + '" y="' + (H - 3) + '" text-anchor="end">오늘</text>');
    svg.push('</svg>');
    target.innerHTML = svg.join('');
  }

  function legendHtml() {
    return Object.keys(KINDS).map(function (k) {
      return '<span><i style="background:' + KINDS[k].color + '"></i>' + KINDS[k].label + '</span>';
    }).join('');
  }

  /* ------------------------------------------------------------ life curve */

  /**
   * Four tracks the user marks themselves. `mood` is the event line; the other
   * three are optional overlays. None of them is computed or scored by the app —
   * 신앙 included. There is no numeric axis anywhere.
   */
  var TRACKS = [
    { key: 'mood', label: '사건', color: '#6D4AFF', main: true },
    { key: 'emotion', label: '감정', color: '#E8833A' },
    { key: 'faith', label: '신앙', color: '#2E9E6B' },
    { key: 'finance', label: '재정', color: '#3E9BD6' },
  ];

  var activeTracks = { mood: true, emotion: false, faith: false, finance: false };

  var SCALE = [
    { v: -2, label: '많이 힘들었어요' },
    { v: -1, label: '힘들었어요' },
    { v: 0, label: '보통이었어요' },
    { v: 1, label: '좋았어요' },
    { v: 2, label: '많이 좋았어요' },
  ];

  var LIFE_EVENTS = [
    { age: 7, era: '유년기', title: '초등학교 입학', mood: 1, emotion: 1, faith: 0, finance: 0,
      thought: '학교 가는 길이 멀어서 아침마다 뛰었어요. 엄마가 교문 앞까지 데려다주던 날이 아직 생각납니다.',
      reflection: '그때는 몰랐는데, 누군가 늘 데려다주고 있었다는 게 지금 보면 참 고맙습니다.' },
    { age: 12, era: '유년기', title: '아버지 사업이 어려워짐', mood: -2, emotion: -2, faith: -1, finance: -2,
      thought: '집 안 공기가 갑자기 달라졌어요. 어른들이 밤늦게까지 이야기하는 소리를 이불 속에서 들었습니다.',
      reflection: '그 시기를 지나며 걱정이 많은 사람이 된 것 같아요. 지금도 미리 불안해하는 버릇이 남아 있습니다.' },
    { age: 16, era: '청소년기', title: '수련회에서 처음 울며 기도함', mood: 2, emotion: 2, faith: 2, finance: -1,
      thought: '왜 우는지도 모르고 한참 울었습니다. 그날 처음으로 하나님이 계시는구나 싶었어요.',
      reflection: '지금까지 붙잡고 있는 기억입니다. 힘들 때마다 그날로 돌아가 봅니다.' },
    { age: 19, era: '대학·청년', title: '대학 입학, 집을 떠남', mood: 2, emotion: 1, faith: 0, finance: -1,
      thought: '처음으로 혼자 사는 방이 생겼습니다. 자유로우면서도 밤에는 무서웠어요.',
      reflection: '혼자 있는 시간을 견디는 법을 그때 조금 배웠던 것 같습니다.' },
    { age: 22, era: '대학·청년', title: '어머니 투병', mood: -2, emotion: -2, faith: -2, finance: -1,
      thought: '병원과 학교를 오갔습니다. 기도가 잘 안 나왔어요.',
      reflection: '그때 하나님께 화가 났었다는 걸 한참 뒤에야 인정했습니다.' },
    { age: 25, era: '대학·청년', title: '첫 직장', mood: 1, emotion: 1, faith: -1, finance: 1,
      thought: '첫 월급으로 어머니 내복을 샀습니다. 별것 아닌데 뿌듯했어요.',
      reflection: '일에 파묻혀 지내면서 교회와는 조금 멀어졌던 시기이기도 합니다.' },
    { age: 28, era: '결혼', title: '결혼', mood: 2, emotion: 2, faith: 1, finance: 1,
      thought: '앞으로는 혼자가 아니라는 게 가장 좋았습니다.',
      reflection: '그때의 마음이 잘못된 건 아니었어요. 지금도 그날은 좋은 날로 남아 있습니다.' },
    { age: 30, era: '결혼', title: '첫 아이', mood: 2, emotion: 2, faith: 1, finance: 0,
      thought: '작은 손이 제 손가락을 쥐던 순간을 잊지 못합니다.',
      reflection: '이 아이 때문에 버틴 날이 정말 많습니다.' },
    { age: 34, era: '결혼', title: '오래 다투던 시기', mood: -2, emotion: -2, faith: -1, finance: 0,
      thought: '같은 이야기를 반복했습니다. 서로 지쳐가는 게 보였어요.',
      reflection: '그 시기에 아이에게 큰 소리를 냈던 일들이 지금도 마음에 남아 있습니다.' },
    { age: 36, era: '이후', title: '이혼', mood: -2, emotion: -2, faith: -2, finance: -2,
      thought: '제 인생이 여기서 끝난 것 같았습니다. 한동안 아무에게도 말하지 못했어요.',
      reflection: '오래 지나서야 이 일을 하나님 앞에 꺼내놓을 수 있었습니다. 아직 다 정리되지는 않았습니다.' },
    { age: 38, era: '이후', title: '다시 교회에 나가기 시작함', mood: 0, emotion: 0, faith: 1, finance: -1,
      thought: '맨 뒷자리에 앉았다가 축도 전에 나왔습니다. 그래도 매주 갔어요.',
      reflection: '돌아간 게 아니라 돌아가는 중이었다고 지금은 생각합니다.' },
    { age: 39, era: '이후', title: '아이와 둘의 일상이 자리잡음', mood: 1, emotion: 1, faith: 1, finance: 0,
      thought: '저녁마다 같이 밥을 먹고 하루를 이야기합니다.',
      reflection: '화려하지 않아도 이런 하루가 얼마나 귀한지 이제 압니다.' },
    { age: 40, era: '이후', title: '지금', mood: 1, emotion: 1, faith: 1, finance: 0,
      thought: '조급한 마음이 아직 있지만, 예전보다는 덜합니다.',
      reflection: '오늘부터 남기는 기록이 다음 점이 됩니다.' },
  ];

  var selectedEvent = null;

  function renderLifeCurve(scrollHost, listHost, detailHost, events) {
    var STEP = 152, padL = 36, padR = 36, H = 300;
    var W = padL + padR + STEP * (events.length - 1);
    var baseY = 152, amp = 38;

    function yFor(m) { return baseY - (m || 0) * amp; }
    function xFor(i) { return padL + STEP * i; }

    function pathFor(key) {
      var pts = events.map(function (e, i) { return [xFor(i), yFor(e[key])]; });
      var d = 'M ' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var p0 = pts[i - 1], p1 = pts[i];
        d += ' C ' + (p0[0] + STEP / 2) + ' ' + p0[1] + ', ' + (p1[0] - STEP / 2) + ' ' + p1[1] +
          ', ' + p1[0] + ' ' + p1[1];
      }
      return { d: d, pts: pts };
    }

    var svg = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="지나온 시간의 그래프">'];

    var eras = [];
    events.forEach(function (e, i) {
      var last = eras[eras.length - 1];
      if (last && last.era === e.era) last.to = i;
      else eras.push({ era: e.era, from: i, to: i });
    });

    eras.forEach(function (band, bi) {
      if (bi % 2 === 0) {
        var x0 = Math.max(0, xFor(band.from) - STEP / 2);
        var x1 = xFor(band.to) + STEP / 2;
        svg.push('<rect class="lc-era-band" x="' + x0 + '" y="0" width="' + (x1 - x0) + '" height="' + (H - 44) + '" />');
      }
      var cx = (xFor(band.from) + xFor(band.to)) / 2;
      svg.push('<text class="lc-era" x="' + cx + '" y="16" text-anchor="middle">' + band.era + '</text>');
    });

    svg.push('<line class="lc-base" x1="0" y1="' + baseY + '" x2="' + W + '" y2="' + baseY + '" />');

    // Overlay tracks first so the event line stays on top.
    TRACKS.filter(function (t) { return !t.main && activeTracks[t.key]; }).forEach(function (t) {
      var p = pathFor(t.key);
      svg.push('<path class="lc-track-line" d="' + p.d + '" stroke="' + t.color + '" />');
      p.pts.forEach(function (pt) {
        svg.push('<circle class="lc-track-dot" cx="' + pt[0] + '" cy="' + pt[1] + '" r="4.5" fill="' + t.color + '" />');
      });
    });

    var main = pathFor('mood');
    if (activeTracks.mood) {
      svg.push('<path class="lc-area" d="' + main.d + ' L ' + main.pts[main.pts.length - 1][0] + ' ' +
        (H - 44) + ' L ' + main.pts[0][0] + ' ' + (H - 44) + ' Z" />');
      svg.push('<path class="lc-line" d="' + main.d + '" />');
    }

    var lastX = xFor(events.length - 1);
    svg.push('<line class="lc-now" x1="' + lastX + '" y1="24" x2="' + lastX + '" y2="' + (H - 44) + '" />');

    events.forEach(function (e, idx) {
      var x = xFor(idx), y = yFor(e.mood);
      var on = selectedEvent === idx;
      // Generous invisible hit area so the point is easy to tap.
      svg.push('<circle cx="' + x + '" cy="' + y + '" r="22" fill="transparent" data-ev="' + idx + '" />');
      svg.push('<circle class="lc-dot' + (on ? ' lc-dot--on' : '') + '" cx="' + x + '" cy="' + y +
        '" r="' + (on ? 9 : 7) + '" data-ev="' + idx + '" />');
      var stagger = idx % 2 === 0 ? 0 : (e.mood >= 0 ? -16 : 16);
      var labelY = (e.mood >= 0 ? y - 19 : y + 28) + stagger;
      var short = e.title.length > 10 ? e.title.slice(0, 9) + '…' : e.title;
      svg.push('<text class="lc-label' + (on ? ' lc-label--on' : '') + '" x="' + x + '" y="' + labelY +
        '" text-anchor="middle" data-ev="' + idx + '">' + short + '</text>');
      svg.push('<text class="lc-tick" x="' + x + '" y="' + (H - 22) + '" text-anchor="middle">' + e.age + '세</text>');
    });

    svg.push('</svg>');
    scrollHost.innerHTML = svg.join('');

    el('j-tracks').innerHTML = TRACKS.map(function (t) {
      return '<button class="track" type="button" data-track="' + t.key + '" aria-pressed="' +
        !!activeTracks[t.key] + '" style="color:' + (activeTracks[t.key] ? t.color : '') + '">' +
        '<i style="background:' + t.color + '"></i>' + t.label + '</button>';
    }).join('');

    listHost.innerHTML = events.map(function (e, idx) {
      return '<button class="life-item" type="button" data-ev="' + idx + '" aria-expanded="' + (selectedEvent === idx) + '">' +
        '<span class="life-item__age">' + e.age + '세</span>' +
        '<span><span class="life-item__title">' + e.title + '</span><br>' +
        '<span class="life-item__era">' + e.era + '</span></span></button>';
    }).join('');

    detailHost.innerHTML = '';
  }

  /** Tapping a point or a list row opens that moment for reading and writing. */
  document.addEventListener('click', function (e) {
    var hit = e.target.closest ? e.target.closest('[data-ev]') : null;
    if (hit) { nav('life-event', { eventIndex: Number(hit.dataset.ev) }); return; }

    var t = e.target.closest ? e.target.closest('[data-track]') : null;
    if (!t) return;
    var key = t.dataset.track;
    activeTracks[key] = !activeTracks[key];
    var host = el('j-life-scroll');
    var keep = host.scrollLeft;
    renderLifeCurve(host, el('j-life-list'), el('j-life-detail'), LIFE_EVENTS);
    host.scrollLeft = keep;
  });

  /* Life event — read and record */

  screens['life-event'] = function (ctx) {
    var idx = ctx.eventIndex;
    var e = LIFE_EVENTS[idx];
    if (!e) { nav('journey'); return; }

    selectedEvent = idx;
    el('le-when').textContent = e.age + '세 · ' + e.era;
    el('le-title').textContent = e.title;
    el('le-thought').value = e.thought || '';
    el('le-reflection').value = e.reflection || '';

    el('le-scales').innerHTML = TRACKS.map(function (t) {
      return '<div class="card" style="margin-bottom:12px">' +
        '<p class="heart__label" style="color:' + t.color + '">' + t.label +
        (t.main ? ' <span class="note">(그래프의 기본 선)</span>' : '') + '</p>' +
        '<div class="scale" style="margin-top:10px">' +
        SCALE.map(function (s) {
          return '<button class="scale__opt" type="button" data-scale="' + t.key + '" data-val="' + s.v +
            '" aria-pressed="' + (Number(e[t.key] || 0) === s.v) + '">' + s.label + '</button>';
        }).join('') + '</div></div>';
    }).join('');

    el('le-voice').innerHTML = voiceBlock();
    el('le-privacy').innerHTML = privacyBlock(
      '인생 그래프에 남긴 내용도 마찬가지입니다.',
    );
  };

  el('le-scales').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-scale]');
    if (!b) return;
    var e = LIFE_EVENTS[current.ctx.eventIndex];
    e[b.dataset.scale] = Number(b.dataset.val);
    Array.prototype.forEach.call(el('le-scales').querySelectorAll('[data-scale="' + b.dataset.scale + '"]'), function (n) {
      n.setAttribute('aria-pressed', String(n === b));
    });
  });

  el('le-save').addEventListener('click', function () {
    var e = LIFE_EVENTS[current.ctx.eventIndex];
    e.thought = el('le-thought').value.trim();
    e.reflection = el('le-reflection').value.trim();
    markerToast('인생 그래프');
    nav('journey');
  });

  /* ------------------------------------------- shared blocks (voice/privacy) */

  /**
   * Voice memo. This prototype only shows how it would work — nothing is
   * recorded. The cap is under a minute so a memo stays a note, not a sermon.
   */
  function voiceBlock() {
    return '<div class="voice">' +
      '<div class="voice__row">' +
      '<span class="voice__btn" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg></span>' +
      '<span><span class="voice__label">음성으로 남기기</span>' +
      '<span class="voice__limit">최대 1분 · 짧게 한 마디면 충분합니다</span></span></div>' +
      '<ul class="voice__guide">' +
      '<li>버튼을 누르면 녹음이 시작되고, 다시 누르면 멈춥니다.</li>' +
      '<li>1분이 되면 자동으로 멈춥니다.</li>' +
      '<li>녹음은 글과 함께 이 기록에 붙어 저장됩니다.</li>' +
      '<li>저장 전에 다시 듣고 지울 수 있습니다.</li>' +
      '</ul></div>';
  }

  /**
   * Privacy notice. Matches the permission boundary: a private record is the
   * owner's alone — operators and moderators included.
   */
  function privacyBlock(extra) {
    return '<div class="privacy-note">' +
      '<span class="privacy-note__icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>' +
      '<span><span class="privacy-note__title">이 기록은 나만 볼 수 있습니다</span>' +
      '<span class="privacy-note__body">' +
      '앱 운영진을 포함해 다른 어떤 사람도 이 내용을 볼 수 없습니다. ' +
      (extra || '내가 직접 나누기를 선택한 부분만 다른 분들에게 보입니다.') +
      '</span></span></div>';
  }

  /* ------------------------------------------------- promise daily checks */

  /**
   * Marking the days a promise was kept.
   *
   * Deliberately not a streak and not a rate: a kept day is a filled dot, a day
   * without one is simply empty — never a cross, never red, never counted
   * against the user. Missing a day is not recorded as fault.
   */
  var CHECK_DAYS = 7;
  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  function checkDayList(count) {
    var days = [];
    for (var i = 0; i < count; i++) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        iso: dayOffset(i),
        dom: d.getDate(),
        wd: WEEKDAYS[d.getDay()],
        isToday: i === 0,
      });
    }
    return days; // newest first
  }

  /**
   * A promise may need doing more than once a day (2–10). `checks[iso]` holds
   * either `true` (single) or a count, and the cell fills only when the day's
   * target is reached.
   */
  function targetOf(p) { return Math.max(1, Number(p.dailyTarget) || 1); }

  function countOf(p, iso) {
    var v = p.checks && p.checks[iso];
    if (v === true) return 1;
    return Number(v) || 0;
  }

  function isChecked(promise, iso) {
    return countOf(promise, iso) >= targetOf(promise);
  }

  /** Groups are the user's own filing, never a status. */
  var PROMISE_GROUPS = [
    { id: 'daily', label: '매일' },
    { id: 'weekly', label: '주간' },
    { id: 'season', label: '기간' },
    { id: 'people', label: '사람과의 약속' },
  ];

  function groupLabel(id) {
    var g = PROMISE_GROUPS.filter(function (x) { return x.id === id; })[0];
    return g ? g.label : '매일';
  }

  /**
   * Keep-table: one row per promise, one column per day, newest column first.
   * The name column is fixed and only the days scroll, so the table still works
   * when there are tens of promises.
   */
  var TABLE_DAYS = 30;
  var HOME_DAYS = 3; // 오늘 · 어제 · 그제

  function renderKeepTable(host, promises, dayCount, wideNames) {
    if (!promises.length) {
      host.innerHTML = '<div class="empty"><p class="empty__title">여기에는 약속이 없습니다.</p>' +
        '<p class="empty__body">기도에서 마음에 남은 것이 있다면 한 줄로 적어보세요.</p></div>';
      return;
    }

    var days = checkDayList(dayCount);

    var names = '<div class="ptable__head">하나님과 나의 약속</div>' +
      promises.map(function (p) {
        var t = targetOf(p);
        return '<button class="ptable__name" type="button" data-open-promise="' + p.id + '">' +
          '<span class="ptable__name-title">' + p.title + '</span>' +
          '<span class="ptable__name-meta">' + groupLabel(p.group) +
          (t > 1 ? ' · 하루 ' + t + '번' : '') +
          (p.status === 'closed' ? ' · 마무리됨' : '') +
          '</span></button>';
      }).join('');

    var headRow = '<div class="ptable__row ptable__row--head">' +
      days.map(function (d) {
        return '<span class="pcell pcell--head' + (d.isToday ? ' pcell--today' : '') + '">' +
          '<b>' + (d.isToday ? '오늘' : d.dom) + '</b><span>' + d.wd + '</span></span>';
      }).join('') + '</div>';

    var rows = promises.map(function (p) {
      var closed = p.status === 'closed';
      var t = targetOf(p);
      return '<div class="ptable__row">' +
        days.map(function (d) {
          var n = countOf(p, d.iso);
          var done = n >= t;
          var partial = n > 0 && !done;
          return '<button class="pcell' + (d.isToday ? ' pcell--todaycol' : '') +
            (partial ? ' pcell--partial' : '') + (closed ? ' pcell--closed' : '') + '" type="button"' +
            (closed ? ' disabled' : ' data-check="' + p.id + '" data-day="' + d.iso + '"') +
            ' aria-pressed="' + done + '" aria-label="' + p.title + ' ' + d.dom + '일' +
            (t > 1 ? ' ' + n + '/' + t : '') + '">' +
            '<span class="pcell__dot">' +
            (t > 1 && !done
              ? '<span class="pcell__count">' + (n || '') + '</span>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>') +
            '</span></button>';
        }).join('') + '</div>';
    }).join('');

    host.innerHTML = '<div class="ptable' + (wideNames ? '' : ' ptable--all') + '">' +
      '<div class="ptable__names">' + names + '</div>' +
      '<div class="ptable__scroll"><div class="ptable__grid">' + headRow + rows + '</div></div></div>';
  }

  function checkStripHtml(promise, count, wide) {
    var days = checkDayList(count);
    return '<div class="checks' + (wide ? ' checks--wide' : '') + '">' +
      (wide ? '' : '<span class="checks__label">지킨 날<br>표시</span>') +
      '<div class="checks__strip">' +
      days.map(function (d) {
        return '<button class="checkday' + (d.isToday ? ' checkday--today' : '') + '" type="button"' +
          ' data-check="' + promise.id + '" data-day="' + d.iso + '"' +
          ' aria-pressed="' + isChecked(promise, d.iso) + '"' +
          ' aria-label="' + d.dom + '일 ' + (d.isToday ? '오늘 ' : '') + '표시">' +
          '<span class="checkday__d">' + (d.isToday ? '오늘' : d.wd) + '</span>' +
          '<span class="checkday__dot">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>' +
          '</span></button>';
      }).join('') +
      '</div></div>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-check]');
    if (!b) return;
    var p = findById(b.dataset.check);
    if (!p) return;
    if (!p.checks) p.checks = {};

    var iso = b.dataset.day;
    var t = targetOf(p);
    var n = countOf(p, iso);

    if (t === 1) {
      if (n) delete p.checks[iso];
      else p.checks[iso] = true;
    } else {
      // Count up to the day's target, then the next tap clears it.
      var next = n + 1;
      if (next > t) delete p.checks[iso];
      else p.checks[iso] = next;
    }

    if (current.screen === 'promise-detail') screens['promise-detail'](current.ctx || {});
    else if (current.screen === 'keep-all') screens['keep-all'](current.ctx || {});
    else screens.promise(current.ctx || {});
  });

  /* ------------------------------------------------------------- samples */

  /** Shown so a blank page is never the first thing a user meets. */
  var SAMPLES = {
    prayer: {
      title: '이렇게 적는 분들이 많아요',
      items: [
        ['조급한 마음을 내려놓게 해주세요', '한 문장이면 충분합니다'],
        ['동생이 다시 교회에 나오기를', '오래 붙잡는 제목도 괜찮아요'],
        ['이번 달 생활비가 채워지기를', '현실적인 필요도 기도가 됩니다'],
      ],
      cta: '내 기도도 적어볼까요?',
    },
    script: {
      title: '이런 자리에 씁니다',
      items: [
        ['9월 첫 주 주일예배 대표기도', '앞에서 드릴 기도를 미리 정리'],
        ['수요 소모임 기도회 인도', '함께 기도할 순서를 적어둠'],
        ['어머니 생신 가정예배 기도', '가족 앞에서 드릴 기도'],
      ],
      cta: '내 기도문도 써볼까요?',
    },
    promise: {
      title: '이런 약속들이 있어요',
      items: [
        ['매일 아침 10분 먼저 기도하기', '작을수록 오래 갑니다'],
        ['한 주에 한 번 안부 전하기', '사람과의 약속도 좋습니다'],
        ['화가 날 때 한 박자 쉬고 말하기', '태도에 대한 약속도 됩니다'],
      ],
      cta: '내 약속도 적어볼까요?',
    },
    repentance: {
      title: '이런 것들을 적습니다',
      items: [
        ['지친다는 이유로 아이에게 큰 소리를 낸 일', '오늘 있었던 일'],
        ['오래전 친구에게 했던 말이 계속 남아 있는 것', '지난 기억도 됩니다'],
        ['교회에서 사람을 겉으로만 대했던 태도', '드러나지 않은 마음도'],
      ],
      cta: '내 이야기도 적어볼까요?',
    },
  };

  function renderSamples(host, key, onCta) {
    var s = SAMPLES[key];
    if (!host || !s) return;
    host.innerHTML =
      '<div class="sample__head"><span class="sample__title">' + s.title + '</span>' +
      '<span class="sample__hint">예시</span></div>' +
      '<div class="sample__list">' +
      s.items.map(function (it) {
        return '<div class="sample__item"><p class="sample__text">' + it[0] + '</p>' +
          '<p class="sample__meta">' + it[1] + '</p></div>';
      }).join('') +
      '</div>' +
      '<div class="sample__cta"><button class="cta cta--soft" data-sample-cta="' + key + '">' + s.cta + '</button></div>';
    if (onCta) host.querySelector('[data-sample-cta]').addEventListener('click', onCta);
  }

  /* --------------------------------------------------------------- screens */

  screens.intro = function () {};

  el('intro-start').addEventListener('click', function () {
    seedData();
    nav('journey', null, { replace: true });
    setTimeout(openCoach, 220);
  });

  /* Journey */
  var journeyRange = 'week';
  var RANGE_DAYS = { today: 1, week: 7, month: 30, year: 365, all: 365 };

  screens.journey = function () {
    var d = new Date();
    el('j-date').textContent = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';

    var days = RANGE_DAYS[journeyRange];
    Array.prototype.forEach.call(document.querySelectorAll('#j-ranges .chip'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.range === journeyRange));
    });

    var host = el('j-life-scroll');
    var first = !host.firstChild;
    renderLifeCurve(host, el('j-life-list'), el('j-life-detail'), LIFE_EVENTS);
    if (first) host.scrollLeft = host.scrollWidth;

    renderToday();
    renderCurve(el('j-curve'), store.records, days);
    el('j-legend').innerHTML = legendHtml();

    var cutoff = dayOffset(days - 1);
    var recent = store.records.filter(function (r) { return r.day >= cutoff; })
      .sort(function (a, b) { return a.day < b.day ? 1 : -1; });

    el('j-recent').innerHTML = recent.length
      ? '<div class="rows">' + recent.map(function (r) {
          return '<div class="row"><span class="row__date">' + prettyDay(r.day) + '</span>' +
            '<span class="row__text"><span class="row__kind">' + KINDS[r.type].label + '</span>' + r.title + '</span></div>';
        }).join('') + '</div>'
      : '<div class="empty"><p class="empty__title">이 기간에는 기록이 없습니다.</p>' +
        '<p class="empty__body">기록이 없는 날은 여정에 점으로 남지 않습니다.</p></div>';

    el('j-caption').textContent = '기록이 있는 날에만 점이 남습니다. 비어 있는 날은 표시되지 않아요.';

    el('j-tp').innerHTML = '<div class="card"><div class="card__top"><div>' +
      '<p class="card__title">이 시기를 터닝포인트로 표시할까요?</p>' +
      '<p class="card__meta" style="margin-top:4px">' + prettyDay(dayOffset(5)) + ' 전후 · 표시하면 인생 그래프에 큰 점으로 남습니다</p>' +
      '</div></div><div class="card__actions">' +
      '<button class="card__action card__action--primary">표시하기</button>' +
      '<button class="card__action">나중에</button></div></div>';
  };

  Array.prototype.forEach.call(document.querySelectorAll('#j-ranges .chip'), function (c) {
    c.addEventListener('click', function () { journeyRange = c.dataset.range; screens.journey(); });
  });

  /**
   * Today prompts — the three onboarding questions moved here. They are an
   * invitation on the home screen, not a gate in front of it, and a prompt
   * already answered today is shown as done rather than nagging.
   */
  var TODAY_PROMPTS = [
    { kind: 'prayer', icon: '🙏', q: '오늘 하나님께 드리고 싶은 기도가 있나요?', hint: '짧게 한 문장이어도 좋습니다' },
    { kind: 'promise', icon: '🤝', q: '마음에 남아 있는 약속이나 결단이 있나요?', hint: '지키지 못해도 괜찮습니다' },
    { kind: 'action', icon: '🌿', q: '오늘 실천하고 싶은 한 가지가 있나요?', hint: '아주 작은 것이어도 좋습니다' },
  ];

  function renderToday() {
    var today = dayOffset(0);
    el('j-today').innerHTML = TODAY_PROMPTS.map(function (p) {
      var done = store.records.some(function (r) { return r.type === p.kind && r.day === today; });
      return '<button class="today' + (done ? ' today--done' : '') + '" type="button" data-today="' + p.kind + '">' +
        '<span class="today__icon">' + p.icon + '</span>' +
        '<span><span class="today__q">' + p.q + '</span>' +
        '<span class="today__hint">' + (done ? '오늘 남겼어요' : p.hint) + '</span></span>' +
        '<span class="today__arrow">›</span></button>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-today]');
    if (!t) return;
    var kind = t.dataset.today;
    if (kind === 'prayer') { nav('prayer-new', { label: '오늘', value: '기도 남기기' }); return; }
    if (kind === 'promise') { nav('promise', { label: '오늘', value: '약속 남기기', openCompose: true }); return; }
    var open = byType('promise').filter(function (p) { return p.status !== 'closed'; });
    if (open.length) nav('promise-detail', { promiseId: open[open.length - 1].id, label: '오늘', value: '실행 남기기' });
    else nav('promise', { label: '오늘', value: '실행을 담을 약속을 먼저 남겨주세요', openCompose: true });
  });

  /* First record landed */
  screens['first-saved'] = function (ctx) {
    el('fs-title').textContent = '첫 기록이 여정에 남았어요';
    el('fs-body').textContent = (ctx.label || '남긴 기록') + '이 여정의 점이 되었습니다. 앞으로 기록이 쌓이면 이곳에서 지나온 시간을 돌아볼 수 있어요.';
    renderCurve(el('fs-curve'), store.records, 14);
    el('fs-legend').innerHTML = legendHtml();
  };

  /* Prayer — groups + prayer scripts */

  /** Occasions a prayer script is written for. */
  var OCCASIONS = ['주일예배 대표기도', '소모임 기도회', '가정예배', '식사기도', '심방·병문안', '기타'];

  var prayerTab = 'titles';

  Array.prototype.forEach.call(document.querySelectorAll('#p-seg .seg__item'), function (b) {
    b.addEventListener('click', function () { prayerTab = b.dataset.ptab; screens.prayer(current.ctx || {}); });
  });

  function renderScripts() {
    var list = byType('script').slice().sort(function (a, b) { return a.day < b.day ? 1 : -1; });

    el('p-scripts').innerHTML = list.length
      ? list.map(function (s) {
          return '<button class="script" type="button" data-script="' + s.id + '">' +
            '<span class="script__body"><span class="script__occasion">' + (s.occasion || '기타') + '</span>' +
            '<span class="script__name">' + s.title + '</span>' +
            '<span class="script__excerpt">' + (s.body || '아직 본문이 없습니다') + '</span>' +
            '<span class="script__meta">' + prettyDay(s.day) + '</span></span>' +
            '<span class="script__arrow">›</span></button>';
        }).join('')
      : '<div class="empty"><p class="empty__title">아직 써둔 기도문이 없습니다.</p>' +
        '<p class="empty__body">앞에서 기도할 일이 있을 때 미리 적어두면 그대로 쌓입니다.</p></div>';

    renderSamples(el('p-script-samples'), 'script', function () { nav('script-new'); });
  }

  screens.prayer = function () {
    Array.prototype.forEach.call(document.querySelectorAll('#p-seg .seg__item'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.ptab === prayerTab));
    });
    el('p-pane-titles').style.display = prayerTab === 'titles' ? 'block' : 'none';
    el('p-pane-scripts').style.display = prayerTab === 'scripts' ? 'block' : 'none';

    if (prayerTab === 'scripts') { renderScripts(); return; }

    var all = byType('prayer');
    var weekCut = dayOffset(6);
    el('p-week').textContent = all.filter(function (r) { return r.day >= weekCut; }).length;
    el('p-total').textContent = all.length;

    var last = all.slice().sort(function (a, b) { return a.day < b.day ? 1 : -1; })[0];
    el('p-recent').innerHTML = last
      ? '최근 기도: <b>' + last.title + '</b> · ' + prettyDay(last.day)
      : '아직 남긴 기도가 없습니다. 한 문장부터 시작해도 좋습니다.';

    el('p-groups').innerHTML = PRAYER_GROUPS.map(function (g) {
      var n = all.filter(function (r) { return (r.group || 'self') === g.id; }).length;
      return '<button class="pgroup" type="button" data-group="' + g.id + '">' +
        '<span class="pgroup__icon">' + g.icon + '</span>' +
        '<span><span class="pgroup__name">' + g.name + '</span><br>' +
        '<span class="pgroup__meta">' + g.desc + '</span></span>' +
        '<span class="pgroup__count">' + n + '개 ›</span></button>';
    }).join('');

    renderSamples(el('p-samples'), 'prayer', function () { nav('prayer-new'); });
  };

  document.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('[data-group]') : null;
    if (g) nav('prayer-group', { groupId: g.dataset.group });
    var t = e.target.closest ? e.target.closest('[data-prayer]') : null;
    if (t) nav('prayer-detail', { prayerId: t.dataset.prayer });
  });

  el('p-new').addEventListener('click', function () { nav('prayer-new'); });

  /* Prayer — titles in a group */
  screens['prayer-group'] = function (ctx) {
    var g = groupById(ctx.groupId);
    el('pg-title').textContent = g.name;
    el('pg-desc').textContent = g.desc;

    var list = byType('prayer').filter(function (r) { return (r.group || 'self') === g.id; })
      .sort(function (a, b) { return a.day < b.day ? 1 : -1; });

    el('pg-list').innerHTML = list.length
      ? list.map(function (r) {
          var d = daysSince(r.day);
          return '<button class="ptitle" type="button" data-prayer="' + r.id + '">' +
            '<span class="ptitle__body"><span class="ptitle__name">' + r.title + '</span>' +
            '<span class="ptitle__meta">' + (d === 0 ? '오늘부터' : d + '일째 기도하고 있어요') + '</span></span>' +
            '<span class="ptitle__arrow">›</span></button>';
        }).join('')
      : '<div class="empty"><p class="empty__title">이 묶음에는 아직 기도가 없습니다.</p></div>';
  };

  el('pg-new').addEventListener('click', function () {
    nav('prayer-new', { presetGroup: current.ctx && current.ctx.groupId });
  });

  /* Prayer — detail */
  screens['prayer-detail'] = function (ctx) {
    var p = findById(ctx.prayerId);
    if (!p) { nav('prayer'); return; }
    var g = groupById(p.group);

    el('pd2-group').textContent = g.icon + ' ' + g.name;
    el('pd2-title').textContent = p.title;
    var d = daysSince(p.day);
    el('pd2-since').textContent = prettyDay(p.day) + '부터 · ' + (d === 0 ? '오늘' : d + '일째');
    el('pd2-body').textContent = p.body || '아직 적어둔 내용이 없습니다.';

    var hearts = p.hearts || {};
    el('pd2-hearts').innerHTML = [
      { key: 'give', label: '하나님께 드리고 싶은 마음', hint: '내가 내어드릴 수 있는 것', val: hearts.give },
      { key: 'receive', label: '하나님께 받고 싶은 마음', hint: '지금 구하고 있는 것', val: hearts.receive },
      { key: 'praise', label: '천국에서 듣고 싶은 칭찬', hint: '이 기도가 끝까지 지나간 뒤에', val: hearts.praise },
    ].map(function (h) {
      return '<div class="heart"><p class="heart__label">' + h.label + '</p>' +
        '<p class="heart__hint">' + h.hint + '</p>' +
        '<p>' + (h.val || '<span class="note">아직 적지 않았어요</span>') + '</p></div>';
    }).join('');

    el('pd2-discern').innerHTML = g.discern +
      '<br><br>내가 원하는 결과를 얻으려는 마음인지, 하나님께서 기뻐하실 일을 구하는 마음인지 — 둘 다 섞여 있어도 괜찮습니다. 모르고 지나가지만 않으면 됩니다.';

    // Living it out: promises and actions that grew from this prayer.
    var promises = byType('promise').filter(function (pr) { return pr.sourcePrayerId === p.id; });
    var actions = [];
    promises.forEach(function (pr) {
      actions = actions.concat(byType('action').filter(function (a) { return a.promiseId === pr.id; }));
    });
    var lastAction = actions.sort(function (a, b) { return a.day < b.day ? 1 : -1; })[0];

    el('pd2-living').innerHTML =
      '<div class="living__row"><span class="living__key">약속</span>' +
      '<span class="living__val">' + (promises.length ? promises[0].title : '<span class="note">아직 없습니다</span>') + '</span></div>' +
      '<div class="living__row"><span class="living__key">실행</span>' +
      '<span class="living__val">' + (actions.length ? actions.length + '회' : '<span class="note">아직 없습니다</span>') + '</span></div>' +
      '<div class="living__row"><span class="living__key">최근</span>' +
      '<span class="living__val">' + (lastAction ? prettyDay(lastAction.day) : '<span class="note">—</span>') + '</span></div>';

    el('pd2-to-promise').style.display = promises.length ? 'none' : 'flex';
  };

  el('pd2-to-promise').addEventListener('click', function () {
    var p = findById(current.ctx.prayerId);
    nav('promise', { label: '기도에서 이어짐', value: p.title, openCompose: true, sourcePrayerId: p.id });
  });

  el('pd2-pray').addEventListener('click', function () {
    var p = findById(current.ctx.prayerId);
    nav('prayer-new', { presetGroup: p.group, presetTitle: p.title, label: '이어서 기도', value: p.title });
  });

  /* Prayer — compose */
  var composeGroup = 'self';

  screens['prayer-new'] = function (ctx) {
    composeGroup = (ctx && ctx.presetGroup) || 'self';
    el('p-title-input').value = (ctx && ctx.presetTitle) || '';
    el('p-body-input').value = '';
    el('p-group-chips').innerHTML = PRAYER_GROUPS.map(function (g) {
      return '<button class="chip chip--sm" type="button" data-gsel="' + g.id + '" aria-pressed="' +
        (g.id === composeGroup) + '">' + g.icon + ' ' + g.name + '</button>';
    }).join('');
    el('pn-voice').innerHTML = voiceBlock();
    el('pn-privacy').innerHTML = privacyBlock();
  };

  /* Prayer scripts — compose and detail */

  var scriptOccasion = OCCASIONS[0];

  screens['script-new'] = function () {
    el('ps-title').value = '';
    el('ps-body').value = '';
    el('ps-voice').innerHTML = voiceBlock();
    el('ps-privacy').innerHTML =
      '<div style="margin-top:16px">' +
      privacyBlock('기도문을 다른 분들과 나누고 싶을 때는 상세 화면에서 복사하거나 직접 나누기를 선택하시면 됩니다.') +
      '</div>';
    el('ps-occasions').innerHTML = OCCASIONS.map(function (o) {
      return '<button class="chip chip--sm" type="button" data-occ="' + o + '" aria-pressed="' +
        (o === scriptOccasion) + '">' + o + '</button>';
    }).join('');
  };

  el('ps-occasions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-occ]');
    if (!b) return;
    scriptOccasion = b.dataset.occ;
    Array.prototype.forEach.call(el('ps-occasions').children, function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.occ === scriptOccasion));
    });
  });

  el('ps-save').addEventListener('click', function () {
    var title = el('ps-title').value.trim();
    var body = el('ps-body').value.trim();
    if (!title && !body) { el('ps-title').focus(); return; }
    var rec = add('script', title || scriptOccasion, body, { occasion: scriptOccasion });
    markerToast('기도문');
    prayerTab = 'scripts';
    nav('script-detail', { scriptId: rec.id });
  });

  el('p-script-new').addEventListener('click', function () { nav('script-new'); });

  document.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('[data-script]');
    if (s) nav('script-detail', { scriptId: s.dataset.script });
  });

  screens['script-detail'] = function (ctx) {
    var s = findById(ctx.scriptId);
    if (!s) { nav('prayer'); return; }
    el('psd-occasion').textContent = s.occasion || '기타';
    el('psd-title').textContent = s.title;
    el('psd-when').textContent = prettyDay(s.day) + '에 저장됨';
    el('psd-body').textContent = s.body || '아직 본문이 없습니다.';
    el('psd-copy').textContent = '기도문 복사하기';
  };

  el('psd-copy').addEventListener('click', function () {
    var s = findById(current.ctx.scriptId);
    var text = s.title + '\n\n' + (s.body || '');
    var done = function () {
      el('psd-copy').textContent = '복사했어요';
      setTimeout(function () { el('psd-copy').textContent = '기도문 복사하기'; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      done();
    }
  });

  el('psd-share').addEventListener('click', function () {
    nav('sharecopy', { recordId: current.ctx.scriptId, label: '기도문에서 이어짐', value: '고른 부분만 나눠집니다' });
  });

  el('p-group-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-gsel]');
    if (!b) return;
    composeGroup = b.dataset.gsel;
    Array.prototype.forEach.call(el('p-group-chips').children, function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.gsel === composeGroup));
    });
  });

  el('p-save').addEventListener('click', function () {
    var title = el('p-title-input').value.trim();
    var body = el('p-body-input').value.trim();
    if (!title && !body) { el('p-title-input').focus(); return; }
    var rec = add('prayer', title || body.slice(0, 24), body, { group: composeGroup, hearts: {} });
    markerToast('기도');
    nav('prayer-bridge', { prayerId: rec.id, title: rec.title });
  });

  /* Prayer → promise bridge */
  screens['prayer-bridge'] = function (ctx) { el('pb-quote').textContent = ctx.title || ''; };

  el('pb-make-promise').addEventListener('click', function () {
    nav('promise', {
      label: '기도에서 이어짐',
      value: current.ctx && current.ctx.title,
      openCompose: true,
      sourcePrayerId: current.ctx && current.ctx.prayerId,
    });
  });

  el('pb-done').addEventListener('click', function () { nav('prayer', null, { replace: true }); });

  /* Promise */
  screens.promise = function (ctx) {
    var all = byType('promise');
    var active = all.filter(function (r) { return r.status !== 'closed'; });
    el('pr-active').textContent = active.length;
    el('pr-closed').textContent = all.length - active.length;

    var last = all.slice().sort(function (a, b) { return a.day < b.day ? 1 : -1; })[0];
    if (last) {
      var acts = byType('action').filter(function (a) { return a.promiseId === last.id; });
      el('pr-recent').innerHTML = '최근 약속: <b>' + last.title + '</b>' +
        (acts.length ? ' · 최근 실행 ' + prettyDay(acts[acts.length - 1].day) : ' · 아직 실행 없음');
    } else {
      el('pr-recent').textContent = '아직 남긴 약속이 없습니다.';
    }

    el('pr-compose').style.display = ctx && ctx.openCompose ? 'block' : 'none';
    el('pr-new-input').value = '';

    renderGroupChips(el('pr-groups'), all);
    renderKeepTable(el('pr-list'), filterPromises(all), HOME_DAYS, true);

    renderSamples(el('pr-samples'), 'promise', function () {
      el('pr-compose').style.display = 'block';
      el('pr-new-input').focus();
    });
  };

  /* Group filter shared by the promise tab and the full keep table */

  var promiseFilter = 'all';

  function filterPromises(all) {
    var list = all.slice().sort(function (a, b) {
      if ((a.status === 'closed') !== (b.status === 'closed')) return a.status === 'closed' ? 1 : -1;
      return a.day < b.day ? 1 : -1;
    });
    if (promiseFilter === 'all') return list;
    if (promiseFilter === 'closed') return list.filter(function (p) { return p.status === 'closed'; });
    return list.filter(function (p) {
      return p.status !== 'closed' && (p.group || 'daily') === promiseFilter;
    });
  }

  function renderGroupChips(host, all) {
    var counts = { all: all.length, closed: 0 };
    PROMISE_GROUPS.forEach(function (g) { counts[g.id] = 0; });
    all.forEach(function (p) {
      if (p.status === 'closed') counts.closed++;
      else counts[p.group || 'daily'] = (counts[p.group || 'daily'] || 0) + 1;
    });

    var items = [{ id: 'all', label: '전체' }]
      .concat(PROMISE_GROUPS)
      .concat([{ id: 'closed', label: '지난 약속' }]);

    host.innerHTML = items.map(function (it) {
      return '<button class="chip chip--sm" type="button" data-pfilter="' + it.id + '" aria-pressed="' +
        (promiseFilter === it.id) + '">' + it.label + ' ' + (counts[it.id] || 0) + '</button>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pfilter]');
    if (!b) return;
    promiseFilter = b.dataset.pfilter;
    if (current.screen === 'keep-all') screens['keep-all'](current.ctx || {});
    else screens.promise(current.ctx || {});
  });

  el('pr-more').addEventListener('click', function () { nav('keep-all'); });

  screens['keep-all'] = function () {
    var all = byType('promise');
    renderGroupChips(el('ka-groups'), all);
    renderKeepTable(el('ka-list'), filterPromises(all), TABLE_DAYS, false);
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

  /* Promise detail */
  screens['promise-detail'] = function (ctx) {
    var p = findById(ctx.promiseId);
    if (!p) { nav('promise'); return; }
    el('pd-title').textContent = p.title;
    var acts = byType('action').filter(function (a) { return a.promiseId === p.id; });
    el('pd-meta').textContent = '실행 ' + acts.length + '회' +
      (acts.length ? ' · 최근 ' + prettyDay(acts[acts.length - 1].day) : '') +
      ' · ' + (p.status === 'closed' ? '마무리됨' : '진행 중');

    el('pd-status').innerHTML = p.status === 'closed'
      ? '<span class="badge badge--done">마무리됨</span>'
      : '<button class="badge" id="pd-close">마무리됨으로 표시</button>';

    var closeBtn = el('pd-close');
    if (closeBtn) closeBtn.addEventListener('click', function () {
      p.status = 'closed';
      screens['promise-detail']({ promiseId: p.id });
    });

    if (p.sourcePrayerId) {
      var src = findById(p.sourcePrayerId);
      if (src) {
        el('pd-meta').textContent += ' · 기도에서 시작됨';
      }
    }

    el('pd-context').value = p.context || '';
    el('pd-purpose').value = p.purpose || '';
    el('pd-due').value = p.due || '';
    el('pd-deadline').innerHTML = deadlineHtml(p);

    el('pd-group').innerHTML = PROMISE_GROUPS.map(function (g) {
      return '<button class="chip chip--sm" type="button" data-pgroup="' + g.id + '" aria-pressed="' +
        ((p.group || 'daily') === g.id) + '">' + g.label + '</button>';
    }).join('');

    el('pd-target').innerHTML = [1, 2, 3, 5, 7, 10].map(function (n) {
      return '<button class="chip chip--sm" type="button" data-ptarget="' + n + '" aria-pressed="' +
        (targetOf(p) === n) + '">' + (n === 1 ? '하루 1번' : n + '번') + '</button>';
    }).join('');

    el('pd-checks').innerHTML = p.status === 'closed'
      ? '<p class="note">마무리된 약속입니다. 지난 표시는 그대로 남아 있습니다.</p>' +
        checkStripHtml(p, 14, true)
      : '<p class="note" style="margin-bottom:12px">지킨 날을 눌러 표시해 두세요. ' +
        '표시가 없는 날을 잘못으로 기록하지 않습니다.</p>' +
        checkStripHtml(p, 14, true);

    el('pd-action-input').value = '';

    el('pd-actions').innerHTML = acts.length
      ? '<div class="rows">' + acts.slice().reverse().map(function (a) {
          return '<div class="row"><span class="row__date">' + prettyDay(a.day) + '</span>' +
            '<span class="row__text">' + a.title + '</span></div>';
        }).join('') + '</div>'
      : '<div class="empty"><p class="empty__title">아직 실행 기록이 없습니다.</p>' +
        '<p class="empty__body">실행이 없어도 약속은 그대로 유효합니다.</p></div>';

    el('pd-return').innerHTML = returnBlock(ctx);
  };

  /**
   * D-day and kept-days for promises that have a deadline.
   *
   * The ratio is days marked out of days elapsed — a count of what the user
   * ticked, not a verdict. Days still ahead of the deadline are not counted
   * against them, and nothing here is coloured as failure.
   */
  function deadlineHtml(p) {
    if (!p.due) {
      return '<p class="note">기한이 없는 약속입니다. 기간을 정하지 않아도 괜찮습니다.</p>';
    }

    var todayIso = dayOffset(0);
    var now = new Date(todayIso + 'T00:00:00');
    var due = new Date(p.due + 'T00:00:00');
    var start = new Date(p.day + 'T00:00:00');
    var left = Math.round((due - now) / 86400000);
    var dday = left > 0 ? 'D-' + left : left === 0 ? 'D-DAY' : 'D+' + -left;

    // Count only the stretch that has actually passed.
    var boundIso = left >= 0 ? todayIso : p.due;
    var bound = left >= 0 ? now : due;
    var elapsed = Math.max(1, Math.round((bound - start) / 86400000) + 1);

    var kept = Object.keys(p.checks || {}).filter(function (iso) {
      return iso >= p.day && iso <= boundIso;
    }).length;

    var pct = Math.min(100, Math.round((kept / elapsed) * 100));

    return '<div class="deadline">' +
      '<div><p class="deadline__dday">' + dday + '</p>' +
      '<p class="deadline__when">' + prettyDay(p.due) + '까지</p></div>' +
      '<div class="deadline__rate"><p class="deadline__num">' + pct + '%</p>' +
      '<p class="deadline__label">' + elapsed + '일 중 ' + kept + '일 표시</p></div>' +
      '</div>' +
      '<div class="bar"><span class="bar__fill" style="width:' + pct + '%"></span></div>' +
      '<p class="note" style="margin-top:10px">' +
      '지나온 기간 중 지켰다고 표시한 날의 수입니다. 잘하고 못하고를 재는 점수가 아니며, ' +
      '남은 날은 계산에 넣지 않습니다.</p>';
  }

  el('pd-group').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pgroup]');
    if (!b) return;
    findById(current.ctx.promiseId).group = b.dataset.pgroup;
    screens['promise-detail'](current.ctx);
  });

  el('pd-target').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ptarget]');
    if (!b) return;
    findById(current.ctx.promiseId).dailyTarget = Number(b.dataset.ptarget);
    screens['promise-detail'](current.ctx);
  });

  el('pd-save-detail').addEventListener('click', function () {
    var p = findById(current.ctx.promiseId);
    p.context = el('pd-context').value.trim();
    p.purpose = el('pd-purpose').value.trim();
    p.due = el('pd-due').value || undefined;
    el('pd-deadline').innerHTML = deadlineHtml(p);
    markerToast('약속');
  });

  el('pd-action-save').addEventListener('click', function () {
    var p = findById(current.ctx.promiseId);
    var text = el('pd-action-input').value.trim();
    if (!text) { el('pd-action-input').focus(); return; }
    var rec = add('action', text, '', { promiseId: p.id });
    markerToast('실행');
    nav('reflection', {
      actionId: rec.id, promiseId: p.id, label: '실행에서 이어짐', value: rec.title,
      returnTo: 'promise-detail', returnId: p.id, returnLabel: '약속으로 돌아가기',
    });
  });

  el('pd-reflect').addEventListener('click', function () {
    var p = findById(current.ctx.promiseId);
    nav('reflection', {
      promiseId: p.id, label: '약속에서 이어짐', value: p.title,
      returnTo: 'promise-detail', returnId: p.id, returnLabel: '약속으로 돌아가기',
    });
  });

  /* Reflection */
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
    nav('promise-detail', { promiseId: current.ctx.promiseId, label: '다시 시도', value: '오늘 할 수 있는 한 가지를 적어보세요' });
  });

  el('rf-edit').addEventListener('click', function () {
    nav('promise-detail', { promiseId: current.ctx.promiseId, label: '약속 수정', value: '내용을 다시 적어도 괜찮습니다' });
  });

  el('rf-repent').addEventListener('click', function () {
    var c = current.ctx;
    var p = c.promiseId ? findById(c.promiseId) : null;
    nav('repentance', {
      label: '실행에서 이어짐', value: p ? p.title : '',
      returnTo: 'promise-detail', returnId: c.promiseId, returnLabel: '약속으로 돌아가기',
    });
  });

  /* Repentance */
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
    el('rp-return').innerHTML = returnBlock(ctx);
    el('rp-voice').innerHTML = voiceBlock();
    el('rp-privacy').innerHTML = privacyBlock(
      '회개 기록은 특히 그렇습니다. 나누고 싶은 부분이 생기면 그때 직접 고르시면 됩니다.',
    );
    renderSamples(el('rp-samples'), 'repentance', function () { el('rp-sin').focus(); });
  };

  el('rp-scripture').addEventListener('click', function () {
    var panel = el('rp-scripture-panel');
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    panel.innerHTML = '<div class="preview"><p class="preview__tag">참고할 말씀 후보</p>' +
      '<p class="note" style="margin-bottom:8px">직접 고르실 수 있습니다. 어떤 말씀이 맞는지는 앱이 정하지 않습니다.</p>' +
      ['시편 51:10|직접 관련', '요한일서 1:9|직접 관련', '잠언 15:1|주제 관련', '누가복음 15:11-32|묵상 후보']
        .map(function (s, i, arr) {
          var parts = s.split('|');
          return '<label class="checkline"' + (i === arr.length - 1 ? ' style="border-bottom:0"' : '') + '>' +
            '<input type="checkbox"><span><span class="checkline__label">' + parts[0] + '</span><br>' +
            '<span class="checkline__value">' + parts[1] + '</span></span></label>';
        }).join('') +
      '<p class="note" style="margin-top:10px">본문 전문은 라이선스 확보 후 제공합니다.</p></div>';
  });

  el('rp-to-promise').addEventListener('click', function () {
    nav('promise', {
      label: '회개 기록에서 이어짐', value: el('rp-turn').value.trim() || '돌이키고 싶은 방향',
      openCompose: true, returnTo: 'repentance', returnLabel: '회개 기록으로 돌아가기',
    });
  });

  el('rp-to-action').addEventListener('click', function () {
    var open = byType('promise').filter(function (p) { return p.status !== 'closed'; });
    if (open.length) {
      var p = open[open.length - 1];
      nav('promise-detail', { promiseId: p.id, label: '회개 기록에서 이어짐', value: p.title, returnTo: 'repentance', returnLabel: '회개 기록으로 돌아가기' });
    } else {
      nav('promise', { label: '회개 기록에서 이어짐', value: '실행을 담을 약속을 먼저 남겨주세요', openCompose: true, returnTo: 'repentance', returnLabel: '회개 기록으로 돌아가기' });
    }
  });

  el('rp-finish').addEventListener('click', function () {
    var vals = ['rp-sin', 'rp-behavior', 'rp-insight', 'rp-turn'].map(function (id) { return el(id).value.trim(); });
    var filled = vals.filter(Boolean);
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

  screens['repentance-bridge'] = function (ctx) { el('rb-return').innerHTML = returnBlock(ctx); };

  el('rb-share').addEventListener('click', function () {
    nav('sharecopy', { recordId: current.ctx.recordId, label: '회개 기록에서 이어짐', value: '고른 항목만 나눠집니다' });
  });

  el('rb-keep').addEventListener('click', function () {
    var c = current.ctx;
    if (c && c.returnTo === 'promise-detail' && c.returnId) nav('promise-detail', { promiseId: c.returnId });
    else nav('journey');
  });

  el('rb-history').addEventListener('click', function () { nav('repentance-history'); });

  screens['repentance-history'] = function () {
    var all = byType('repentance').slice().reverse();
    el('rh-list').innerHTML = all.length
      ? all.map(function (r) {
          return '<div class="card"><p class="card__meta">' + prettyDay(r.day) + '</p>' +
            '<p class="card__body">' + (r.body || r.title) + '</p></div>';
        }).join('')
      : '<div class="empty"><p class="empty__title">아직 회개 기록이 없습니다.</p></div>';
  };

  /* Confession feed */
  var feedTab = 'all';

  /**
   * Placeholder artwork. No real photo is uploaded in this prototype — this
   * stands in so the layout with an image can be judged.
   */
  function photoSvg(variant) {
    var sets = {
      window: ['#EDE7FF', '#D9CCFF', '#BFA9F5'],
      sky: ['#E6F0FB', '#CFE2F6', '#A8C9EA'],
    };
    var c = sets[variant] || sets.window;
    return '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="사진 (예시 이미지)">' +
      '<rect width="320" height="200" fill="' + c[0] + '"/>' +
      '<circle cx="248" cy="52" r="26" fill="' + c[1] + '"/>' +
      '<path d="M0 150 L70 108 L130 146 L196 96 L260 138 L320 112 L320 200 L0 200 Z" fill="' + c[2] + '" opacity="0.85"/>' +
      '<path d="M0 172 L86 134 L152 168 L228 128 L320 158 L320 200 L0 200 Z" fill="' + c[1] + '" opacity="0.9"/>' +
      '</svg>';
  }

  var SAMPLE_FEED = [
    {
      id: 's1', who: '이름 비공개', initial: '비', type: '기도', when: '2시간 전',
      body: '오래 붙잡고 있던 일을 오늘은 그냥 맡기기로 했습니다.\n\n결정하고 나니 마음이 조금 가벼워졌어요.',
      comments: [
        { who: '이름 비공개', initial: '비', when: '1시간 전', body: '저도 요즘 그런 마음입니다. 같이 기도할게요.' },
        { who: '김은혜', initial: '김', when: '40분 전', body: '읽었습니다. 오늘 하루 평안하시길요.' },
      ],
    },
    {
      id: 's2', who: '김은혜', initial: '김', type: '은혜', when: '5시간 전',
      body: '별일 없는 하루였는데, 저녁에 마음이 이상하게 잔잔했어요.',
      photo: 'sky', photoCap: '퇴근길 하늘',
      comments: [{ who: '박소망', initial: '박', when: '3시간 전', body: '이런 저녁이 참 귀하죠.' }],
    },
    {
      id: 's3', who: '이름 비공개', initial: '비', type: '고백', when: '어제',
      body: '아이에게 또 큰 소리를 냈습니다.\n\n미안하다고 말하고 왔습니다. 다음에도 잘할 자신은 없지만, 오늘은 말했습니다.',
      comments: [{ who: '이름 비공개', initial: '비', when: '어제', body: '말했다는 것만으로도 큰 걸음이라고 생각합니다.' }],
    },
    {
      id: 's4', who: '박소망', initial: '박', type: '일상', when: '어제',
      body: '출근길에 라디오에서 나온 찬양 한 소절이 하루 종일 맴돌았습니다.',
      comments: [],
    },
  ];

  /** Comments the user adds during the session, keyed by post id. */
  var myComments = {};

  function commentsFor(post) {
    return (post.comments || []).concat(myComments[post.id] || []);
  }

  screens.confession = function () {
    Array.prototype.forEach.call(document.querySelectorAll('#cf-seg .seg__item'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.feed === feedTab));
    });

    var mine = byType('confession').slice().reverse().map(function (r) {
      return {
        id: r.id,
        who: r.privacy === 'named' ? '나' : '이름 비공개',
        initial: '나',
        type: r.ctype || '고백',
        when: prettyDay(r.day),
        body: r.body || r.title,
        photo: r.photo,
        photoCap: r.photoCap,
        comments: [],
        mine: true,
      };
    });

    feedPosts = feedTab === 'mine' ? mine : mine.concat(SAMPLE_FEED);

    el('cf-list').innerHTML = feedPosts.length
      ? feedPosts.map(postHtml).join('')
      : '<div class="empty" style="margin:16px"><p class="empty__title">아직 나눈 기록이 없습니다.</p></div>';
  };

  /** Rendered both in the feed and at the top of the comments screen. */
  function postHtml(p, opts) {
    var n = commentsFor(p).length;
    return '<article class="post"><span class="post__avatar">' + p.initial + '</span>' +
      '<div class="post__main"><div class="post__meta">' +
      '<span class="post__who">' + p.who + '</span><span>·</span><span>' + p.when + '</span>' +
      (p.mine ? '<span>·</span><span>내 기록</span>' : '') + '</div>' +
      '<p class="post__body">' + p.body + '</p>' +
      (p.photo
        ? '<div class="post__photo">' + photoSvg(p.photo) +
          (p.photoCap ? '<p class="post__photo-cap">' + p.photoCap + '</p>' : '') + '</div>'
        : '') +
      '<span class="post__tag">' + p.type + '</span>' +
      (opts && opts.noActions ? '' :
        '<div class="post__actions">' +
        '<button class="react" aria-pressed="false" type="button">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4c0 5.2-7 9.6-7 9.6z"/></svg>' +
        '함께 기도해요</button>' +
        '<button class="react" type="button" data-comments="' + p.id + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H5l1.8-1.8A8 8 0 1 1 21 12z"/></svg>' +
        (n ? '댓글 ' + n : '댓글') + '</button></div>') +
      '</div></article>';
  }

  /* Comments */
  var feedPosts = [];

  function findPost(id) {
    return feedPosts.filter(function (p) { return p.id === id; })[0];
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-comments]');
    if (b) nav('comments', { postId: b.dataset.comments });
  });

  screens.comments = function (ctx) {
    var p = findPost(ctx.postId);
    if (!p) { nav('confession'); return; }
    el('cm-post').innerHTML = postHtml(p, { noActions: true });

    var list = commentsFor(p);
    el('cm-list').innerHTML = list.length
      ? list.map(function (c) {
          return '<div class="comment"><span class="comment__avatar">' + c.initial + '</span>' +
            '<div class="comment__main"><p class="comment__meta">' +
            '<span class="comment__who">' + c.who + '</span>' + c.when + '</p>' +
            '<p class="comment__body">' + c.body + '</p></div></div>';
        }).join('')
      : '<div class="empty" style="margin:16px"><p class="empty__title">아직 댓글이 없습니다.</p>' +
        '<p class="empty__body">먼저 한마디를 남겨보셔도 좋습니다.</p></div>';

    el('cm-input').value = '';
  };

  el('cm-send').addEventListener('click', function () {
    var text = el('cm-input').value.trim();
    if (!text) { el('cm-input').focus(); return; }
    var id = current.ctx.postId;
    if (!myComments[id]) myComments[id] = [];
    myComments[id].push({ who: '나', initial: '나', when: '방금', body: text });
    screens.comments({ postId: id });
  });

  Array.prototype.forEach.call(document.querySelectorAll('#cf-seg .seg__item'), function (b) {
    b.addEventListener('click', function () { feedTab = b.dataset.feed; screens.confession(); });
  });

  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('.react');
    if (!r) return;
    r.setAttribute('aria-pressed', r.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });

  el('cf-compose').addEventListener('click', function () { nav('composer'); });

  /* Composer */
  var composerType = '기도';
  var composerPrivacy = 'masked';
  var composerPhoto = null;

  function renderPhotoPreview() {
    el('cp-photo-preview').innerHTML = composerPhoto
      ? '<div class="photo-preview"><span class="photo-preview__thumb">' + photoSvg(composerPhoto) + '</span>' +
        '<span><span class="photo-preview__name">사진 1장</span>' +
        '<span class="photo-preview__meta">올리기 전에 미리 보여집니다</span></span>' +
        '<button class="photo-preview__remove" id="cp-photo-remove" type="button">빼기</button></div>'
      : '';
    var rm = el('cp-photo-remove');
    if (rm) rm.addEventListener('click', function () { composerPhoto = null; renderPhotoPreview(); });
  }

  el('cp-photo-add').addEventListener('click', function () {
    // A real picker would open here; the prototype attaches a stand-in image.
    composerPhoto = composerPhoto ? null : 'window';
    renderPhotoPreview();
  });

  screens.composer = function () {
    el('cp-input').value = '';
    composerPhoto = null;
    renderPhotoPreview();
    Array.prototype.forEach.call(document.querySelectorAll('#cp-types .chip'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.type === composerType));
    });
    Array.prototype.forEach.call(document.querySelectorAll('#cp-privacy .privacy__opt'), function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.privacy === composerPrivacy));
    });
    el('cp-voice').innerHTML = voiceBlock();
    el('cp-privacy-note').innerHTML =
      '<div class="privacy-note"><span class="privacy-note__icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>' +
      '<span><span class="privacy-note__title">여기 쓴 글은 공개 범위에 따라 보입니다</span>' +
      '<span class="privacy-note__body">' +
      '<b>나만 보기</b>를 고르면 앱 운영진을 포함해 누구도 볼 수 없습니다. ' +
      '이름 가림으로 나누면 내용만 보이고 이름은 가려집니다.' +
      '</span></span></div>';
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
    add('confession', text.slice(0, 24), text, {
      privacy: composerPrivacy,
      ctype: composerType,
      photo: composerPhoto || undefined,
      photoCap: composerPhoto ? '내가 올린 사진' : undefined,
    });
    markerToast('고백');
    nav('confession', null, { replace: true });
  });

  /* ShareCopy */
  screens.sharecopy = function (ctx) {
    var rec = ctx.recordId ? findById(ctx.recordId) : null;
    var parts = rec ? (rec.body || rec.title).split('\n\n') : ['돌아본 내용'];
    var labels = rec && rec.type === 'script'
      ? parts.map(function (_, i) { return i === 0 ? '첫 문단' : i + 1 + '번째 문단'; })
      : ['죄를 돌아보기', '구체적으로 돌아보기', '새롭게 깨달은 것', '돌이키기'];

    el('sc-fields').innerHTML = parts.map(function (v, i) {
      return '<label class="checkline"' + (i === parts.length - 1 ? ' style="border-bottom:0"' : '') + '>' +
        '<input type="checkbox" data-field="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span><span class="checkline__label">' + (labels[i] || '내용') + '</span><br>' +
        '<span class="checkline__value">' + v + '</span></span></label>';
    }).join('');

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
    var texts = [];
    Array.prototype.forEach.call(document.querySelectorAll('#sc-fields input:checked'), function (i) {
      texts.push(i.parentNode.querySelector('.checkline__value').textContent);
    });
    if (!texts.length) return;
    add('confession', texts[0].slice(0, 24), texts.join('\n\n'), { privacy: 'masked', ctype: '고백' });
    markerToast('고백');
    nav('confession', null, { replace: true });
  });

  /* --------------------------------------------------------------- sheets */

  function openSheet(kind) {
    var panel = el('sheet-panel');

    if (kind === 'me') {
      var total = store.records.length;
      panel.innerHTML = '<div class="sheet__handle"></div>' +
        '<div class="sheet__profile"><span class="sheet__avatar">나</span>' +
        '<span><span class="sheet__name">나</span><br>' +
        '<span class="sheet__meta">지금까지 남긴 기록 ' + total + '개</span></span></div>' +
        ['내 기록 모아보기', '개인정보와 공개 범위', '알림 설정', '계정'].map(function (t) {
          return '<button class="sheet__item" type="button"><span>' + t + '</span><span>›</span></button>';
        }).join('') +
        '<p class="note" style="padding:12px 20px 0">프로토타입이라 아직 열리지 않는 항목이 있습니다.</p>';
    } else {
      panel.innerHTML = '<div class="sheet__handle"></div>' +
        '<p class="sheet__title">메뉴</p>' +
        '<button class="sheet__item" type="button" data-sheet-action="coach"><span>사용법 다시 보기</span><span>›</span></button>' +
        '<a class="sheet__item" href="./repent-app-spec.md" download="REPENT-앱내용.md"><span>앱 내용 내려받기</span><span>›</span></a>' +
        ['공지', '문의하기', '설정'].map(function (t) {
          return '<button class="sheet__item" type="button"><span>' + t + '</span><span>›</span></button>';
        }).join('') +
        '<p class="note" style="padding:12px 20px 0">프로토타입이라 아직 열리지 않는 항목이 있습니다.</p>';
    }

    el('sheet').classList.add('is-open');
  }

  function closeSheet() { el('sheet').classList.remove('is-open'); }

  document.addEventListener('click', function (e) {
    var open = e.target.closest && e.target.closest('[data-sheet]');
    if (open) { openSheet(open.dataset.sheet); return; }
    if (e.target.closest && e.target.closest('[data-sheet-close]')) { closeSheet(); return; }
    var act = e.target.closest && e.target.closest('[data-sheet-action]');
    if (act) {
      closeSheet();
      if (act.dataset.sheetAction === 'coach') { nav('journey'); setTimeout(openCoach, 200); }
    }
  });

  /* ------------------------------------------------------------ nav/chrome */

  Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (n) {
    n.addEventListener('click', function () { nav(n.dataset.tab); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (b) {
    b.addEventListener('click', function () { nav(b.dataset.go); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (b) {
    b.addEventListener('click', back);
  });

  var INDEX = [
    ['01 Intro', 'intro', 'reset'],
    ['02 홈 + 사용법 코치마크', 'journey', 'coach'],
    ['03 여정 (홈)', 'journey', 'seed'],
    ['04 인생 그래프 — 사건 기록/편집', 'life-event', 'seed-event'],
    ['05 첫 기록 → 여정 안착', 'first-saved', 'first'],
    ['05 기도 — 묶음 목록', 'prayer', 'seed'],
    ['06 기도 — 묶음 안 제목들', 'prayer-group', 'seed'],
    ['07 기도 — 제목 상세', 'prayer-detail', 'seed'],
    ['08 기도 — 남기기 (음성·비공개 안내)', 'prayer-new', 'seed'],
    ['09 기도문 — 목록', 'prayer', 'seed-scripts'],
    ['10 기도문 — 쓰기', 'script-new', 'seed'],
    ['11 기도문 — 상세 (복사·나누기)', 'script-detail', 'seed'],
    ['12 기도 → 약속 브릿지', 'prayer-bridge', 'seed'],
    ['13 약속 대시보드', 'promise', 'seed'],
    ['14 약속 상세 + 설정 + 기한', 'promise-detail', 'seed'],
    ['14b 이행 전체 보기 (30일)', 'keep-all', 'seed'],
    ['15 돌아보기 브릿지', 'reflection', 'seed'],
    ['16 회개 — 직접 진입', 'repentance', 'seed'],
    ['17 회개 — 실행에서 이어짐', 'repentance', 'seed-linked'],
    ['18 회개 → 나누기 브릿지', 'repentance-bridge', 'seed'],
    ['19 지난 회개 기록', 'repentance-history', 'seed'],
    ['20 고백 피드 (사진·댓글)', 'confession', 'seed'],
    ['21 고백 — 댓글', 'comments', 'seed-comments'],
    ['22 고백 작성 (사진 첨부)', 'composer', 'seed'],
    ['23 ShareCopy → 고백 미리보기', 'sharecopy', 'seed'],
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
    if (mode === 'first') { resetData(); add('prayer', '조급한 마음을 내려놓게 해주세요', '', { group: 'self' }); }
    if (mode === 'seed' || mode === 'seed-linked' || mode === 'coach' ||
        mode === 'seed-scripts' || mode === 'seed-comments' || mode === 'seed-event') seedData();

    // The comments screen needs the feed list built first.
    if (mode === 'seed-comments') { feedTab = 'all'; screens.confession(); }

    stack = [];
    selectedEvent = null;
    prayerTab = mode === 'seed-scripts' ? 'scripts' : 'titles';
    var ctx = null;
    if (row[1] === 'promise-detail') ctx = { promiseId: 'r2' };
    if (row[1] === 'prayer-group') ctx = { groupId: 'self' };
    if (row[1] === 'prayer-detail') ctx = { prayerId: 'r1' };
    if (row[1] === 'script-detail') ctx = { scriptId: 'r14' };
    if (row[1] === 'comments') ctx = { postId: 's2' };
    if (row[1] === 'life-event') ctx = { eventIndex: 9 };
    if (row[1] === 'prayer-bridge') ctx = { prayerId: 'r1', title: '조급한 마음을 내려놓게 해주세요' };
    if (row[1] === 'first-saved') ctx = { label: '기도' };
    if (row[1] === 'reflection') {
      ctx = { promiseId: 'r2', actionId: 'r8', label: '실행에서 이어짐', value: '아침 10분 기도', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    }
    if (row[1] === 'repentance' && mode === 'seed-linked') {
      ctx = { label: '실행에서 이어짐', value: '매일 아침 10분 먼저 기도하기', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    }
    if (row[1] === 'repentance-bridge') ctx = { recordId: 'r4', returnTo: 'promise-detail', returnId: 'r2', returnLabel: '약속으로 돌아가기' };
    if (row[1] === 'sharecopy') ctx = { recordId: 'r4', label: '회개 기록에서 이어짐', value: '고른 항목만 나눠집니다' };

    closeIndex();
    closeCoach();
    current = { screen: row[1], ctx: ctx };
    render();
    if (mode === 'coach') setTimeout(openCoach, 200);
  });

  function openIndex() { el('proto-index').classList.add('is-open'); }
  function closeIndex() { el('proto-index').classList.remove('is-open'); }

  el('proto-menu').addEventListener('click', openIndex);
  el('proto-index-close').addEventListener('click', closeIndex);

  el('proto-loop').addEventListener('click', function () {
    resetData();
    stack = [];
    selectedEvent = null;
    closeIndex();
    closeCoach();
    current = { screen: 'intro', ctx: null };
    render();
  });

  /* ------------------------------------------------------------- start */

  resetData();
  render();
})();
