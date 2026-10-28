/* =========================================================
   music.js — QQ 音乐歌曲导入 + 歌词精学
   ========================================================= */
(function (KC) {
  'use strict';

  var U = KC.util, $ = KC.$, $$ = KC.$$, S = KC.store, Speech = KC.speech;

  /* ---------- 韩文 → 罗马音（修订罗马字简化版） ---------- */
  /* 注意：初声的 ㅇ 不发音（罗马中标示为空），终声的 ㅇ 才是 ng */
  var CHO_R = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  var JUNG_R = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  var JONG_R = ['', 'g', 'kk', 'k', 'n', 'nj', 'nh', 'd', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'b', 'p', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

  U.romanize = function (ko) {
    var out = '';
    for (var i = 0; i < ko.length; i++) {
      var code = ko.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        var c = code - 0xAC00;
        var cho = Math.floor(c / 588), jung = Math.floor((c % 588) / 28), jong = c % 28;
        out += CHO_R[cho] + JUNG_R[jung] + JONG_R[jong];
      } else if (code >= 0x3131 && code <= 0x3163) {
        out += ko[i]; // 单独字母原样输出
      } else {
        out += ko[i];
      }
    }
    return out;
  };

  /* ---------- 模块状态 ---------- */
  var Music = KC.music = {
    song: null,
    active: -1,
    playing: false
  };

  /* ---------- 解析：歌名提取 ---------- */
  function extractTitle(text) {
    var pats = [
      /《([^》]{1,40})》/,
      /「([^」]{1,40})」/,
      /『([^』]{1,40})』/,
      /\[([^\]]{1,40})\]\s*(?=\n|$)/,
      /^\s*(?:歌名|곡명|title)[:：]\s*(.+)$/im
    ];
    for (var i = 0; i < pats.length; i++) {
      var m = text.match(pats[i]);
      if (m && m[1] && m[1].trim()) return m[1].trim();
    }
    return '';
  }

  function extractArtist(text) {
    var m = text.match(/(?:歌手|演唱|artist|가수)[:：]\s*(.+)/i);
    if (m) return m[1].trim();
    return '';
  }

  function hasHangul(s) { return /[\uac00-\ud7a3]/.test(s); }

  /* LRC 时间轴 → 秒 */
  function parseTime(s) {
    var m = s.match(/(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?/);
    if (!m) return 0;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (m[3] ? parseFloat('0.' + m[3]) : 0);
  }

  /* ---------- 解析：歌词 ---------- */
  function parseLyrics(text) {
    var lines = text.split(/\r?\n/);
    var out = [];
    var pendingZh = null;

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i].trim();
      if (!raw) continue;
      if (/^\[?(ti|ar|al|by|offset|re|ve|au|length):/i.test(raw)) continue; // LRC 元数据
      // 剔除链接与歌名书名号后仍无韩文 → 判定为分享文案，跳过
      var probe = raw.replace(/https?:\/\/\S+/g, '')
        .replace(/《[^》]*》/g, '')
        .replace(/[「『【][^\]」』】]{1,40}[\]」』】]/g, '')
        .replace(/(?:分享|给你|分享给你|单曲|循环)[:：]?/g, '')
        .trim();
      if (!probe) continue;
      if (!hasHangul(probe)) continue;
      raw = raw.replace(/https?:\/\/\S+/g, '').trim(); // 去掉行内链接
      if (!raw) continue;
      if (/^\d+\s*$/.test(raw)) continue;

      var t = 0;
      var m = raw.match(/^\[+([0-9:.]{4,10})\]+(.*)$/);
      if (m) { t = parseTime(m[1]); raw = m[2].trim(); }
      raw = raw.replace(/^\[[0-9:.]+\]/g, '').trim();
      if (!raw) continue;

      // 双语同行的情況：韩语 + (翻译) 或 韩语 / 翻译
      var ko = raw, zh = '';
      var sp = raw.split(/\s{2,}|\s*[|｜\/]\s*/);
      if (sp.length >= 2) {
        var a = sp[0].trim(), b = sp[1].trim();
        if (hasHangul(a) && !hasHangul(b)) { ko = a; zh = b; }
        else if (!hasHangul(a) && hasHangul(b)) { ko = b; zh = a; }
      }
      // 括号里是中文
      var pm = ko.match(/^(.*?)\s*[（(]([^）)]{1,60})[）)]\s*$/);
      if (pm && !zh) { ko = pm[1].trim(); zh = pm[2].trim(); }

      if (!hasHangul(ko)) {
        // 无韩文：可能是上一句的翻译
        if (out.length && !out[out.length - 1].zh) out[out.length - 1].zh = ko;
        continue;
      }
      if (pendingZh && out.length) { out[out.length - 1].zh = pendingZh; pendingZh = null; }

      out.push({ t: t, ko: ko, zh: zh || '', rom: '' });
      pendingZh = zh ? null : null;
    }
    return out;
  }

  /* ---------- 主导入流程 ---------- */
  Music.import = function (text) {
    var src = String(text || '').trim();
    if (!src) { setStatus('请输入内容', 'err'); return false; }

    var title = extractTitle(src);
    var artist = extractArtist(src);

    /* 1) 先在内置库里模糊匹配 */
    if (title) {
      var hit = KC.SONGS.filter(function (s) {
        return s.title.indexOf(title) >= 0 || title.indexOf(s.title) >= 0;
      })[0];
      if (hit) {
        var lines = hit.lines.map(function (l) {
          return { t: l.t, ko: l.ko, zh: l.zh, rom: U.romanize(l.ko) };
        });
        loadSong({ title: hit.title, artist: hit.artist, tags: hit.tags, lines: lines });
        setStatus('已匹配内置曲目《' + hit.title + '》', 'ok');
        return true;
      }
    }

    /* 2) 解析粘贴的歌词 */
    var lines = parseLyrics(src);
    if (!lines.length) {
      setStatus('没有解析到歌词，请粘贴带韩语歌词的文本（每行一句）', 'err');
      return false;
    }
    lines.forEach(function (l) { l.rom = U.romanize(l.ko); });
    if (!title) title = '导入的歌曲';
    if (!artist) artist = '未知歌手';
    loadSong({ title: title, artist: artist, tags: ['自定义导入', lines.length + '句', '来源：QQ 音乐'], lines: lines });
    setStatus('成功导入 ' + lines.length + ' 句歌词', 'ok');
    KC.toast('导入成功！共 ' + lines.length + ' 句', 'ok');
    return true;
  };

  function loadSong(song) {
    Music.song = song;
    Music.active = -1;
    $('#musicResult').style.display = 'block';
    $('#songTitle').textContent = song.title;
    $('#songArtist').textContent = song.artist;
    $('#songCover').textContent = song.title.slice(0, 1);
    $('#songTags').innerHTML = song.tags.map(function (t, i) {
      return '<span class="tag' + (i === 0 ? ' p' : '') + '">' + U.escape(t) + '</span>';
    }).join('');
    $('#lyricCount').textContent = '共 ' + song.lines.length + ' 句';
    Music.renderStudy();
    Music.renderFill();
    Music.renderList();
    S.addStat('minutes', 1);
  }

  function setStatus(msg, type) {
    var el = $('#musicStatus');
    el.textContent = msg;
    el.className = 'import-status' + (type ? ' ' + type : '');
  }

  /* ---------- 逐句精学 ---------- */
  Music.renderStudy = function () {
    var s = this.song, box = $('#lyricStudy');
    if (!s) return;
    var showZh = true;
    box.innerHTML = s.lines.map(function (l, i) {
      return '<div class="lyric-card" data-i="' + i + '">' +
        '<div class="lyric-ko">' + U.escape(l.ko) + '</div>' +
        (l.rom ? '<div class="lyric-rom">' + U.escape(l.rom) + '</div>' : '') +
        (showZh && l.zh ? '<div class="lyric-zh">' + U.escape(l.zh) + '</div>' : '') +
        '<div class="lyric-tools">' +
        '<button class="msg-act" data-act="say" data-i="' + i + '">🔊 朗读</button>' +
        '<button class="msg-act" data-act="slow" data-i="' + i + '">🐢 慢速</button>' +
        '<button class="msg-act" data-act="mic" data-i="' + i + '">🎤 跟读</button>' +
        '<button class="msg-act" data-act="save" data-i="' + i + '">⭐ 收藏</button>' +
        (l.t ? '<span class="lyric-time">[' + fmt(l.t) + ']</span>' : '') +
        '</div></div>';
    }).join('');

    $$('.lyric-tools [data-act]', box).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var i = parseInt(b.getAttribute('data-i'), 10);
        var l = Music.song.lines[i];
        var card = b.closest('.lyric-card');
        var act = b.getAttribute('data-act');
        if (act === 'say') { activate(i); Speech.speak(l.ko); }
        else if (act === 'slow') { activate(i); Speech.speak(l.ko, { slow: true }); }
        else if (act === 'mic') { activate(i); Music.shadow(l, card); }
        else if (act === 'save') {
          var ok = S.addVocab({ ko: l.ko, zh: l.zh, rom: l.rom, type: 'lyric' });
          KC.toast(ok ? '已加入生词本 ⭐' : '已在生词本里', ok ? 'ok' : '');
        }
      };
    });

    $$('.lyric-card', box).forEach(function (c) {
      c.onclick = function () {
        var i = parseInt(c.getAttribute('data-i'), 10);
        activate(i);
        if (S.settings.clickRead) return;
        Speech.speak(Music.song.lines[i].ko);
      };
    });
  };

  function activate(i) {
    Music.active = i;
    $$('#lyricStudy .lyric-card').forEach(function (c, k) {
      c.classList.toggle('active', k === i);
    });
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  /* 单句跟读打分 */
  Music.shadow = function (l, card) {
    if (!Speech.supportSTT) { KC.toast('浏览器不支持语音识别', 'err'); return; }
    KC.toast('请跟读：' + l.ko);
    Speech.speak(l.ko).then(function () {
      KC.toast('现在到你了！');
      Speech.listen({
        lang: 'ko-KR', timeout: 12000,
        onend: function (said) {
          said = (said || '').trim();
          if (!said) { KC.toast('没听清再来一次', 'err'); return; }
          var sc = Math.round(U.similarity(said, l.ko) * 100);
          KC.toast('相似度 ' + sc + '%', sc >= 75 ? 'ok' : 'err');
          S.addStat('speak');
          var note = document.createElement('div');
          note.className = 'lyric-zh';
          note.style.color = sc >= 75 ? 'var(--green)' : 'var(--red)';
          note.textContent = '你的发音相似度 ' + sc + '%' + (said ? '（识别到：' + said + '）' : '');
          card.appendChild(note);
        }
      });
    });
  };

  /* ---------- 歌词填空 ---------- */
  Music.renderFill = function () {
    var s = this.song, box = $('#lyricFill');
    if (!s) return;
    var picking = s.lines.slice(0, 20);
    box.innerHTML = '<div style="font-size:12.5px;color:var(--txt3);margin-bottom:8px">根据上下文补全被遮住的单词，输入后回车检查。</div>';
    picking.forEach(function (l, i) {
      var words = l.ko.split(' ').filter(function (w) { return w.length > 1; });
      if (!words.length) return;
      var target = words[U.rand(words.length)];
      var idxer = 0;
      var html = l.ko.split(' ').map(function (w) {
        if (w === target && idxer === 0) { idxer++; return '<input class="fill-input" data-a="' + U.escape(target) + '" data-k="' + i + '">'; }
        return U.escape(w);
      }).join(' ');
      var row = document.createElement('div');
      row.className = 'fill-item';
      row.innerHTML = '<span class="fill-no">' + (i + 1) + '</span><span class="fill-line">' + html + '</span>' +
        (l.zh ? '<span style="font-size:12px;color:var(--txt3)">' + U.escape(l.zh) + '</span>' : '');
      box.appendChild(row);
    });
    $$('.fill-input', box).forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var a = inp.getAttribute('data-a');
        var ok = U.norm(inp.value) === U.norm(a);
        inp.classList.add(ok ? 'ok' : 'no');
        if (ok) KC.toast('正确！' + a, 'ok');
        else { inp.value = a; KC.toast('正确答案已填入：' + a, 'err'); }
      });
      inp.addEventListener('input', function () {
        inp.classList.remove('ok', 'no');
      });
    });
  };

  /* ---------- 完整歌词 ---------- */
  Music.renderList = function () {
    var s = this.song, box = $('#lyricList');
    if (!s) return;
    box.innerHTML = s.lines.map(function (l, i) {
      return '<div class="lyric-row" data-i="' + i + '">' +
        '<span class="t">' + (l.t ? fmt(l.t) : '') + '</span>' +
        '<span class="k">' + U.escape(l.ko) + '</span>' +
        (l.zh ? '<span class="z">' + U.escape(l.zh) + '</span>' : '') +
        '</div>';
    }).join('');
    $$('.lyric-row', box).forEach(function (r) {
      r.onclick = function () {
        var i = parseInt(r.getAttribute('data-i'), 10);
        Speech.speak(s.lines[i].ko);
      };
    });
  };

  /* ---------- 全曲朗读 ---------- */
  Music.playAll = function () {
    var s = this.song; if (!s) return;
    this.playing = true;
    var i = 0;
    function go() {
      if (!Music.playing || i >= s.lines.length) { Music.playing = false; return; }
      activate(i);
      var el = $$('#lyricStudy .lyric-card')[i];
      if (el) el.scrollIntoView({ block: 'nearest' });
      Speech.speak(s.lines[i].ko).then(function () {
        i++;
        setTimeout(go, 260);
      });
    }
    go();
  };

  Music.stop = function () {
    this.playing = false;
    Speech.stop();
  };

  /* ---------- 初始化 ---------- */
  Music.init = function () {
    $('#btnMusicImport').onclick = function () {
      Music.import($('#musicInput').value);
    };
    $('#btnMusicDemo').onclick = function () {
      var demo = U.pick(KC.SONGS);
      var lines = demo.lines.map(function (l) {
        return { t: l.t, ko: l.ko, zh: l.zh, rom: U.romanize(l.ko) };
      });
      loadSong({ title: demo.title, artist: demo.artist, tags: demo.tags, lines: lines });
      setStatus('已载入《' + demo.title + '》', 'ok');
    };
    $$('#lyricMode .seg-btn').forEach(function (b) {
      b.onclick = function () {
        $$('#lyricMode .seg-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var m = b.getAttribute('data-mode');
        $('#lyricStudy').style.display = m === 'study' ? 'flex' : 'none';
        $('#lyricFill').style.display = m === 'fill' ? 'block' : 'none';
        $('#lyricList').style.display = m === 'list' ? 'block' : 'none';
      };
    });
    $('#btnSongPlayAll').onclick = function () { Music.playAll(); };
    $('#btnSongStop').onclick = function () { Music.stop(); };
  };

  Music.enter = function () {
    if (!this.song) {
      // 首次进入给个范例
      var demo = KC.SONGS[1];
      var lines = demo.lines.map(function (l) {
        return { t: l.t, ko: l.ko, zh: l.zh, rom: U.romanize(l.ko) };
      });
      loadSong({ title: demo.title, artist: demo.artist, tags: demo.tags, lines: lines });
    }
  };

})(window.KC);
