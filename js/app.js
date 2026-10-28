/* =========================================================
   app.js — 路由、主页、设置、全局初始化
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util, $ = KC.$, $$ = KC.$$, S = KC.store, Speech = KC.speech;

  var App = KC.app = {
    page: 'home',
    presetId: 'clear'
  };

  var PAGE_META = {
    home: ['学习主页', '오늘도 한국어 공부해요! 今天也要学韩语哦'],
    listen: ['听力训练 듣기', '先听清楚，再写下来 —— 这是最快的进步方式'],
    speak: ['口语训练 말하기', '大声读出来，让系统给你的发音打分'],
    read: ['阅读理解 읽기', '字母、课文、生词本，一个都不能少'],
    write: ['写作训练 쓰기', '罗马音 → 韩文，动手拼写才记得牢'],
    music: ['歌曲精学 노래', '从 QQ 音乐导入你的歌单，边听边学'],
    chat: ['爱豆聊天 톡', '和你的练习伙伴对话，错误即时纠正'],
    settings: ['音色与设置 설정', '调节发音引擎、学习偏好与数据']
  };

  /* ---------- 路由 ---------- */
  App.go = function (page) {
    if (!PAGE_META[page]) page = 'home';
    this.page = page;
    $$('.nav-item').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-page') === page);
    });
    $$('.page').forEach(function (p) {
      p.classList.toggle('active', p.id === 'page-' + page);
    });
    var meta = PAGE_META[page];
    $('#pageTitle').textContent = meta[0];
    $('#pageSub').textContent = meta[1];
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* 部分环境不支持 */ }

    KC.learn.enter(page);
    if (page === 'music') KC.music.enter();
    if (page === 'chat') KC.chat.enter();
    if (page === 'home') App.renderHome();
    if (page === 'settings') App.renderDiag();
  };

  /* ---------- 主页 ---------- */
  App.renderHome = function () {
    $('#statWords').textContent = S.stats.words || 0;
    $('#statMin').textContent = S.stats.minutes || 0;
    $('#statSpeak').textContent = S.stats.speak || 0;
    $('#statVocab').textContent = S.data.vocab.length;
    $('#sidebarStreak').textContent = S.data.stats.streak || 0;

    $$('[data-skill]').forEach(function (i) {
      var k = i.getAttribute('data-skill');
      i.style.width = (S.stats.skill[k] || 0) + '%';
    });
  };

  App.renderDaily = function () {
    var d = U.pick(KC.DAILY);
    $('#dailyKo').textContent = d.ko;
    $('#dailyRom').textContent = d.rom;
    $('#dailyZh').textContent = d.zh;
    App._daily = d;
  };

  /* ---------- 设置：语音列表 ---------- */
  App.fillVoices = function () {
    var sel = $('#selVoice');
    if (!sel) return;
    var vs = Speech.listVoices();
    var cur = S.settings.voiceURI;
    if (!vs.length) {
      sel.innerHTML = '<option value="">（未检测到可用语音，请用 Edge / Chrome 打开）</option>';
      return;
    }
    sel.innerHTML = vs.map(function (v) {
      var flag = /^ko/i.test(v.lang) ? '🇰🇷 ' : /^zh/i.test(v.lang) ? '🇨🇳 ' : '🌐 ';
      return '<option value="' + U.escape(v.voiceURI) + '">' + flag + U.escape(v.name) + '（' + v.lang + '）</option>';
    }).join('');
    if (cur && vs.some(function (v) { return v.voiceURI === cur; })) sel.value = cur;
    else {
      var auto = Speech.autoVoice();
      if (auto) { sel.value = auto.voiceURI; S.settings.voiceURI = auto.voiceURI; S.save(); }
    }
    App.syncVoiceChip();
    App.checkEnv();
  };

  App.syncVoiceChip = function () {
    var v = Speech.currentVoice();
    if (v) $('#chipVoiceName').textContent = v.name.replace(/ - Korean| Korean| Korean \(Korea\)/i, '').slice(0, 18);
    else $('#chipVoiceName').textContent = '未检测到语音';
    // 同步预设高亮
    var st = S.settings;
    var hit = KC.VOICE_PRESETS.filter(function (p) {
      return Math.abs(p.pitch - st.pitch) < 0.02 && Math.abs(p.rate - st.rate) < 0.02;
    })[0];
    $$('.preset').forEach(function (p) {
      p.classList.toggle('active', !!hit && p.getAttribute('data-id') === hit.id);
    });
  };

  App.renderPresets = function () {
    var box = $('#presetGrid');
    if (!box) return;
    box.innerHTML = KC.VOICE_PRESETS.map(function (p) {
      return '<button class="preset" data-id="' + p.id + '" data-pitch="' + p.pitch + '" data-rate="' + p.rate + '">' +
        '<div class="preset-name">' + U.escape(p.name) + '</div>' +
        '<div class="preset-desc">' + U.escape(p.cn) + ' · ' + U.escape(p.desc) + '</div>' +
        '<div class="preset-bars">' +
        '<b style="width:' + ((p.pitch / 2) * 100) + '%"></b>' +
        '<b style="width:' + ((p.rate / 1.6) * 100) + '%"></b>' +
        '</div></button>';
    }).join('');
    $$('.preset', box).forEach(function (b) {
      b.onclick = function () {
        var pitch = parseFloat(b.getAttribute('data-pitch'));
        var rate = parseFloat(b.getAttribute('data-rate'));
        applyVoice({ pitch: pitch, rate: rate });
        Speech.speak($('#trialText').value || '안녕하세요');
        KC.toast('已应用：' + b.querySelector('.preset-name').textContent, 'ok');
      };
    });
  };

  function applyVoice(o) {
    S.settings.pitch = o.pitch;
    S.settings.rate = o.rate;
    if (o.vol != null) S.settings.vol = o.vol;
    Speech.updateSettings({ pitch: o.pitch, rate: o.rate, vol: S.settings.vol });
    $('#rngPitch').value = o.pitch; $('#valPitch').textContent = o.pitch.toFixed(2);
    $('#rngRate').value = o.rate; $('#valRate').textContent = o.rate.toFixed(2);
    S.save();
    App.syncVoiceChip();
  }

  /* ---------- 环境提示 ---------- */
  App.checkEnv = function () {
    var box = $('#envWarn');
    if (!box) return;
    var msgs = [];
    if (!Speech.synth) msgs.push('当前浏览器不支持语音合成（Speech Synthesis），请改用 Edge 或 Chrome。');
    else if (!Speech.koVoices().length) {
      msgs.push('未检测到韩语发音包，将使用其它语言语音朗读，发音可能不准。');
      msgs.push('Windows 修复：设置 → 时间和语言 → 语音 → 添加「한국어(Korean)」语音。');
    }
    if (!Speech.supportSTT) msgs.push('当前浏览器不支持网页语音识别，麦克风跟读打分不可用。');
    if (msgs.length) {
      box.innerHTML = msgs.map(function (m) { return '· ' + m; }).join('<br>');
      box.classList.add('show');
    } else {
      box.classList.remove('show');
    }
  };

  App.renderDiag = function () {
    var box = $('#diagBox');
    if (!box) return;
    var rows = Speech.diag();
    box.innerHTML = rows.map(function (r) {
      return '<div class="diag-row"><span class="diag-dot ' + r.level + '"></span>' + U.escape(r.text) + '</div>';
    }).join('');
  };

  /* ---------- 全局初始化 ---------- */
  App.init = function () {
    Speech.init();
    Speech.settings.pitch = S.settings.pitch;
    Speech.settings.rate = S.settings.rate;
    Speech.settings.vol = S.settings.vol;
    Speech.settings.voiceURI = S.settings.voiceURI;

    KC.learn.refreshLevels();
    KC.learn.init();
    KC.music.init();
    KC.chat.init();

    /* 导航 */
    $$('.nav-item').forEach(function (a) {
      a.onclick = function () { App.go(a.getAttribute('data-page')); };
    });
    $$('[data-goto]').forEach(function (el) {
      el.onclick = function () { App.go(el.getAttribute('data-goto')); };
    });

    /* hero 装饰字母 */
    var art = $('#heroArt');
    if (art) {
      var chars = ['한', '글', '공', '부'];
      art.innerHTML = '<div class="art-box">' + chars.map(function (c) {
        return '<div class="art-ch">' + c + '</div>';
      }).join('') + '</div>';
    }

    /* 每日一句 */
    App.renderDaily();
    $('#btnDailyPlay').onclick = function () { Speech.speak(App._daily.ko); };
    $('#btnDailySlow').onclick = function () { Speech.speak(App._daily.ko, { slow: true }); };
    $('#btnDailyNext').onclick = function () { App.renderDaily(); };
    $('#btnDailySave').onclick = function () {
      var d = App._daily;
      var ok = S.addVocab({ ko: d.ko, rom: d.rom, zh: d.zh, type: 'sentence' });
      KC.toast(ok ? '已加入生词本 ⭐' : '已在生词本里', ok ? 'ok' : '');
    };

    /* 设置页：语音 */
    App.fillVoices();
    App.renderPresets();
    document.addEventListener('kc:voicesready', function () { App.fillVoices(); KC.chat.setIdol(S.settings.idol, true); });

    var sel = $('#selVoice');
    sel.onchange = function () {
      S.settings.voiceURI = sel.value;
      Speech.updateSettings({ voiceURI: sel.value });
      S.save();
      App.syncVoiceChip();
      KC.toast('已切换发音人');
    };
    if (S.settings.voiceURI) sel.value = S.settings.voiceURI;

    /* 滑块 */
    function bindRange(id, key, label) {
      var el = $('#' + id);
      el.value = S.settings[key];
      $('#' + label).textContent = parseFloat(S.settings[key]).toFixed(2);
      el.addEventListener('input', function () {
        var v = parseFloat(el.value);
        S.settings[key] = v;
        $('#' + label).textContent = v.toFixed(2);
        var patch = {};
        patch[key] = v;
        Speech.updateSettings(patch);
        S.save();
        App.syncVoiceChip();
      });
    }
    bindRange('rngPitch', 'pitch', 'valPitch');
    bindRange('rngRate', 'rate', 'valRate');
    bindRange('rngVol', 'vol', 'valVol');

    $('#btnTrial').onclick = function () {
      Speech.speak($('#trialText').value || '안녕하세요');
    };
    $('#btnQuickVoice').onclick = function () {
      Speech.speak($('#trialText') ? ($('#trialText').value || '안녕하세요') : '안녕하세요');
    };

    /* 学习偏好 */
    $('#selDefLevel').value = S.settings.level;
    $('#selDefLevel').onchange = function () { S.settings.level = this.value; S.save(); KC.learn.refreshLevels(); KC.learn.listen.build(); KC.learn.write.build(); };
    $('#selQuizSize').value = String(S.settings.quizSize);
    $('#selQuizSize').onchange = function () {
      S.settings.quizSize = parseInt(this.value, 10); S.save();
      KC.learn.listen.build(); KC.learn.write.build();
    };
    $('#tglAutoNext').checked = S.settings.autoNext;
    $('#tglAutoNext').onchange = function () { S.settings.autoNext = this.checked; S.save(); };
    var tglRom = $('#tglRom');
    if (tglRom) { tglRom.checked = S.settings.alwaysRom; tglRom.onchange = function () { S.settings.alwaysRom = this.checked; S.save(); KC.learn.read.renderText(); }; }
    $('#tglClickRead').checked = S.settings.clickRead;
    $('#tglClickRead').onchange = function () { S.settings.clickRead = this.checked; S.save(); };

    /* 数据管理 */
    $('#btnExport').onclick = function () {
      var box = $('#dataBox');
      box.style.display = 'block';
      box.value = JSON.stringify(S.data, null, 2);
      box.select && box.select();
      KC.toast('已生成数据，可自行复制保存', 'ok');
    };
    $('#btnImport').onclick = function () {
      var box = $('#dataBox');
      if (box.style.display !== 'block') {
        box.style.display = 'block';
        box.value = '';
        KC.toast('请粘贴 JSON 后再次点击「导入」');
        return;
      }
      try {
        var obj = JSON.parse(box.value);
        Object.assign(S.data, obj);
        S.save();
        KC.toast('导入成功，正在刷新…', 'ok');
        setTimeout(function () { location.reload(); }, 700);
      } catch (e) {
        KC.toast('JSON 解析失败：' + e.message, 'err');
      }
    };
    $('#btnReset').onclick = function () {
      if (!confirm('确定要清空全部学习数据吗？（生词本、纠错记录、学习进度都会丢失）')) return;
      localStorage.removeItem('kc_study_v1');
      KC.toast('已清空，正在刷新…', 'ok');
      setTimeout(function () { location.reload(); }, 700);
    };

    App.renderDiag();
    App.renderHome();
    App.syncVoiceChip();

    /* 移动端语音解锁：首次触摸/点击时静音播一个音节，之后才能正常朗读 */
    ['touchstart', 'mousedown', 'click'].forEach(function (ev) {
      document.addEventListener(ev, function once() {
        Speech.unlock();
        document.removeEventListener(ev, once);
      }, { once: true, passive: true });
    });

    /* 全局热键：Ctrl+Enter 试读当前输入框 */
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        var el = document.activeElement;
        if (el && el.value) Speech.speak(el.value);
      }
    });

    KC.toast('欢迎回来！오늘도 화이팅 💜', 'ok');
  };

  document.addEventListener('DOMContentLoaded', function () {
    App.init();
    // 延迟再校验一次语音（部分环境异步加载）
    setTimeout(function () { App.fillVoices(); App.checkEnv(); App.renderDiag(); }, 800);
  });

})(window.KC);
