/* =========================================================
   learn.js — 听力 / 口语 / 阅读 / 写作 四大训练模块
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util, $ = KC.$, $$ = KC.$$, S = KC.store, Speech = KC.speech;
  var Learn = KC.learn = {};

  /* 获取某级别的所有句子 */
  function allSentences(levelFilter) {
    var list = [];
    KC.LESSONS.forEach(function (L) {
      if (levelFilter && levelFilter !== 'all' && L.id !== levelFilter) return;
      if (!levelFilter && L.level !== S.settings.level && S.settings.level) {
        // 默认级别时仍混合全部，保证素材丰富
      }
      L.sentences.forEach(function (s) {
        list.push(Object.assign({ lesson: L.ko, level: L.level }, s));
      });
    });
    return list;
  }

  /* ==========================================================
     听力 듣기
     ========================================================== */
  var Lz = Learn.listen = {
    mode: 'dictation', items: [], idx: 0, right: 0, wrong: 0, answered: false, hinted: false, slow: false,

    build: function () {
      var lv = $('#listenLevel').value;
      var n = parseInt(S.settings.quizSize, 10) || 10;
      var pool = [];
      if (this.mode === 'number') {
        pool = KC.NUM_NATIVE.concat(KC.NUM_SINO);
      } else {
        pool = allSentences(lv === 'all' ? null : lv);
      }
      if (!pool.length) pool = allSentences(null);
      this.items = U.shuffle(pool).slice(0, Math.min(n, pool.length));
      this.idx = 0; this.right = 0; this.wrong = 0;
      this.render();
    },

    cur: function () { return this.items[this.idx]; },

    render: function () {
      var it = this.cur();
      this.answered = false; this.hinted = false;
      $('#listenIdx').textContent = (this.idx + 1) + ' / ' + this.items.length;
      $('#listenTag').textContent = this.mode === 'dictation' ? '听写' : (this.mode === 'choice' ? '辨析' : '数字');
      $('#listenInput').value = '';
      $('#listenInput').style.display = this.mode === 'choice' ? 'none' : 'block';
      $('#listenHintArea').innerHTML = '';
      $('#listenFeedback').innerHTML = '';
      $('#listenOptions').innerHTML = '';
      $('#btnListenCheck').style.display = this.mode === 'choice' ? 'none' : 'inline-block';
      $('#btnListenGiveUp').style.display = this.mode === 'choice' ? 'none' : 'inline-block';
      $('#btnListenNext').style.display = 'none';
      $('#listenSub').textContent = it && it.lesson ? it.lesson : '点击播放，写下你听到的内容';
      this.updateScore();
      if (this.mode === 'choice') this.renderOptions();
    },

    renderOptions: function () {
      var it = this.cur(), box = $('#listenOptions');
      var pool = U.shuffle(allSentences(null)).slice(0, 12).map(function (x) { return x.ko; });
      var opts = U.shuffle([it.ko].concat(pool.filter(function (k) { return k !== it.ko; }).slice(0, 3)));
      box.innerHTML = '';
      opts.forEach(function (o) {
        var b = document.createElement('button');
        b.className = 'opt'; b.textContent = o;
        b.onclick = function () {
          var all = $$('.opt', box);
          all.forEach(function (x) { x.disabled = true; });
          var ok = o === it.ko;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) all.forEach(function (x) { if (x.textContent === it.ko) x.classList.add('correct'); });
          Lz.judge(ok, ok ? '' : '正确答案是：');
        };
        box.appendChild(b);
      });
    },

    play: function (slow) {
      var it = this.cur(); if (!it) return;
      var btn = $('#btnListenPlay');
      btn.classList.add('playing');
      Speech.speak(it.ko, {
        slow: slow || this.slow,
        onend: function () { btn.classList.remove('playing'); }
      });
    },

    hint: function () {
      var it = this.cur(); if (!it) return;
      this.hinted = true;
      $('#listenHintArea').innerHTML =
        '<div class="hint-box-item">💡 中文：<b>' + U.escape(it.zh) + '</b>' +
        (it.rom ? ' ｜ 罗马音：<b>' + U.escape(it.rom) + '</b>' : '') + '</div>';
    },

    check: function () {
      if (this.answered) return;
      var it = this.cur(); if (!it) return;
      var val = $('#listenInput').value.trim();
      if (!val) { KC.toast('先写上答案再检查哦', 'err'); return; }
      var sim = U.similarity(val, it.ko);
      var ok = sim >= 0.8;
      this.judge(ok, '', sim, val);
    },

    judge: function (ok, prefix, sim, val) {
      var it = this.cur();
      this.answered = true;
      if (ok) { this.right++; S.addStat('right'); }
      else { this.wrong++; S.addStat('wrong'); }
      S.bumpSkill('listen', ok ? 2 : 0);
      if (ok) S.addStat('words');

      var fb = $('#listenFeedback');
      var cls = ok ? 'fb-ok' : 'fb-no';
      var scoreTxt = sim != null ? ('　相似度 ' + Math.round(sim * 100) + '%') : '';
      fb.innerHTML =
        '<div class="' + cls + '">' +
        (ok ? '✅ 正确！' : '❌ ' + prefix + '不对哦') + scoreTxt + '<br>' +
        '<span class="ko">' + U.escape(it.ko) + '</span>' +
        (it.rom ? ' <span style="font-size:12px;opacity:.8">[' + U.escape(it.rom) + ']</span>' : '') + '<br>' +
        '<span style="font-size:12.5px">' + U.escape(it.zh) + '</span>' +
        (val && !ok ? '<br><span style="font-size:12px;opacity:.75">你写的：' + U.escape(val) + '</span>' : '') +
        '</div>';
      this.updateScore();

      if (S.settings.autoNext && ok) {
        var self = this;
        setTimeout(function () { self.next(); }, 1100);
      } else {
        $('#btnListenNext').style.display = 'inline-block';
      }
    },

    giveUp: function () {
      var it = this.cur(); if (!it || this.answered) return;
      this.answered = true; this.wrong++;
      $('#listenFeedback').innerHTML =
        '<div class="fb-no">答案在这里 👇<br><span class="ko">' + U.escape(it.ko) + '</span>' +
        (it.rom ? '<br><span style="font-size:12px">[' + U.escape(it.rom) + ']</span>' : '') +
        '<br><span style="font-size:12.5px">' + U.escape(it.zh) + '</span></div>';
      this.updateScore();
      $('#btnListenNext').style.display = 'inline-block';
    },

    next: function () {
      Speech.stop();
      if (this.idx + 1 >= this.items.length) {
        var pct = Math.round(this.right / Math.max(1, this.items.length) * 100);
        $('#listenFeedback').innerHTML =
          '<div class="fb-ok">🎉 本轮完成！正确率 <b>' + pct + '%</b>（' + this.right + '/' + this.items.length + '）</div>';
        S.addStat('minutes', 2);
        this.build();
        KC.toast('开始新一轮训练');
        return;
      }
      this.idx++;
      this.render();
      if (this.mode === 'choice') setTimeout(function () { Lz.play(); }, 200);
    },

    updateScore: function () {
      $('#listenRight').textContent = this.right;
      $('#listenWrong').textContent = this.wrong;
      var total = this.items.length || 1;
      var pct = Math.round((this.idx + (this.answered ? 1 : 0)) / total * 100);
      var acc = Math.round(this.right / Math.max(1, this.right + this.wrong) * 100);
      $('#listenScore').textContent = isNaN(acc) ? 0 : acc;
      $('#listenRing').style.background =
        'conic-gradient(var(--purple) ' + (pct * 3.6) + 'deg, var(--line2) 0deg)';
    }
  };

  /* ==========================================================
     口语 말하기
     ========================================================== */
  var Sp = Learn.speak = {
    mode: 'shadow', cur: null, rec: null, listening: false,

    pool: function () {
      if (this.mode === 'word') {
        return KC.WORDS.filter(function (w) {
          return !S.settings.level || w.lv === S.settings.level || true;
        }).map(function (w) { return { ko: w.ko, rom: w.rom, zh: w.zh }; });
      }
      if (this.mode === 'roleplay') {
        // 情景对话：抽取 "提问 + 回答" 相邻两句
        var out = [];
        KC.LESSONS.forEach(function (L) {
          var ss = L.sentences;
          for (var i = 0; i < ss.length; i += 2) {
            if (ss[i] && ss[i + 1]) out.push(Object.assign({}, ss[i], { next: ss[i + 1] }));
          }
        });
        return out;
      }
      return allSentences(null);
    },

    next: function () {
      var pool = this.pool();
      // 尽量让 setLevel 生效
      this.cur = U.pick(pool);
      this.render();
    },

    render: function () {
      var c = this.cur; if (!c) return;
      $('#speakKo').textContent = c.ko;
      $('#speakRom').textContent = c.rom || '';
      $('#speakZh').textContent = c.zh || '';
      $('#speakRecognText').textContent = '—';
      $('#speakResult').innerHTML = '';
      this.replyNext = null;
    },

    play: function (slow) {
      if (!this.cur) return;
      Speech.speak(this.cur.ko, { slow: slow });
    },

    startRec: function () {
      var self = this;
      if (this.listening) { this.stopRec(); return; }
      if (!Speech.supportSTT) {
        KC.toast('当前浏览器不支持语音识别，建议用 Edge / Chrome', 'err');
        $('#micBadge').textContent = '❌ 不支持语音识别';
        return;
      }
      this.listening = true;
      $('#btnSpeakMic').classList.add('active');
      $('#micLabel').textContent = '正在聆听…（说完点击停止）';
      $('#wave').classList.add('on');
      $('#speakRecognText').textContent = '…';
      $('#micBadge').textContent = '🎙️ 聆听中';

      this.rec = Speech.listen({
        lang: 'ko-KR',
        interim: true,
        timeout: 15000,
        onresult: function (finalText, interim) {
          $('#speakRecognText').textContent = (finalText || interim || '…');
        },
        onend: function (finalText) {
          self.finishRec(finalText);
        },
        onerror: function (err) {
          self.listening = false;
          $('#btnSpeakMic').classList.remove('active');
          $('#wave').classList.remove('on');
          $('#micBadge').textContent = '麦克风错误：' + err;
          KC.toast('麦克风错误：' + err, 'err');
        }
      });
    },

    stopRec: function () {
      if (this.rec) this.rec.abort();
      this.rec = null;
      this.listening = false;
      $('#btnSpeakMic').classList.remove('active');
      $('#wave').classList.remove('on');
      $('#micLabel').textContent = '按住/点击开始朗读';
      $('#micBadge').textContent = '已就绪';
    },

    finishRec: function (said) {
      this.listening = false;
      $('#btnSpeakMic').classList.remove('active');
      $('#wave').classList.remove('on');
      $('#micLabel').textContent = '按住/点击开始朗读';
      $('#micBadge').textContent = '已就绪';
      said = (said || '').trim();
      if (!said || said === '…') {
        $('#speakRecognText').textContent = '—';
        KC.toast('没有听清，再试一次吧', 'err');
        return;
      }
      $('#speakRecognText').textContent = said;
      this.score(said);
    },

    score: function (said) {
      var target = this.cur.ko;
      var sim = U.similarity(said, target);
      var score = Math.round(sim * 100);
      S.addStat('speak');
      S.bumpSkill('speak', score >= 80 ? 2 : 1);

      var diff = U.diffChars(target, said);
      var marks = diff.map(function (d) {
        return '<span class="diff-ch ' + (d.state === 'same' ? 'good' : 'bad') + '">' + U.escape(d.ch) + '</span>';
      }).join('');

      var tips = [];
      var bad = diff.filter(function (d) { return d.state !== 'same'; });
      if (bad.length) {
        bad.forEach(function (d) {
          var syl = U.syllables(d.ch)[0];
          if (syl && syl.jong > 0) tips.push('注意收音（받침）：「' + d.ch + '」的结尾音要收住。');
          else tips.push('再听一次「' + d.ch + '」的发音位置。');
        });
      }
      if (/[ㅃㄸㄲㅆㅉ]/.test(target) || target.indexOf('ㅃ') >= 0) tips.push('这句话里有紧音，发音要短促有力。');

      var level = score >= 90 ? '完美！' : score >= 75 ? '很不错！' : score >= 55 ? '还要练练' : '再来一次';
      $('#speakResult').innerHTML =
        '<div style="text-align:center;padding:10px 0">' +
        '<div class="score-big" style="color:' + (score >= 75 ? 'var(--green)' : score >= 55 ? 'var(--amber)' : 'var(--red)') + '">' + score + '</div>' +
        '<div class="score-label">' + level + '</div>' +
        '<div class="diff-row">' + marks + '</div>' +
        (tips.length ? '<div style="font-size:12.5px;color:var(--txt2);margin-top:10px;line-height:1.8">' +
          tips.slice(0, 3).map(function (t) { return '· ' + U.escape(t); }).join('<br>') + '</div>' : '') +
        '</div>';

      if (score >= 75) KC.toast('发音不错！👏', 'ok');

      // 情景模式：AI 接话
      if (this.mode === 'roleplay' && this.cur.next) {
        var reply = this.cur.next;
        setTimeout(function () {
          Speech.speak(reply.ko);
          $('#speakZh').textContent = reply.zh || '';
          KC.toast('对方回答：' + reply.ko);
        }, 900);
      }
    },

    renderPairs: function () {
      var box = $('#speakPairs');
      if (!box) return;
      box.innerHTML = KC.PRON_PAIRS.map(function (p) {
        return '<div class="pair">' +
          '<div class="pair-top"><span class="pair-a ko">' + U.escape(p.a) + '</span>' +
          '<span class="arrow">vs</span><span class="pair-b ko">' + U.escape(p.b) + '</span></div>' +
          '<div class="pair-note">' + U.escape(p.note) + '</div>' +
          '<div style="margin-top:6px;display:flex;gap:6px">' +
          '<button class="msg-act" data-say="' + U.escape(p.a) + '">🔊 A</button>' +
          '<button class="msg-act" data-say="' + U.escape(p.b) + '">🔊 B</button>' +
          '</div></div>';
      }).join('');
      $$('[data-say]', box).forEach(function (b) {
        b.onclick = function () { Speech.speak(b.getAttribute('data-say')); };
      });
    }
  };

  /* ==========================================================
     阅读 읽기
     ========================================================== */
  var Rd = Learn.read = {
    alphaTab: 'vowel',

    renderAlpha: function () {
      var grid = $('#alphaGrid');
      var list = KC.ALPHABET[this.alphaTab] || [];
      grid.innerHTML = list.map(function (x) {
        var sayName = 'consonant' === Rd.alphaTab ? x.ch : '';
        return '<div class="alpha-card" data-word="' + U.escape(x.ex) + '">' +
          '<div class="alpha-ch">' + x.ch + '</div>' +
          '<div class="alpha-sound">' + U.escape(x.s) + '</div>' +
          '<div class="alpha-ex">' + U.escape(x.ex) + '</div>' +
          '</div>';
      }).join('');
      $$('.alpha-card', grid).forEach(function (c) {
        c.onclick = function () {
          var w = c.getAttribute('data-word');
          Speech.speak(w);
          KC.toast('朗读：' + w);
        };
      });
    },

    renderText: function () {
      var body = $('#readerBody');
      var id = $('#readLesson').value;
      var L = KC.LESSONS.filter(function (x) { return x.id === id; })[0] || KC.LESSONS[0];
      var showRom = $('#tglRom').checked, showZh = $('#tglZh').checked;
      body.innerHTML = L.sentences.map(function (s, i) {
        return '<div class="sent" data-idx="' + i + '">' +
          '<div class="sent-ko">' + U.escape(s.ko) + '</div>' +
          (showRom && s.rom ? '<div class="sent-rom">' + U.escape(s.rom) + '</div>' : '') +
          (showZh ? '<div class="sent-zh">' + U.escape(s.zh) + '</div>' : '') +
          '<div class="sent-tools">' +
          '<button class="msg-act" data-act="play" data-i="' + i + '">🔊 朗读</button>' +
          '<button class="msg-act" data-act="slow" data-i="' + i + '">🐢 慢速</button>' +
          '<button class="msg-act" data-act="save" data-i="' + i + '">⭐ 收藏</button>' +
          '</div></div>';
      }).join('');
      body._lesson = L;
      $$('.sent', body).forEach(function (el) {
        el.onclick = function (e) {
          var i = parseInt(el.getAttribute('data-idx'), 10);
          var s = body._lesson.sentences[i];
          if (S.settings.clickRead) Speech.speak(s.ko);
          $$('.sent', body).forEach(function (x) { x.classList.remove('active'); });
          el.classList.add('active');
        };
        $$('[data-act]', el).forEach(function (b) {
          b.onclick = function (e) {
            e.stopPropagation();
            var i = parseInt(b.getAttribute('data-i'), 10);
            var s = body._lesson.sentences[i];
            var act = b.getAttribute('data-act');
            if (act === 'play') Speech.speak(s.ko);
            else if (act === 'slow') Speech.speak(s.ko, { slow: true });
            else if (act === 'save') {
              var added = S.addVocab({ ko: s.ko, rom: s.rom, zh: s.zh, type: 'sentence' });
              KC.toast(added ? '已加入生词本 ⭐' : '生词本里已经有了', added ? 'ok' : '');
              Rd.renderVocab();
            }
          };
        });
      });
    },

    readAll: function () {
      var id = $('#readLesson').value;
      var L = KC.LESSONS.filter(function (x) { return x.id === id; })[0] || KC.LESSONS[0];
      Speech.stop();
      var i = 0;
      (function go() {
        if (i >= L.sentences.length) return;
        var s = L.sentences[i];
        var el = $$('.sent', $('#readerBody'))[i];
        if (el) {
          $$('.sent', $('#readerBody')).forEach(function (x) { x.classList.remove('active'); });
          el.classList.add('active');
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        Speech.speak(s.ko).then(function () { i++; go(); });
      })();
    },

    renderVocab: function () {
      var box = $('#vocabList');
      var v = S.data.vocab;
      $('#vocabCount').textContent = v.length;
      if (!v.length) { box.innerHTML = '<div class="empty">还没有收藏，去「阅读」里点 ⭐ 试试</div>'; return; }
      box.innerHTML = v.map(function (x) {
        return '<div class="vocab-item">' +
          '<div class="vocab-top"><div>' +
          '<div class="vocab-ko">' + U.escape(x.ko) + '</div>' +
          (x.rom ? '<div class="vocab-zh" style="color:var(--purple)">' + U.escape(x.rom) + '</div>' : '') +
          (x.zh ? '<div class="vocab-zh">' + U.escape(x.zh) + '</div>' : '') +
          '</div><button class="vocab-del" data-ko="' + U.escape(x.ko) + '">✕</button></div>' +
          '<div style="margin-top:8px"><button class="msg-act" data-say="' + U.escape(x.ko) + '">🔊 朗读</button></div>' +
          '</div>';
      }).join('');
      $$('.vocab-del', box).forEach(function (b) {
        b.onclick = function () { S.delVocab(b.getAttribute('data-ko')); Rd.renderVocab(); KC.toast('已移除'); };
      });
      $$('[data-say]', box).forEach(function (b) {
        b.onclick = function () { Speech.speak(b.getAttribute('data-say')); };
      });
    }
  };

  /* ==========================================================
     写作 쓰기
     ========================================================== */
  var Wr = Learn.write = {
    mode: 'typing', items: [], idx: 0, right: 0, wrong: 0, composeBuf: [],

    makeItems: function () {
      var lv = $('#writeLevel').value;
      var n = parseInt(S.settings.quizSize, 10) || 10;
      var out = [];
      if (this.mode === 'typing') {
        var pool = allSentences(lv === 'all' ? null : lv);
        out = U.shuffle(pool).slice(0, n).map(function (s) {
          return { prompt: s.rom, answer: s.ko, koHint: s.co, tip: s.zh, sub: '根据罗马音拼写韩文' };
        });
      } else if (this.mode === 'spell') {
        var words = KC.WORDS.filter(function (w) { return lv === 'all' || true; });
        out = U.shuffle(words).slice(0, n).map(function (w) {
          return { prompt: w.zh, answer: w.ko, tip: w.rom, sub: '根据中文写出韩文单词', cn: true };
        });
      } else if (this.mode === 'particle') {
        out = U.shuffle(KC.PARTICLE_QUIZ).slice(0, n).map(function (p) {
          return { prompt: p.q, answer: p.a, tip: p.note, sub: '填入正确的助词', opts: p.opts };
        });
      } else {
        var sents = allSentences(lv === 'all' ? null : lv).filter(function (s) { return s.ko.split(' ').length >= 3; });
        out = U.shuffle(sents).slice(0, n).map(function (s) {
          return { prompt: s.zh, answer: s.ko, tip: s.rom, sub: '点击词块组成完整句子', compose: true };
        });
      }
      this.items = out;
    },

    build: function () {
      this.makeItems();
      this.idx = 0; this.right = 0; this.wrong = 0;
      this.render();
    },

    cur: function () { return this.items[this.idx]; },

    render: function () {
      var it = this.cur();
      if (!it) return;
      $('#writeIdx').textContent = (this.idx + 1) + ' / ' + this.items.length;
      $('#writeTag').textContent = { typing: '打字', spell: '拼写', particle: '助词', compose: '重组' }[this.mode];
      $('#writePrompt').textContent = it.prompt;
      $('#writePrompt').className = 'write-prompt' + (it.cn ? '' : ' ko');
      $('#writeSub').textContent = it.sub;
      $('#writeInput').value = '';
      $('#writeFeedback').innerHTML = '';
      $('#writePreview').innerHTML = '';
      $('#btnWriteNext').style.display = 'none';
      $('#btnWriteCheck').style.display = 'inline-block';
      $('#btnWriteGiveUp').style.display = 'inline-block';
      $('#writeInput').style.display = it.compose ? 'none' : 'block';
      if (it.compose) this.renderCompose();
    },

    renderCompose: function () {
      var it = this.cur(), box = $('#writePreview');
      var parts = U.shuffle(it.answer.split(' '));
      this.composeBuf = [];
      var wrap = document.createElement('div');
      var pool = document.createElement('div');
      pool.style.display = 'flex'; pool.style.gap = '6px'; pool.style.flexWrap = 'wrap'; pool.style.justifyContent = 'center';
      parts.forEach(function (p) {
        var b = document.createElement('button');
        b.className = 'mini-btn'; b.textContent = p; b.style.fontFamily = 'var(--font-ko)'; b.style.fontSize = '15px';
        b.onclick = function () {
          b.disabled = true;
          Wr.composeBuf.push(p);
          $('#writePreview').querySelector('.out').textContent = Wr.composeBuf.join(' ');
        };
        pool.appendChild(b);
      });
      var out = document.createElement('div');
      out.className = 'out'; out.style.minHeight = '34px'; out.style.fontSize = '20px';
      out.style.fontFamily = 'var(--font-ko)'; out.style.color = 'var(--purple)'; out.style.marginBottom = '10px';
      wrap.appendChild(out); wrap.appendChild(pool);
      var reset = document.createElement('button');
      reset.className = 'mini-btn'; reset.textContent = '清空'; reset.style.marginTop = '8px';
      reset.onclick = function () { Wr.renderCompose(); };
      wrap.appendChild(reset);
      box.appendChild(wrap);
    },

    check: function () {
      var it = this.cur(); if (!it) return;
      var val = (it.compose ? this.composeBuf.join(' ') : $('#writeInput').value.trim());
      if (!val) { KC.toast('先写出答案再检查哦', 'err'); return; }
      var ok = U.norm(val) === U.norm(it.answer);
      this.judge(ok, val);
    },

    judge: function (ok, val) {
      var it = this.cur();
      if (ok) { this.right++; S.addStat('words'); } else { this.wrong++; }
      S.bumpSkill('write', ok ? 2 : 0);
      $('#writeFeedback').innerHTML =
        '<div class="' + (ok ? 'fb-ok' : 'fb-no') + '">' +
        (ok ? '✅ 完全正确！' : '❌ 还差一点点') + '<br>' +
        '<span class="ko">' + U.escape(it.answer) + '</span>' +
        (it.tip ? '<br><span style="font-size:12.5px">' + U.escape(it.tip) + '</span>' : '') +
        (!ok && val ? '<br><span style="font-size:12px;opacity:.75">你写的：' + U.escape(val) + '</span>' : '') +
        '</div>';
      if (S.settings.autoNext && ok) {
        var self = this;
        setTimeout(function () { self.next(); }, 1000);
      } else {
        $('#btnWriteNext').style.display = 'inline-block';
      }
    },

    next: function () {
      if (this.idx + 1 >= this.items.length) {
        var pct = Math.round(this.right / Math.max(1, this.items.length) * 100);
        $('#writeFeedback').innerHTML = '<div class="fb-ok">🎉 本轮完成！正确率 <b>' + pct + '%</b></div>';
        this.build();
        return;
      }
      this.idx++; this.render();
    },

    giveUp: function () {
      var it = this.cur();
      $('#writeFeedback').innerHTML =
        '<div class="fb-no">参考答案：<br><span class="ko">' + U.escape(it.answer) + '</span>' +
        (it.tip ? '<br><span style="font-size:12.5px">' + U.escape(it.tip) + '</span>' : '') + '</div>';
      $('#btnWriteNext').style.display = 'inline-block';
    }
  };

  /* ==========================================================
     虚拟韩文键盘（含自动音节组合）
     ========================================================== */
  var CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  var JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  // 终声拆分表：复合终声 → [下一音节初声, 剩余终声]
  var JONG_SPLIT = { 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'] };
  // 元音组合表
  var JUNG_COMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ', 'ㅏㅣ': 'ㅐ', 'ㅑㅣ': 'ㅒ', 'ㅓㅣ': 'ㅔ', 'ㅕㅣ': 'ㅖ' };
  // 终声组合表
  var JONG_COMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  var Kbd = Learn.kbd = {
    buf: { cho: '', jung: '', jong: '' },
    text: '',

    compose: function () {
      var b = this.buf;
      if (!b.cho && !b.jung && !b.jong) return '';
      var c = CHO.indexOf(b.cho), ju = JUNG.indexOf(b.jung), jo = JONG.indexOf(b.jong);
      if (c < 0) c = 11; // 无初声时用 ㅇ 的位置，但会显示 오 而非 ㅗ，需单独处理
      if (ju < 0) return b.cho;
      if (!b.cho) return b.jung; // 只有元音时输出单独字母
      if (jo < 0) jo = 0;
      var code = 0xAC00 + (c * 588) + (ju * 28) + jo;
      return String.fromCharCode(code);
    },

    /* 注意：这里必须清空同一个对象，不能重新赋值 this.buf，
       否则 input() 中持有的旧引用会失效 */
    flush: function () {
      var s = this.compose();
      if (s) this.text += s;
      this.buf.cho = ''; this.buf.jung = ''; this.buf.jong = '';
    },

    input: function (ch) {
      var b = this.buf;
      var isCho = CHO.indexOf(ch) >= 0;
      var isJung = JUNG.indexOf(ch) >= 0;

      if (isJung) {
        if (!b.cho && b.jung) {
          var comb = JUNG_COMB[b.jung + ch];
          if (comb) { b.jung = comb; this.sync(); return; }
          this.flush(); b.jung = ch; this.sync(); return;
        }
        if (!b.cho && !b.jung && !b.jong) { b.jung = ch; this.sync(); return; }
        if (b.cho && !b.jung) { b.jung = ch; this.sync(); return; }
        if (b.jong) {
          // prev 심플: 拆分终声给下一音节
          var sp = JONG_SPLIT[b.jong];
          if (sp) {
            var oldCho = b.cho, oldJung = b.jung;
            this.text += this.composeOf(oldCho, oldJung, sp[1]);
            b.cho = sp[0]; b.jung = ch; b.jong = '';
          } else {
            var oc = b.cho, oj = b.jung, rmv = b.jong;
            this.flushBufForce(oc, oj, rmv);
            b.cho = rmv; b.jung = ch; b.jong = '';
          }
          this.sync(); return;
        }
        if (b.jung) {
          var cb = JUNG_COMB[b.jung + ch];
          if (cb) { b.jung = cb; this.sync(); return; }
          this.flush(); b.jung = ch; this.sync(); return;
        }
      } else if (isCho) {
        if (!b.cho && !b.jung) { b.cho = ch; this.sync(); return; }
        if (b.cho && !b.jung) { this.flush(); b.cho = ch; this.sync(); return; }
        if (!b.jong) {
          if (JONG.indexOf(ch) > 0) { b.jong = ch; this.sync(); return; }
          this.flush(); b.cho = ch; this.sync(); return;
        }
        var cmb = JONG_COMB[b.jong + ch];
        if (cmb) { b.jong = cmb; this.sync(); return; }
        this.flush(); b.cho = ch; this.sync(); return;
      }
      return;
    },

    composeOf: function (cho, jung, jong) {
      if (!jung) return cho;
      if (!cho) return jung;
      var c = CHO.indexOf(cho), ju = JUNG.indexOf(jung), jo = JONG.indexOf(jong || '');
      if (jo < 0) jo = 0;
      return String.fromCharCode(0xAC00 + c * 588 + ju * 28 + jo);
    },

    flushBufForce: function (cho, jung, jong) {
      this.text += this.composeOf(cho, jung, '');
      this.buf.cho = ''; this.buf.jung = ''; this.buf.jong = '';
    },

    backspace: function () {
      var b = this.buf;
      if (b.jong) { b.jong = ''; this.sync(); return; }
      if (b.jung) {
        // 拆复合元音
        for (var k in JUNG_COMB) { if (JUNG_COMB[k] === b.jung) { b.jung = k[0]; this.sync(); return; } }
        b.jung = ''; this.sync(); return;
      }
      if (b.cho) { b.cho = ''; this.sync(); return; }
      this.text = this.text.slice(0, -1);
      this.sync();
    },

    sync: function () {
      var el = $('#kbdOut');
      if (el) el.value = this.text + this.compose();
    },

    render: function () {
      var rows = [
        ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
        ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
        ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '←', '␣', 'C']
      ];
      var box = $('#virtualKbd');
      if (!box) return;
      box.innerHTML = '';
      rows.forEach(function (r) {
        r.forEach(function (ch) {
          var b = document.createElement('button');
          b.textContent = ch;
          b.setAttribute('data-k', ch);
          b.onclick = function () {
            if (ch === '←') { Kbd.backspace(); return; }
            if (ch === '␣') { Kbd.flush(); Kbd.text += ' '; Kbd.sync(); return; }
            if (ch === 'C') { Kbd.text = ''; Kbd.buf.cho = ''; Kbd.buf.jung = ''; Kbd.buf.jong = ''; Kbd.sync(); return; }
            Kbd.input(ch);
          };
          box.appendChild(b);
        });
      });
      var out = $('#kbdOut');
      if (out) {
        out.addEventListener('input', function () {
          // 手动编辑时同步内部状态
          Kbd.text = out.value;
          Kbd.buf = { cho: '', jung: '', jong: '' };
        });
      }
    }
  };

  /* ==========================================================
     初始化
     ========================================================== */
  Learn.init = function () {

    /* ---- 听力 ---- */
    $$('#listenMode .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#listenMode .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        Lz.mode = b.getAttribute('data-mode');
        Lz.build();
        KC.toast('已切换：' + b.textContent);
      };
    });
    $('#btnListenPlay').onclick = function () { Lz.play(); };
    $('#btnListenSlow').onclick = function () {
      Lz.slow = !Lz.slow;
      this.textContent = Lz.slow ? '1.0x' : '0.6x';
      this.style.background = Lz.slow ? 'var(--purple-s)' : '';
      Lz.play();
    };
    $('#btnListenHint').onclick = function () { Lz.hint(); };
    $('#btnListenCheck').onclick = function () { Lz.check(); };
    $('#btnListenGiveUp').onclick = function () { Lz.giveUp(); };
    $('#btnListenNext').onclick = function () { Lz.next(); };
    $('#btnListenReset').onclick = function () { Lz.build(); KC.toast('已重新开始'); };
    $('#listenLevel').onchange = function () { Lz.build(); };
    $('#listenInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') Lz.check(); });

    /* ---- 口语 ---- */
    $$('#speakMode .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#speakMode .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        Sp.mode = b.getAttribute('data-mode');
        Sp.next();
      };
    });
    $('#btnSpeakPlay').onclick = function () { Sp.play(); };
    $('#btnSpeakSlow').onclick = function () { Sp.play(true); };
    $('#btnSpeakMic').onclick = function () { Sp.startRec(); };
    $('#btnSpeakNext').onclick = function () { Sp.next(); };
    $('#speakLevel').onchange = function () { Sp.next(); };
    Sp.renderPairs();

    /* ---- 阅读 ---- */
    $$('#readMode .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#readMode .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var m = b.getAttribute('data-mode');
        $('#readHangul').style.display = m === 'hangul' ? 'block' : 'none';
        $('#readText').style.display = m === 'text' ? 'block' : 'none';
        $('#readVocab').style.display = m === 'vocab' ? 'block' : 'none';
        if (m === 'vocab') Rd.renderVocab();
        S.bumpSkill('read', 1);
      };
    });
    $$('#alphaTabs .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#alphaTabs .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        Rd.alphaTab = b.getAttribute('data-t');
        Rd.renderAlpha();
      };
    });
    $('#tglRom').onchange = $('#tglZh').onchange = function () { Rd.renderText(); };
    $('#readLesson').onchange = function () { Rd.renderText(); };
    $('#btnReadAll').onclick = function () { Rd.readAll(); };
    Rd.renderAlpha();
    Rd.renderText();

    /* ---- 写作 ---- */
    $$('#writeMode .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#writeMode .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        Wr.mode = b.getAttribute('data-mode');
        Wr.build();
      };
    });
    $('#btnWriteCheck').onclick = function () { Wr.check(); };
    $('#btnWriteNext').onclick = function () { Wr.next(); };
    $('#btnWriteGiveUp').onclick = function () { Wr.giveUp(); };
    $('#btnWriteReset').onclick = function () { Wr.build(); };
    $('#writeInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') Wr.check(); });
    $('#writeLevel').onchange = function () { Wr.build(); };
    Wr.build();

    /* ---- 键盘 ---- */
    Kbd.render();
  };

  /* 页面进入时的刷新 */
  Learn.enter = function (page) {
    if (page === 'listen' && !Lz.items.length) Lz.build();
    if (page === 'speak' && !Sp.cur) Sp.next();
    if (page === 'read') Rd.renderVocab();
    if (page === 'write' && !Wr.items.length) Wr.build();
  };

  /* 供其它模块调用 */
  Learn.refreshLevels = function () {
    // 填充课程下拉
    var opts = '<option value="all">全部课程</option>';
    KC.LESSONS.forEach(function (L) {
      opts += '<option value="' + L.id + '">' + L.ko + ' · ' + L.cn + '</option>';
    });
    [$('#listenLevel'), $('#writeLevel')].forEach(function (sel) {
      if (sel) { var old = sel.value; sel.innerHTML = opts; sel.value = old || 'all'; }
    });
    // 口语按级别
    var lopts = '';
    ['beginner', 'intermediate', 'advanced'].forEach(function (k) {
      lopts += '<option value="' + k + '">' + KC.LEVEL_NAME[k] + '</option>';
    });
    var sp = $('#speakLevel');
    if (sp) { sp.innerHTML = lopts; sp.value = S.settings.level; }
    // 阅读课文选择
    var rl = $('#readLesson'), old2 = rl && rl.value;
    if (rl) {
      rl.innerHTML = KC.LESSONS.map(function (L) {
        return '<option value="' + L.id + '">' + L.ko + ' · ' + L.cn + '（' + KC.LEVEL_NAME[L.level] + '）</option>';
      }).join('');
      rl.value = old2 || KC.LESSONS[0].id;
    }
  };

})(window.KC);
