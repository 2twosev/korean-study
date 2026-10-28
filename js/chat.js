/* =========================================================
   chat.js — 爱豆陪聊 + 韩语实时纠错
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util, $ = KC.$, $$ = KC.$$, S = KC.store, Speech = KC.speech;

  var Chat = KC.chat = {
    idol: null,
    msgs: [],
    typing: false,
    _timer: null
  };

  /* ---------- 爱豆 ---------- */
  function getIdol(id) {
    return KC.IDOLS.filter(function (x) { return x.id === id; })[0] || KC.IDOLS[0];
  }

  Chat.setIdol = function (id, silent) {
    var s = S.settings;
    s.idol = id;
    var v = this.idol = getIdol(id);
    // 应用角色推荐的音色参数
    s.pitch = v.pitch; s.rate = v.rate;
    Speech.updateSettings({ pitch: v.pitch, rate: v.rate });
    // 自动挑一个性别相符的语音（韩语优先）
    var kov = Speech.koVoices();
    if (kov.length > 1) {
      var pref = /female|여|heami|sun|aria|yao/i;
      var target = null;
      for (var i = 0; i < kov.length; i++) {
        var nm = kov[i].name.toLowerCase();
        var female = pref.test(nm);
        if (v.tags.indexOf('Rapper') >= 0 || v.id === 'jihoo' || v.id === 'doyoon' || v.id === 'siwoo') {
          if (!female) { target = kov[i]; break; }
        } else if (female) { target = kov[i]; break; }
      }
      if (target) { s.voiceURI = target.voiceURI; Speech.updateSettings({ voiceURI: target.voiceURI }); }
    }
    S.save();

    $('#chatAv').textContent = v.av;
    $('#chatAv').style.background = v.color;
    $('#chatName').textContent = v.name + ' · ' + v.rom;
    $('#chatState').textContent = '在线 · ' + v.tags.join(' / ');
    $('#chipIdolName').textContent = v.name + ' (' + v.rom + ')';
    KC.app && KC.app.syncVoiceChip();
    $$('.idol-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-id') === id);
    });
    if (!silent) {
      this.clear();
      this.pushSys('已切换到 ' + v.name + ' · ' + v.rom + '（' + v.desc + '）');
      this.aiSay(U.pick(v.greet));
    }
  };

  /* ---------- 渲染爱豆列表 ---------- */
  Chat.renderIdols = function () {
    var box = $('#idolList');
    box.innerHTML = KC.IDOLS.map(function (v) {
      return '<div class="idol-item' + (v.id === S.settings.idol ? ' active' : '') + '" data-id="' + v.id + '">' +
        '<div class="idol-av" style="background:' + v.color + '">' + v.av + '</div>' +
        '<div class="idol-meta"><div class="idol-name">' + v.name + '</div>' +
        '<div class="idol-desc">' + U.escape(v.desc) + '</div></div></div>';
    }).join('');
    $$('.idol-item', box).forEach(function (el) {
      el.onclick = function () {
        Chat.setIdol(el.getAttribute('data-id'));
        KC.toast('已切换到 ' + getIdol(el.getAttribute('data-id')).name, 'ok');
      };
    });
  };

  /* ---------- 消息渲染 ---------- */
  function nowTime() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  Chat.push = function (m) {
    this.msgs.push(m);
    var body = $('#chatBody');
    var el = document.createElement('div');
    el.className = 'msg ' + (m.role === 'me' ? 'me' : 'ai');
    var inner = '';
    if (m.sys) {
      el.className = 'sys-msg';
      el.textContent = m.text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return;
    }
    if (m.role === 'ai') {
      inner += '<div class="ko-line">' + U.escape(m.ko) + '</div>';
      if (m.showRom && m.rom) inner += '<div class="rom-line">' + U.escape(m.rom) + '</div>';
      if (m.showZh && m.zh) inner += '<div class="zh-line">' + U.escape(m.zh) + '</div>';
    } else {
      inner += '<div class="ko-line">' + U.escape(m.ko) + '</div>';
      if (m.zh) inner += '<div class="zh-line">' + U.escape(m.zh) + '</div>';
    }
    el.innerHTML = '<div class="bubble">' + inner + '</div>' +
      '<div class="msg-time">' + nowTime() + '</div>' +
      (m.role === 'ai' ? '<div class="msg-actions">' +
        '<button class="msg-act" data-a="say">🔊 朗读</button>' +
        '<button class="msg-act" data-a="slow">🐢 慢速</button>' +
        (m.hidden ? '<button class="msg-act" data-a="open">👀 看翻译</button>' : '') +
        '<button class="msg-act" data-a="copy">📋 复制</button>' +
        '</div>' : '');
    el._m = m;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;

    $$('.msg-act', el).forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a'), mm = el._m;
        if (a === 'say') Speech.speak(mm.ko);
        else if (a === 'slow') Speech.speak(mm.ko, { slow: true });
        else if (a === 'open') {
          mm.showZh = true; mm.showRom = true; mm.hidden = false;
          var box = el.querySelector('.bubble');
          var html = '<div class="ko-line">' + U.escape(mm.ko) + '</div>';
          if (mm.rom) html += '<div class="rom-line">' + U.escape(mm.rom) + '</div>';
          if (mm.zh) html += '<div class="zh-line">' + U.escape(mm.zh) + '</div>';
          box.innerHTML = html;
          b.remove();
        } else if (a === 'copy') {
          try {
            navigator.clipboard.writeText(mm.ko);
            KC.toast('已复制韩语原文', 'ok');
          } catch (e) { KC.toast('复制失败，请手动选择', 'err'); }
        }
      };
    });
  };

  Chat.pushSys = function (text) { this.push({ sys: true, text: text }); };

  Chat.aiSay = function (r, opts) {
    var self = this;
    var lv = $('#chatLevel') ? $('#chatLevel').getAttribute('data-lv') || S.settings.chatLevel : S.settings.chatLevel;
    var m = { role: 'ai', ko: r.ko, rom: r.rom, zh: r.zh };
    if (lv === 'easy') { m.showRom = true; m.showZh = true; }
    else if (lv === 'normal') { m.showRom = true; m.showZh = true; }
    else { m.showRom = false; m.showZh = false; m.hidden = true; }

    $('#chatTyping').style.display = 'flex';
    $('#chatTyping').innerHTML = '<i></i><i></i><i></i> ' + self.idol.name + ' 입력 중…';
    var delay = Math.min(1600, 500 + (r.ko.length * 45));
    setTimeout(function () {
      $('#chatTyping').style.display = 'none';
      self.push(m);
      if (S.settings.autoSpeak) Speech.speak(r.ko);
      S.addStat('minutes', 1);
    }, delay);
  };

  /* ---------- 生成回复 ---------- */
  Chat.reply = function (text) {
    var t = String(text || '').trim();
    for (var i = 0; i < KC.CHAT_RULES.length; i++) {
      var r = KC.CHAT_RULES[i];
      if (r.re.test(t)) return U.pick(r.replies);
    }
    // 场景相关兜底：若提到具体场景关键词
    var scene = $('#chatScene') ? $('#chatScene').value : S.settings.scene;
    if (scene === 'cafe' && /주세요|얼마|커피/.test(t)) {
      return { ko: '네, 아메리카노 한 잔 나왔습니다! 맛있게 드세요.', rom: 'ne, amerikano han jan nawasseumnida! masitge deuseyo.', zh: '好的，一杯美式咖啡好了！请慢用。' };
    }
    return U.pick(KC.CHAT_FALLBACK);
  };

  /* ---------- 发送 ---------- */
  Chat.send = function (text) {
    var raw = String(text || $('#chatText').value || '').trim();
    if (!raw) return;
    // 只用韩语部分作为纠错对象
    var hangulPart = raw.split(/[\s，,。.!?！？]+/).filter(function (x) { return /[\uac00-\ud7a3]/.test(x); }).join(' ');

    var fx = null;
    if (S.settings.autoFix && hangulPart) {
      fx = KC.corrector.check(hangulPart);
    }

    var me = { role: 'me', ko: raw, zh: '' };
    if (fx && fx.hasIssue) {
      me.zh = '⚠️ 建议更正：' + (fx.corrected !== fx.original ? fx.corrected : hangulPart);
      S.addFix({
        src: fx.original, dst: fx.corrected, score: fx.score,
        issues: fx.issues.slice(0, 3)
      });
      this.renderFixes();
    } else if (hangulPart) {
      me.zh = '✅ 这句韩语看起来没问题';
    }
    this.push(me);
    $('#chatText').value = '';
    this.setTipDefault();

    var self = this;
    setTimeout(function () {
      var r = self.reply(hangulPart || raw);
      self.aiSay(r);
    }, 260);
  };

  /* ---------- 纠错面板 ---------- */
  Chat.renderFixes = function () {
    var box = $('#fixList');
    var list = S.data.fixes;
    $('#fixCount').textContent = list.length;
    if (!list.length) { box.innerHTML = '<div class="empty">还没有记录，说句话试试吧。</div>'; return; }
    box.innerHTML = list.map(function (f) {
      if (!f.issues || !f.issues.length) {
        return '<div class="fix-item fix-clean"><div class="fix-dst ko">' + U.escape(f.dst) + '</div>' +
          '<div class="fix-reason">✅ 没有问题</div></div>';
      }
      var first = f.issues[0];
      return '<div class="fix-item">' +
        '<div class="fix-src ko">' + KC.corrector.toHtml(f.src, f.dst) + '</div>' +
        '<div class="fix-dst ko">' + U.escape(f.dst) + '</div>' +
        '<div class="fix-reason"><span class="fix-type">' + U.escape(first.name || first.type) + '</span>' +
        U.escape(first.why) + '</div>' +
        (f.issues.length > 1 ? '<div class="fix-reason muted">还有 ' + (f.issues.length - 1) + ' 条建议…</div>' : '') +
        '</div>';
    }).join('');
  };

  /* ---------- 即时诊断（输入中） ---------- */
  Chat.liveCheck = function (text) {
    var el = $('#chatTip');
    if (!text.trim()) { this.setTipDefault(); return; }
    if (!S.settings.autoFix) return;
    if (!/[\uac00-\ud7a3]/.test(text)) { this.setTipDefault(); return; }
    var r = KC.corrector.check(text);
    if (!r.hasIssue) {
      el.innerHTML = '<span style="color:var(--green)">✅ 目前没有发现问题，发出去吧！</span>';
      return;
    }
    var i = r.issues[0];
    var shown = (r.corrected !== r.original) ? r.corrected : text;
    el.innerHTML = '<span style="color:var(--amber)">⚠️ ' + U.escape(i.name) + '：' +
      U.escape(i.why) + '</span> ｜ 建议：<b class="ko">' + U.escape(shown) + '</b>' +
      ' <button class="msg-act" id="btnApplyFix">用它替换</button>';
    var self = this;
    var btn = $('#btnApplyFix');
    if (btn) btn.onclick = function () {
      $('#chatText').value = shown;
      self.liveCheck(shown);
    };
  };

  Chat.setTipDefault = function () {
    $('#chatTip').innerHTML = '试着输入：<b>안녕</b> / <b>뭐 해?</b> / <b>오늘 날씨 어때?</b> / <b>한국어 공부하고 싶어</b>';
  };

  /* ---------- 清空 ---------- */
  Chat.clear = function () {
    this.msgs = [];
    $('#chatBody').innerHTML = '';
  };

  /* ---------- 初始化 ---------- */
  Chat.init = function () {
    // 场景与难度下拉
    var sc = $('#chatScene');
    sc.innerHTML = KC.CHAT_SCENES.map(function (s) {
      return '<option value="' + s.id + '">' + s.ko + ' · ' + s.cn + '</option>';
    }).join('');
    sc.value = S.settings.scene || 'free';
    sc.onchange = function () {
      S.settings.scene = sc.value; S.save();
      Chat.pushSys('场景切换：' + KC.CHAT_SCENES.filter(function (x) { return x.id === sc.value; })[0].cn);
    };

    $$('#chatLevel .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#chatLevel .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        S.settings.chatLevel = b.getAttribute('data-lv');
        S.save();
        KC.toast('难度：' + b.textContent.trim());
      };
      if (b.getAttribute('data-lv') === S.settings.chatLevel) {
        $$('#chatLevel .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      }
    });

    $('#tglAutoSpeak').checked = S.settings.autoSpeak;
    $('#tglAutoFix').checked = S.settings.autoFix;
    $('#tglAutoSpeak').onchange = function () { S.settings.autoSpeak = this.checked; S.save(); };
    $('#tglAutoFix').onchange = function () { S.settings.autoFix = this.checked; S.save(); };

    this.renderIdols();
    this.setIdol(S.settings.idol, true);
    this.renderFixes();
    this.setTipDefault();

    $('#btnChatSend').onclick = function () { Chat.send(); };
    $('#chatText').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') Chat.send();
    });
    $('#chatText').addEventListener('input', function () {
      clearTimeout(Chat._timer);
      Chat._timer = setTimeout(function () { Chat.liveCheck($('#chatText').value); }, 500);
    });

    $('#btnChatClear').onclick = function () {
      Chat.clear();
      Chat.pushSys('对话已清空');
      KC.toast('已清空');
    };

    $('#btnChatSuggest').onclick = function () {
      $('#chatText').value = U.pick(KC.SUGGESTIONS);
      Chat.liveCheck($('#chatText').value);
    };

    $('#btnChatMic').onclick = function () {
      if (!Speech.supportSTT) { KC.toast('浏览器不支持语音识别，建议用 Edge / Chrome', 'err'); return; }
      var btn = this;
      btn.textContent = '🎙️…';
      KC.toast('请说出你的韩语…');
      Speech.listen({
        lang: 'ko-KR', timeout: 12000,
        onresult: function (finalText, interim) {
          $('#chatText').value = finalText || interim;
        },
        onend: function (finalText) {
          btn.textContent = '🎤';
          if (finalText) {
            $('#chatText').value = finalText;
            Chat.liveCheck(finalText);
          }
        },
        onerror: function () { btn.textContent = '🎤'; }
      });
    };
  };

  Chat.enter = function () {
    if (!this.msgs.length) {
      this.pushSys('现在是和 ' + this.idol.name + ' 的韩语练习时间～');
      this.aiSay(U.pick(this.idol.greet));
    }
  };

})(window.KC);
