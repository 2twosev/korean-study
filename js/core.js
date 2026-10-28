/* =========================================================
   core.js — 工具函数、本地存储、学习状态
   ========================================================= */
(function (KC) {
  'use strict';

  /* ---------- DOM 助手 ---------- */
  KC.$ = function (sel, root) { return (root || document).querySelector(sel); };
  KC.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 通用工具 ---------- */
  var U = KC.util = {};

  U.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.rand = function (n) { return Math.floor(Math.random() * n); };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  U.escape = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };

  /* 归一化：去掉标点、空格、转为小写（用于比对韩语答案） */
  U.norm = function (s) {
    return String(s || '')
      .replace(/[\s\u00a0]+/g, '')
      .replace(/[.,!?~·…"'‘’“”()\[\]]/g, '')
      .toLowerCase();
  };

  /* 编辑距离（用于发音/拼写打分） */
  U.levenshtein = function (a, b) {
    a = String(a); b = String(b);
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var m = [], i, j;
    for (i = 0; i <= b.length; i++) m[i] = [i];
    for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        m[i][j] = Math.min(
          m[i - 1][j - 1] + (a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1),
          m[i][j - 1] + 1,
          m[i - 1][j] + 1
        );
      }
    }
    return m[b.length][a.length];
  };

  /* 相似度 0~1 */
  U.similarity = function (a, b) {
    a = U.norm(a); b = U.norm(b);
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    var max = Math.max(a.length, b.length);
    return U.clamp(1 - U.levenshtein(a, b) / max, 0, 1);
  };

  /* 韩语音节拆解计数（简单 Unicode 处理） */
  U.syllables = function (s) {
    var out = [], i, code, c;
    for (i = 0; i < s.length; i++) {
      code = s.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        c = code - 0xAC00;
        out.push({
          ch: s[i],
          cho: Math.floor(c / 588),
          jung: Math.floor((c % 588) / 28),
          jong: c % 28
        });
      }
    }
    return out;
  };

  /* 逐字符差异标记：返回 [{ch, state}] state: same|diff|miss */
  U.diffChars = function (target, said) {
    var t = U.syllables(target).map(function (x) { return x.ch; });
    var s = U.syllables(said).map(function (x) { return x.ch; });
    var m = t.length, n = s.length, dp = [], i, j;
    for (i = 0; i <= m; i++) { dp[i] = []; dp[i][0] = i; }
    for (j = 0; j <= n; j++) dp[0][j] = j;
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + (t[i - 1] === s[j - 1] ? 0 : 1),
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
    var res = [];
    i = m; j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && t[i - 1] === s[j - 1]) {
        res.unshift({ ch: t[i - 1], state: 'same' }); i--; j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        res.unshift({ ch: t[i - 1], state: 'diff', said: s[j - 1] }); i--; j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        res.unshift({ ch: t[i - 1], state: 'miss' }); i--;
      } else {
        j--;
      }
    }
    return res;
  };

  U.today = function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  /* ---------- Toast ---------- */
  KC.toast = function (msg, type) {
    var wrap = KC.$('#toastWrap');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = '.3s'; el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
      setTimeout(function () { el.remove(); }, 320);
    }, 2200);
  };

  /* ---------- Store ---------- */
  var KEY = 'kc_study_v1';
  var DEFAULT = {
    settings: {
      voiceURI: '', pitch: 1.0, rate: 0.95, vol: 1.0, presetId: 'clear',
      level: 'beginner', quizSize: 10, autoNext: true, alwaysRom: true, clickRead: false,
      idol: 'seoyeon', chatLevel: 'easy', scene: 'free', autoSpeak: true, autoFix: true,
      cloud: { enabled: false, appId: '', apiKey: '', apiSecret: '', vcn: 'x2_KoKr_Miya' }
    },
    stats: {
      words: 0, minutes: 0, speak: 0,
      right: 0, wrong: 0,
      skill: { listen: 0, speak: 0, read: 0, write: 0 },
      days: [], streak: 0
    },
    vocab: [],
    fixes: [],
    notes: []
  };

  function deepMerge(base, over) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (Array.isArray(base)) return (over && over.length) ? over : out;
    for (var k in over) {
      if (Object.prototype.hasOwnProperty.call(over, k)) {
        if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k])) {
          out[k] = deepMerge(base[k] || {}, over[k]);
        } else if (over[k] !== undefined) {
          out[k] = over[k];
        }
      }
    }
    return out;
  }

  var Store = KC.store = {
    data: null,
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        this.data = raw ? deepMerge(DEFAULT, JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULT));
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(DEFAULT));
      }
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* 忽略配额错误 */ }
    },
    get settings() { return this.data.settings; },
    get stats() { return this.data.stats; },

    /* 每日打卡 */
    checkIn: function () {
      var d = U.today(), days = this.data.stats.days;
      if (days.indexOf(d) === -1) {
        days.push(d);
        this.data.stats.streak = this.computeStreak();
        this.save();
        return true;
      }
      return false;
    },
    computeStreak: function () {
      var days = this.data.stats.days.slice().sort(), s = 0;
      var d = new Date(), key;
      for (var i = 0; i < 400; i++) {
        key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (days.indexOf(key) !== -1) { s++; d.setDate(d.getDate() - 1); }
        else if (i === 0) { d.setDate(d.getDate() - 1); }
        else break;
      }
      return s;
    },
    addStat: function (key, v) {
      this.data.stats[key] = (this.data.stats[key] || 0) + (v || 1);
      this.save();
    },
    bumpSkill: function (k, v) {
      var s = this.data.stats.skill;
      s[k] = U.clamp((s[k] || 0) + v, 0, 100);
      this.save();
    },

    /* 生词本 */
    addVocab: function (item) {
      var v = this.data.vocab;
      var key = item.ko + '|' + (item.type || 'sentence');
      if (v.some(function (x) { return (x.ko + '|' + (x.type || 'sentence')) === key; })) return false;
      v.unshift(Object.assign({ added: Date.now(), type: 'sentence' }, item));
      this.save();
      return true;
    },
    delVocab: function (ko) {
      this.data.vocab = this.data.vocab.filter(function (x) { return x.ko !== ko; });
      this.save();
    },

    /* 纠错记录 */
    addFix: function (f) {
      this.data.fixes.unshift(Object.assign({ at: Date.now() }, f));
      if (this.data.fixes.length > 60) this.data.fixes.length = 60;
      this.save();
    }
  };

  Store.load();
  Store.checkIn();

})(window.KC);
