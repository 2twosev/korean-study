/* =========================================================
   cloudtts.js — 云端发音（讯飞在线 TTS，WebSocket，浏览器直连）
   解决国产手机（OPPO/华为等）系统 TTS 无韩语、且国内无法下载
   Google 韩语语音的问题。无需后端，密钥仅存于本地浏览器。
   文档：https://www.xfyun.cn/doc/tts/online_tts/API.html
   ========================================================= */
(function (KC) {
  'use strict';

  var CloudTTS = KC.cloudtts = {
    cfg: { appId: '', apiKey: '', apiSecret: '', vcn: 'miya' },
    enabled: false,
    _audio: null,

    configure: function (c) {
      c = c || {};
      this.cfg.appId = c.appId || '';
      this.cfg.apiKey = c.apiKey || '';
      this.cfg.apiSecret = c.apiSecret || '';
      this.cfg.vcn = c.vcn || 'miya';
      this.enabled = !!c.enabled;
    },

    isConfigured: function () {
      return !!(this.cfg.appId && this.cfg.apiKey && this.cfg.apiSecret);
    },

    /* ---------- base64 / 编码工具 ---------- */
    _b64FromArrayBuffer: function (buf) {
      var bytes = new Uint8Array(buf), bin = '', chunk = 0x8000;
      for (var i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      return btoa(bin);
    },
    _utf8ToB64: function (str) {
      return this._b64FromArrayBuffer(new TextEncoder().encode(str).buffer);
    },

    /* ---------- 讯飞鉴权签名（HMAC-SHA256） ---------- */
    _sign: function (date) {
      var self = this;
      var sigOrigin = 'host: tts-api.xfyun.cn\ndate: ' + date + '\nGET /v2/tts HTTP/1.1';
      var enc = new TextEncoder();
      return crypto.subtle.importKey(
        'raw', enc.encode(self.cfg.apiSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      ).then(function (key) {
        return crypto.subtle.sign('HMAC', key, enc.encode(sigOrigin));
      }).then(function (sig) {
        return self._b64FromArrayBuffer(sig);
      });
    },

    /* ---------- 合成并播放 ---------- */
    speak: function (text, opts) {
      opts = opts || {};
      var self = this;
      if (!this.isConfigured()) return Promise.resolve(false);
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        KC.toast('云端发音需要 HTTPS 环境（当前页面非安全上下文）', 'err');
        return Promise.resolve(false);
      }
      text = String(text || '').trim();
      if (!text) return Promise.resolve(false);

      var date = new Date().toUTCString();
      return self._sign(date).then(function (signature) {
        var authOrigin = 'api_key="' + self.cfg.apiKey +
          '", algorithm="hmac-sha256", headers="host date request-line", signature="' + signature + '"';
        var authorization = btoa(authOrigin);
        var url = 'wss://tts-api.xfyun.cn/v2/tts?authorization=' +
          encodeURIComponent(authorization) + '&date=' + encodeURIComponent(date) +
          '&host=tts-api.xfyun.cn';

        return new Promise(function (resolve) {
          var ws, audioChunks = [], finished = false, done = false;
          function fin(ok) { if (!done) { done = true; resolve(ok); } }

          try { ws = new WebSocket(url); }
          catch (e) { KC.toast('无法连接云端发音服务', 'err'); fin(false); return; }

          ws.onopen = function () {
            if (opts.onstart) opts.onstart();
            var rate = (opts.rate != null ? opts.rate : 1.0) * (opts.slow ? 0.62 : 1);
            var speed = Math.max(0, Math.min(100, Math.round(rate * 50)));
            var vol = Math.max(0, Math.min(100, Math.round((opts.vol != null ? opts.vol : 1) * 100)));
            var pitch = Math.max(0, Math.min(100, Math.round((opts.pitch != null ? opts.pitch : 1) * 50)));
            var frame = {
              common: { app_id: self.cfg.appId },
              business: {
                aue: 'lame', sfl: 1, auf: 'audio/L16;rate=16000',
                vcn: self.cfg.vcn, tte: 'utf8',
                speed: speed, volume: vol, pitch: pitch
              },
              data: { status: 2, text: self._utf8ToB64(text) }
            };
            try { ws.send(JSON.stringify(frame)); }
            catch (e) { ws.close(); fin(false); }
          };

          ws.onmessage = function (ev) {
            try {
              var msg = JSON.parse(ev.data);
              if (msg.code && msg.code !== 0) {
                KC.toast('云端发音错误 ' + msg.code + '：' + (msg.message || ''), 'err');
                ws.close(); fin(false); return;
              }
              if (msg.data && msg.data.audio) audioChunks.push(msg.data.audio);
              if (msg.data && msg.data.status === 2) { finished = true; ws.close(); }
            } catch (e) { /* 忽略空帧 / 非 JSON 帧 */ }
          };

          ws.onerror = function () { KC.toast('云端发音连接失败，请检查网络', 'err'); fin(false); };

          ws.onclose = function () {
            if (finished && audioChunks.length) {
              var bin = atob(audioChunks.join(''));
              var bytes = new Uint8Array(bin.length);
              for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              var blob = new Blob([bytes], { type: 'audio/mpeg' });
              var a = new Audio();
              self._audio = a;
              a.src = URL.createObjectURL(blob);
              a.onended = function () { if (opts.onend) opts.onend(); fin(true); };
              a.onerror = function () { if (opts.onend) opts.onend(); fin(true); };
              var p = a.play();
              if (p && p.catch) p.catch(function () { if (opts.onend) opts.onend(); fin(true); });
            } else if (!done) {
              fin(false);
            }
          };
        });
      });
    },

    stop: function () {
      if (this._audio) { try { this._audio.pause(); } catch (e) { } }
    }
  };

})(window.KC);
