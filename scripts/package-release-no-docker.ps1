Param(
  [string]$Version = "1.0.0"
)

$root = Get-Location
$releaseDir = Join-Path $root "release\turki-ai-os-$Version"
Write-Host "Preparing release bundle (no Docker build) in $releaseDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

# Copy important files
Copy-Item -Path .\docker-compose.yml -Destination $releaseDir -Force
Copy-Item -Path .\scripts\start-all.ps1 -Destination $releaseDir -Force
Copy-Item -Path .\scripts\stub-daemon.js -Destination $releaseDir -Force
Copy-Item -Path frontend\Dockerfile -Destination $releaseDir -Force
Copy-Item -Path README_RELEASE.md -Destination $releaseDir -Force

# Also copy source bundle (optional)
$srcDir = Join-Path $releaseDir 'source'
New-Item -ItemType Directory -Path $srcDir -Force | Out-Null
Copy-Item -Path frontend\ -Destination $srcDir -Recurse -Force
Copy-Item -Path .\ -Exclude release -Destination $srcDir -Recurse -Force

# Create zip
$zipPath = Join-Path $root "release\turki-ai-os-$Version-no-docker.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($releaseDir, $zipPath)
Write-Host "Release bundle created: $zipPath" -ForegroundColor Green
