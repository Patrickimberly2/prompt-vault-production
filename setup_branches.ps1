# Setup Git Branches Script
# This script will:
# 1. Copy website files from prompt-vault-production to root
# 2. Commit as main branch
# 3. Push both branches to GitHub

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setting up Git Branches" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get current location
$rootDir = "c:\Users\KLHst\OneDrive\Documents\Prompt Organizer"
Set-Location $rootDir

# Make sure we're on temp-main branch
Write-Host "Switching to temp-main branch..." -ForegroundColor Yellow
git checkout temp-main

# Remove all files except .git, .venv, and prompt-vault-production
Write-Host "Cleaning root directory..." -ForegroundColor Yellow
Get-ChildItem -Path $rootDir -Exclude '.git','.venv','prompt-vault-production','setup_branches.ps1' | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Copy files from prompt-vault-production to root
Write-Host "Copying website files from prompt-vault-production..." -ForegroundColor Yellow
$sourceDir = Join-Path $rootDir "prompt-vault-production"
Get-ChildItem -Path $sourceDir -Exclude '.git','.next','node_modules' | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $rootDir -Recurse -Force
    Write-Host "  Copied: $($_.Name)" -ForegroundColor Green
}

# Add and commit
Write-Host "`nStaging files..." -ForegroundColor Yellow
git add -A

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "Add Prompt Vault Production website"

# Rename temp-main to main
Write-Host "`nSwitching to main branch..." -ForegroundColor Yellow
git branch -D main -ErrorAction SilentlyContinue
git branch -m temp-main main

# Push both branches
Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Yellow
git push origin main --force

Write-Host "`nPushing prompt-organizer branch to GitHub..." -ForegroundColor Yellow
git push origin prompt-organizer

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nBranches:" -ForegroundColor Cyan
Write-Host "  • main              - Prompt Vault Production website" -ForegroundColor White
Write-Host "  • prompt-organizer  - Migration tools" -ForegroundColor White
Write-Host "`nRepository: https://github.com/Patrickimberly2/prompt-vault-production`n" -ForegroundColor Cyan
