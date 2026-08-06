$shell = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$target = Join-Path (Get-Location) 'scripts\start-all.ps1'
$shortcutPath = Join-Path $desktop 'Turki AI OS.lnk'

$sc = $shell.CreateShortcut($shortcutPath)
$sc.TargetPath = 'powershell'
$sc.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$target`""
$sc.WorkingDirectory = Get-Location
$sc.IconLocation = "$env:windir\System32\imageres.dll,3"
$sc.Save()
Write-Host "Desktop shortcut created at $shortcutPath" -ForegroundColor Green
