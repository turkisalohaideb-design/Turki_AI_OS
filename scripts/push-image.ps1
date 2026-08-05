Param(
  [string]$ImageName = "turki-ai-os-frontend:1.0.0",
  [ValidateSet('dockerhub','ghcr')]
  [string]$Registry = 'dockerhub'
)

# This script pushes the built image to the selected registry.
# It requires credentials via environment variables:
# For Docker Hub: $env:DOCKERHUB_USERNAME and $env:DOCKERHUB_PASSWORD
# For GHCR: $env:GHCR_OWNER (org or username) and $env:GHCR_TOKEN

function Fail($msg){ Write-Host $msg -ForegroundColor Red; exit 1 }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Fail 'Docker CLI not found. Install Docker to push images.' }

Write-Host "Preparing to push image $ImageName to $Registry" -ForegroundColor Cyan

# Build image first
Write-Host 'Building image locally...' -ForegroundColor Green
& powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-image.ps1 -ImageName $ImageName
if ($LASTEXITCODE -ne 0) { Fail 'Image build failed' }

if ($Registry -eq 'dockerhub') {
  $user = $env:DOCKERHUB_USERNAME
  $pass = $env:DOCKERHUB_PASSWORD
  if (-not $user -or -not $pass) { Fail 'DOCKERHUB_USERNAME or DOCKERHUB_PASSWORD not set in environment.' }

  Write-Host 'Logging in to Docker Hub...' -ForegroundColor Green
  $pass | docker login --username $user --password-stdin
  if ($LASTEXITCODE -ne 0) { Fail 'Docker login failed' }

  Write-Host 'Pushing image...' -ForegroundColor Green
  docker push $ImageName
  if ($LASTEXITCODE -ne 0) { Fail 'docker push failed' }

  Write-Host "Pushed $ImageName to Docker Hub" -ForegroundColor Green
  docker logout
} else {
  # GHCR
  $owner = $env:GHCR_OWNER
  $token = $env:GHCR_TOKEN
  if (-not $owner -or -not $token) { Fail 'GHCR_OWNER or GHCR_TOKEN not set in environment.' }

  $parts = $ImageName.Split(':')
  $tag = if ($parts.Count -gt 1) { $parts[-1] } else { 'latest' }
  $repo = ($parts[0])
  # GHCR requires images to be named like ghcr.io/OWNER/NAME:tag
  $ghcrName = "ghcr.io/$owner/$repo:$tag"

  Write-Host "Tagging image as $ghcrName" -ForegroundColor Green
  docker tag $ImageName $ghcrName

  Write-Host 'Logging in to GHCR...' -ForegroundColor Green
  $token | docker login ghcr.io --username $owner --password-stdin
  if ($LASTEXITCODE -ne 0) { Fail 'GHCR login failed' }

  Write-Host 'Pushing image to GHCR...' -ForegroundColor Green
  docker push $ghcrName
  if ($LASTEXITCODE -ne 0) { Fail 'docker push to ghcr failed' }

  Write-Host "Pushed $ghcrName to GHCR" -ForegroundColor Green
  docker logout ghcr.io
}

Write-Host 'Done.' -ForegroundColor Cyan
