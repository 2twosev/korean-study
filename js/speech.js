/* =========================================================
   speech.js — 发音引擎：TTS 合成 / STT 语音识别
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util;
  var Speech = KC.speech = {
    synth: window.speechSynthesis || null,
    voices: [],
    ready: false,
    settings: { voiceURI: '', pitch: 1.0, rate: 0.95, vol: 1.0 },
    _recog: null,
    _listening: false
  };

  /* ---------- 初始化 ---------- */
  Speech.init = function () {
    if (!Speech.synth) return;
    Speech.loadVoices();
    Speech.synth.onvoiceschanged = Speech.loadVoices;
    // 部分浏览器需要延迟再取一次
    setTimeout(Speech.loadVoices, 300);
    setTimeout(Speech.loadVoices, 1200);
  };

  Speech.loadVoices = function () {
    if (!Speech.synth) return;
    var vs = Speech.synth.getVoices() || [];
    if (!vs.length) return;
    Speech.voices = vs;
    Speech.ready = true;
    document.dispatchEvent(new CustomEvent('kc:voicesready'));
  };

  /* 全部可用语音，韩语优先排序 */
  Speech.listVoices = function () {
    if (!Speech.ready) Speech.loadVoices();
    var vs = Speech.voices.slice();
    vs.sort(function (a, b) {
      var ak = /^ko/i.test(a.lang) ? 0 : 1;
      var bk = /^ko/i.test(b.lang) ? 0 : 1;
      if (ak !== bk) return ak - bk;
      return a.name.localeCompare(b.name);
    });
    return vs;
  };

  Speech.koVoices = function () {
    return Speech.listVoices().filter(function (v) { return /^ko/i.test(v.lang); });
  };

  Speech.findVoice = function (uri) {
    return Speech.listVoices().filter(function (v) { return v.voiceURI === uri; })[0] || null;
  };

  /* 自动挑选：优先韩语 → 中文 → 任意 */
  Speech.autoVoice = function () {
    var v = Speech.koVoices()[0];
    if (v) return v;
    var list = Speech.listVoices();
    var zh = list.filter(function (x) { return /^zh/i.test(x.lang); })[0];
    return zh || list[0] || null;
  };

  Speech.currentVoice = function () {
    var v = Speech.findVoice(Speech.settings.voiceURI);
    if (v) return v;
    var auto = Speech.autoVoice();
    if (auto) Speech.settings.voiceURI = auto.voiceURI;
    return auto;
  };

  Speech.updateSettings = function (s) {
    Object.assign(Speech.settings, s || {});
    document.dispatchEvent(new CustomEvent('kc:voicechange'));
  };

  /* ---------- 移动端解锁 ----------
     iOS Safari / 部分安卓浏览器要求：第一次 speak 必须发生在「用户手势」里，
     否则之后所有（包括异步的）朗读都会被静默丢弃。这里在首次触摸/点击时
     播一个静音音节完成解锁。 */
  Speech._unlocked = false;
  Speech.unlock = function () {
    if (Speech._unlocked || !Speech.synth) return;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.rate = 2;
      Speech.synth.speak(u);
      Speech._unlocked = true;
    } catch (e) { /* ignore */ }
    Speech.loadVoices();
  };

  /* 等待语音列表就绪（移动端加载较慢） */
  Speech.ensureVoices = function () {
    return new Promise(function (resolve) {
      if (Speech.voices && Speech.voices.length) return resolve(Speech.voices);
      var tries = 0;
      var timer = setInterval(function () {
        Speech.loadVoices();
        if ((Speech.voices && Speech.voices.length) || ++tries >= 10) {
          clearInterval(timer);
          resolve(Speech.voices || []);
        }
      }, 150);
    });
  };

  /* ---------- 朗读 ---------- */
  /**
   * @param {string} text
   * @param {object} opts {pitch,rate,vol,voiceURI,onstart,onend,slow}
   */
  Speech.speak = function (text, opts) {
    return Speech.ensureVoices().then(function () {
      return doSpeak(text, opts);
    });
  };

  function doSpeak(text, opts) {
    return new Promise(function (resolve) {
      opts = opts || {};
      if (!Speech.synth) { resolve(false); return; }
      text = String(text || '').trim();
      if (!text) { resolve(false); return; }

      try {
        // iOS 上若正在朗读时直接 cancel 再 speak，下一句常常被静默吞掉；
        // 只在确实有播放/排队时才取消，避免误伤。
        if (Speech.synth.speaking || Speech.synth.pending) Speech.synth.cancel();
      } catch (e) { /* ignore */ }

      var utter = new SpeechSynthesisUtterance(text);
      var v = opts.voiceURI ? Speech.findVoice(opts.voiceURI) : null;
      v = v || Speech.currentVoice();
      if (v) utter.voice = v;

      utter.lang = (v && v.lang) || 'ko-KR';
      utter.pitch = U.clamp(opts.pitch != null ? opts.pitch : Speech.settings.pitch, 0, 2);
      var rate = opts.rate != null ? opts.rate : Speech.settings.rate;
      if (opts.slow) rate = rate * 0.62;
      utter.rate = U.clamp(rate, 0.1, 2);
      utter.volume = U.clamp(opts.vol != null ? opts.vol : Speech.settings.vol, 0, 1);

      var done = false;
      function fin(ok) { if (!done) { done = true; resolve(ok); } }
      utter.onstart = function () { if (opts.onstart) opts.onstart(); };
      utter.onend = function () { if (opts.onend) opts.onend(); fin(true); };
      utter.onerror = function () { if (opts.onend) opts.onend(); fin(false); };

      try {
        Speech.synth.speak(utter);
      } catch (e) {
        fin(false);
      }
      // 兜底：某些环境 onend 不触发
      var ms = Math.min(30000, Math.max(4000, text.length * 420));
      setTimeout(function () { fin(true); }, ms);
    });
  }

  /* 朗读任意元素中的韩语文本 */
  Speech.speakEl = function (el) {
    var t = el.getAttribute('data-say') || el.textContent;
    Speech.speak(t.trim());
  };

  Speech.stop = function () {
    if (Speech.synth) { try { Speech.synth.cancel(); } catch (e) { } }
  };

  Speech.isSpeaking = function () {
    return Speech.synth ? Speech.synth.speaking : false;
  };

  /* ---------- 语音识别 (STT) ---------- */
  Speech.supportSTT = (function () {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  })();

  /**
   * opts: {lang, interim, timeout, onresult, onerror, onend}
   * 返回一个 controller: {abort}
   */
  Speech.listen = function (opts) {
    opts = opts || {};
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (opts.onerror) opts.onerror('unsupported');
      return { abort: function () { }, unsupported: true };
    }

    var rec = new SR();
    Speech._recog = rec;
    rec.lang = opts.lang || 'ko-KR';
    rec.interimResults = opts.interim !== false;
    rec.continuous = !!opts.continuous;
    rec.maxAlternatives = 3;

    var finalText = '';
    var done = false;
    var timer = null;

    function cleanup() {
      if (timer) { clearTimeout(timer); timer = null; }
      Speech._listening = false;
      try { rec.abort(); } catch (e) { }
    }

    rec.onresult = function (ev) {
      var interim = '';
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (opts.onresult) opts.onresult(finalText, interim);
      if (!rec.interimResults) return;
      if (opts.continuous !== true) {
        if (!rec.interimResults) { clearTimeout(timer); timer = setTimeout(finish, 450); }
      }
    };

    rec.onerror = function (ev) {
      // no-speech / aborted 属于正常结束，不当成错误
      if (ev.error === 'no-speech' || ev.error === 'aborted') {
        if (opts.onend) opts.onend(finalText);
        cleanup();
        return;
      }
      if (opts.onerror) opts.onerror(ev.error);
      cleanup();
    };

    rec.onend = function () {
      if (done) return;
      done = true;
      // 部分浏览器 onresult 已给了最终结果，这里补足回传
      if (opts.onend) opts.onend(finalText);
      cleanup();
    };

    function finish() { if (!done) { done = true; cleanup(); } }

    try {
      rec.start();
      Speech._listening = true;
      if (opts.timeout) timer = setTimeout(finish, opts.timeout);
    } catch (e) {
      if (opts.onerror) opts.onerror('start-failed');
    }

    return {
      abort: function () {
        done = true;
        cleanup();
        if (opts.onend) opts.onend(finalText);
      }
    };
  };

  Speech.stopListen = function () {
    if (Speech._recog) { try { Speech._recog.abort(); } catch (e) { } }
    Speech._listening = false;
  };

  /* ---------- 环境自检 ---------- */
  Speech.diag = function () {
    var out = [];
    out.push({
      ok: !!Speech.synth,
      level: Speech.synth ? 'ok' : 'err',
      text: '语音合成 (Web Speech API)：' + (Speech.synth ? '支持' : '不支持，请换用 Edge / Chrome')
    });
    var ko = Speech.koVoices();
    var isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || '');
    out.push({
      ok: ko.length > 0,
      level: ko.length ? 'ok' : 'warn',
      text: '韩语发音包：' + (ko.length ? ('已找到 ' + ko.length + ' 个韩语语音') :
        '未检测到韩语语音 —— ' + (isMobile
          ? '手机需安装韩语语音：iOS「设置 → 辅助功能 → 朗读内容 → 声音 → 한국어 下载」；安卓「设置 → 系统 → 语言和输入法 → 文字转语音 → 安装韩语」'
          : 'Windows 可在「设置 → 时间和语言 → 语音」安装 Korean 语音包'))
    });
    out.push({
      ok: Speech.supportSTT,
      level: Speech.supportSTT ? 'ok' : 'warn',
      text: '语音识别（麦克风跟读）：' + (Speech.supportSTT ? '支持' : '当前浏览器不支持，建议 Edge / Chrome')
    });
    /* 安全上下文检测：麦克风只有在 https 或 localhost 下才可用 */
    var host = location.hostname || '';
    var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '';
    var secure = !!window.isSecureContext;
    var micOk = secure && Speech.supportSTT;
    out.push({
      ok: micOk,
      level: micOk ? 'ok' : (secure ? 'warn' : 'warn'),
      text: '麦克风可用条件：' + (secure ? '满足（安全上下文）' : '不满足') +
        (secure ? '' : ' — 当前通过 http://' + host + ' 访问，浏览器会禁用麦克风。' +
          '手机请用 https 链接访问，电脑请用 localhost。') +
        (secure && !Speech.supportSTT ? '（但浏览器不支持语音识别接口）' : '')
    });
    out.push({
      ok: !location.protocol.startsWith('file'),
      level: location.protocol.startsWith('file') ? 'warn' : 'ok',
      text: '运行方式：' + (location.protocol.startsWith('file')
        ? 'file:// 直接打开（麦克风不可用，建议用 node serve.js 启动）'
        : location.protocol.replace(':', '') + ' 方式运行')
    });
    if (isMobile) {
      out.push({
        ok: Speech._unlocked,
        level: Speech._unlocked ? 'ok' : 'warn',
        text: '手机语音解锁：' + (Speech._unlocked
          ? '已完成（可以朗读）'
          : '尚未解锁 —— 请点击页面任意按钮一次，手机浏览器要求首次发声必须由用户点击触发')
      });
      out.push({
        ok: true,
        level: 'warn',
        text: 'iPhone 注意：机身左侧的「静音键」会静音所有网页语音，听不到声音时请先关闭静音'
      });
    }
    return out;
  };

})(window.KC);
