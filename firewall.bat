@echo off
chcp 936 >nul
title 韩语学习助手 - 手机访问防火墙放行

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo   [权限不足]
  echo.
  echo   请右键点击本文件，选择"以管理员身份运行"。
  echo.
  pause
  exit /b 1
)

echo.
echo   正在放行 8138 端口...
echo.

netsh advfirewall firewall delete rule name="KoreanStudy-8138" >nul 2>&1
netsh advfirewall firewall add rule name="KoreanStudy-8138" dir=in action=allow protocol=TCP localport=8138 >nul

if errorlevel 1 (
  echo   [失败] 无法添加防火墙规则，请手动允许 node.exe 通过防火墙。
) else (
  echo   [成功] 端口 8138 已放行。
  echo.
  echo   现在双击"启动服务.bat"，手机就能连上了。
)
echo.
pause
