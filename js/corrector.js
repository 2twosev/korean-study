/* =========================================================
   corrector.js — 韩语实时纠错引擎
   覆盖：隔写 / 拼写 / 敬语语体 / 助词重复 / 中文直译
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util;

  var TYPE_NAME = {
    spacing: '隔写',
    spell: '拼写',
    grammar: '语法',
    honorific: '敬语',
    particle: '助词',
    tip: '提示'
  };

  /* 找出两段的差异区间 */
  function diffSpan(a, b) {
    var s = 0, e = 0;
    var min = Math.min(a.length, b.length);
    while (s < min && a[s] === b[s]) s++;
    while (e < min - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++;
    return {
      pre: a.slice(0, s),
      midA: a.slice(s, a.length - e),
      midB: b.slice(s, b.length - e),
      suf: e ? a.slice(a.length - e) : ''
    };
  }

  /* ---- 启发式规则（返回 issues 数组） ---- */
  var heuristics = [

    /* 主语谦称 + 半语语尾 */
    function (s) {
      var humble = /(저는|제가|저희|제)/.test(s);
      var banmal = /(한다|이다|왔다|간다|있다|없다|했다|보다|안다|먹다|자다)$/.test(s.trim());
      if (humble && banmal) {
        return [{
          type: 'honorific',
          from: s.trim().slice(-3),
          to: '(敬语)',
          why: '主语用了谦称（저는/제가），句末应配合요体或습니다体：한다 → 해요，이다 → 이에요。'
        }];
      }
      return [];
    },

    /* 助词重复粘连 */
    function (s) {
      var m = s.match(/(는는|은은|이이|가가|을을|를를|에에)/);
      if (m) {
        return [{
          type: 'particle',
          from: m[1],
          to: m[1].slice(0, 1),
          why: '助词重复了，「' + m[1] + '」中出现两次相同助词，一般保留一个即可。'
        }];
      }
      return [];
    },

    /* 汉字词日期混写 */
    function (s) {
      var m = s.match(/([0-9]+)\s*월\s*([0-9]+)\s*일/);
      if (m && /[가-힣]/.test(s)) {
        return [{
          type: 'tip', from: m[0], to: m[0],
          why: '韩语口语中日期需读成固有词，例如 3월 5일 → 삼월 오일。'
        }];
      }
      return [];
    },

    /* 中文标点/中文字符 */
    function (s) {
      if (/[\u4e00-\u9fa5]/.test(s) && /[\uac00-\ud7a3]/.test(s)) {
        return [{
          type: 'grammar', from: '(中文)', to: '(韩文)',
          why: '句子里混入了中文。先用韩语表达试试，翻译我可以帮你～'
        }];
      }
      return [];
    },

    /* 长句无空格 */
    function (s) {
      var t = s.trim();
      if (t.length >= 12 && t.indexOf(' ') === -1 && /[\uac00-\ud7a3]/.test(t)) {
        return [{
          type: 'spacing', from: '(连写)', to: '(需要隔写)',
          why: '韩语的词之间要隔写，建议拆成「主语 + 宾语 + 谓语」几段来写。'
        }];
      }
      return [];
    },

    /* 终结语尾缺失（弱提示） */
    function (s) {
      var t = s.trim();
      if (t.length > 3 && /[\uac00-\ud7a3]/.test(t)) {
        var hasEnding = /(요|다|까|죠|세요|습니다|ㅂ니다|시오|네|군요)\s*[.!?~]*$/.test(t);
        if (!hasEnding) {
          return [{
            type: 'tip', from: '(句末)', to: '(语尾)',
            why: '句子最好带上终结语尾，例如 -아요 / -어요 / -습니다，听起来更自然。'
          }];
        }
      }
      return [];
    }
  ];

  /**
   * 主入口
   * @param {string} text
   * @returns {object}
   */
  function check(text) {
    var src = String(text || '').trim();
    var res = {
      original: src,
      corrected: src,
      issues: [],
      notes: [],
      hasHangul: /[\uac00-\ud7a3]/.test(src),
      isChinese: /[\u4e00-\u9fa5]/.test(src) && !/[\uac00-\ud7a3]/.test(src),
      score: 100
    };

    if (!src) {
      res.score = 0;
      return res;
    }

    /* 1) 词典型规则：多轮替换直到稳定 */
    var cur = src;
    for (var round = 0; round < 3; round++) {
      var prev = cur;
      KC.FIX_RULES.forEach(function (r) {
        var flags = (r.re.flags || '');
        if (flags.indexOf('g') === -1) flags += 'g';
        var re;
        try { re = new RegExp(r.re.source, flags); } catch (e) { return; }
        cur = cur.replace(re, function (match) {
          res.issues.push({
            type: r.type,
            name: TYPE_NAME[r.type] || r.type,
            from: match,
            to: r.to,
            why: r.why
          });
          // to 为 null 表示「只提示、不自动改」
          return typeof r.to === 'string' ? r.to : match;
        });
      });
      res.corrected = cur;
      if (cur === prev) break;
    }

    /* 2) 启发式规则 */
    heuristics.forEach(function (fn) {
      var out;
      try { out = fn(cur); } catch (e) { out = []; }
      (out || []).forEach(function (iss) {
        res.issues.push(Object.assign({ name: TYPE_NAME[iss.type] || iss.type }, iss));
      });
    });

    /* 3) 纯中文输入 → 给出韩语参考 */
    if (res.isChinese) {
      res.issues.push({
        type: 'grammar', name: '中文输入',
        from: src.slice(0, 12), to: '(韩语)',
        why: '试试用韩语表达！可以点输入框下方的「提示」，我会给你地道的说法。'
      });
    }

    /* 4) 打分 */
    var penalty = res.issues.reduce(function (acc, i) {
      if (i.type === 'tip') return acc + 3;
      if (i.type === 'spacing') return acc + 12;
      if (i.type === 'spell') return acc + 15;
      if (i.type === 'grammar' || i.type === 'honorific') return acc + 18;
      return acc + 10;
    }, 0);
    res.score = U.clamp(100 - penalty, 0, 100);
    res.hasIssue = res.issues.length > 0;

    /* 5) 无错误时的鼓励 */
    if (!res.hasIssue && res.hasHangul) {
      res.notes.push('这句看起来很自然，继续保持！');
    }
    return res;
  }

  /* 生成带高亮的 HTML */
  function toHtml(origin, corrected) {
    if (origin === corrected) return '<span>' + U.escape(corrected) + '</span>';
    var d = diffSpan(origin, corrected);
    var out = U.escape(d.pre);
    if (d.midA) out += '<del>' + U.escape(d.midA) + '</del>';
    if (d.midB) out += '<ins>' + U.escape(d.midB) + '</ins>';
    out += U.escape(d.suf);
    return out;
  }

  /* 针对聊天场景生成一句话反馈（韩语 + 中文） */
  function feedback(result) {
    if (!result.hasIssue) return null;
    var first = result.issues[0];
    var map = {
      spacing: { ko: '띄어쓰기를 조심해 봐요.', zh: '注意一下隔写哦。' },
      spell: { ko: '이렇게 쓰는 게 더 자연스러워요.', zh: '这样写更自然。' },
      honorific: { ko: '여기는 존댓말이 필요해요.', zh: '这里需要用敬语。' },
      grammar: { ko: '문장 구조를 다시 볼까요?', zh: '我们再看下句子结构？' },
      particle: { ko: '조사가 겹쳤어요.', zh: '助词重复了。' },
      tip: { ko: '이렇게 말하면 더 자연해져요.', zh: '这样说会更地道。' }
    };
    var m = map[first.type] || map.tip;
    return m;
  }

  KC.corrector = {
    check: check,
    toHtml: toHtml,
    feedback: feedback,
    TYPE_NAME: TYPE_NAME
  };

})(window.KC);
