#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""备用服务器（当电脑没有 Node.js 时使用）
用法: python serve.py   然后访问 http://<局域网IP>:8138/
多线程实现，避免手机并发请求被阻塞。
"""
import http.server
import socketserver
import os
import socket
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8138
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        pass  # 静默日志，保持界面干净

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def lan_ips():
    ips = []
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith('127.'):
                ips.append(ip)
    except Exception:
        pass
    if not ips:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('8.8.8.8', 80))
            ips.append(s.getsockname()[0])
            s.close()
        except Exception:
            pass
    return sorted(set(ips))


if __name__ == '__main__':
    with Server(('0.0.0.0', PORT), Handler) as httpd:
        print('')
        print('  韩语学习助手已启动 (Python)')
        print('  -------------------------------------')
        print('  本机访问:  http://127.0.0.1:%d/' % PORT)
        for ip in lan_ips():
            print('  手机访问:  http://%s:%d/   (需连同一个 WiFi)' % (ip, PORT))
        if not lan_ips():
            print('  未检测到局域网地址，请确认 WiFi 已连接')
        print('  -------------------------------------')
        print('  按 Ctrl+C 停止')
        print('')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n已停止')
