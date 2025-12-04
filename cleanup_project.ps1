# PromptVault Production - Comprehensive Cleanup Script
# Run this from: C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PromptVault Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Define base path
$basePath = Get-Location

# Create review folder if it doesn't exist
$reviewFolder = Join-Path $basePath "__review_needed__"
if (-not (Test-Path $reviewFolder)) {
    New-Item -ItemType Directory -Path $reviewFolder -Force | Out-Null
    Write-Host "✓ Created __review_needed__ folder" -ForegroundColor Green
}

# Create organized subfolders in review
$reviewSubfolders = @(
    "old_scripts",
    "duplicate_configs",
    "old_docs",
    "duplicate_prompts",
    "backup_files"
)

foreach ($subfolder in $reviewSubfolders) {
    $path = Join-Path $reviewFolder $subfolder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

Write-Host ""
Write-Host "STEP 1: Cleaning build artifacts and caches" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# Remove .next build cache (should never be committed)
if (Test-Path ".next") {
    Write-Host "→ Removing .next build cache..." -ForegroundColor Gray
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed .next cache" -ForegroundColor Green
}

# Remove node_modules from PromptVault_2.0_Scripts (nested duplicate)
$nestedNodeModules = "PromptVault_2.0_Scripts\node_modules"
if (Test-Path $nestedNodeModules) {
    Write-Host "→ Removing nested node_modules from PromptVault_2.0_Scripts..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $nestedNodeModules -ErrorAction SilentlyContinue
    Write-Host "✓ Removed nested node_modules" -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 2: Moving duplicate documentation to review" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow

# Move duplicate docs from PromptVault_2.0_Scripts
$docsToMove = @(
    "PromptVault_2.0_Scripts\README.md",
    "PromptVault_2.0_Scripts\QUICKSTART.md",
    "PromptVault_2.0_Scripts\START_HERE.md",
    "PromptVault_2.0_Scripts\FULL_AUTO_GUIDE.md",
    "PromptVault_2.0_Scripts\MIGRATION_CHECKLIST.md",
    "PromptVault_2.0_Scripts\EXCEL_IMPORT_GUIDE.md",
    "PromptVault_2.0_Scripts\PROCESS_LOCAL_EXPORT_GUIDE.md",
    "PromptVault_2.0_Scripts\FIX_PROXY_ERROR.md"
)

foreach ($doc in $docsToMove) {
    if (Test-Path $doc) {
        $fileName = Split-Path $doc -Leaf
        $destination = Join-Path "$reviewFolder\old_docs" $fileName
        Move-Item -Path $doc -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Moved $fileName to review/old_docs" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "STEP 3: Moving duplicate config files" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Move duplicate configs from PromptVault_2.0_Scripts
$configsToMove = @(
    "PromptVault_2.0_Scripts\next.config.js",
    "PromptVault_2.0_Scripts\package.json",
    "PromptVault_2.0_Scripts\package-lock.json",
    "PromptVault_2.0_Scripts\postcss.config.js",
    "PromptVault_2.0_Scripts\tailwind.config.js",
    "PromptVault_2.0_Scripts\.gitignore"
)

foreach ($config in $configsToMove) {
    if (Test-Path $config) {
        $fileName = Split-Path $config -Leaf
        $destination = Join-Path "$reviewFolder\duplicate_configs" "scripts_$fileName"
        Move-Item -Path $config -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Moved $fileName to review/duplicate_configs" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "STEP 4: Organizing migration scripts" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Create scripts folder if it doesn't exist
$scriptsFolder = "scripts"
if (-not (Test-Path $scriptsFolder)) {
    New-Item -ItemType Directory -Path $scriptsFolder -Force | Out-Null
    Write-Host "✓ Created /scripts folder" -ForegroundColor Green
}

# Create subfolders in scripts
$scriptSubfolders = @(
    "migration",
    "sync",
    "utils"
)

foreach ($subfolder in $scriptSubfolders) {
    $path = Join-Path $scriptsFolder $subfolder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Move Python scripts to organized locations
$migrationScripts = @(
    "PromptVault_2.0_Scripts\migrate_notion_enhanced.py",
    "PromptVault_2.0_Scripts\migrate_notion_to_supabase.py",
    "PromptVault_2.0_Scripts\run_full_migration.py",
    "PromptVault_2.0_Scripts\monitor_migration.py"
)

foreach ($script in $migrationScripts) {
    if (Test-Path $script) {
        $fileName = Split-Path $script -Leaf
        $destination = Join-Path "scripts\migration" $fileName
        Copy-Item -Path $script -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Copied $fileName to scripts/migration" -ForegroundColor Green
    }
}

$syncScripts = @(
    "PromptVault_2.0_Scripts\import_collection.py",
    "PromptVault_2.0_Scripts\import_excel.py",
    "PromptVault_2.0_Scripts\import_excel_advanced.py",
    "PromptVault_2.0_Scripts\process_local_export.py"
)

foreach ($script in $syncScripts) {
    if (Test-Path $script) {
        $fileName = Split-Path $script -Leaf
        $destination = Join-Path "scripts\sync" $fileName
        Copy-Item -Path $script -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Copied $fileName to scripts/sync" -ForegroundColor Green
    }
}

$utilScripts = @(
    "PromptVault_2.0_Scripts\verify_setup.py",
    "PromptVault_2.0_Scripts\view_stats.py",
    "PromptVault_2.0_Scripts\cleanup_and_organize.py"
)

foreach ($script in $utilScripts) {
    if (Test-Path $script) {
        $fileName = Split-Path $script -Leaf
        $destination = Join-Path "scripts\utils" $fileName
        Copy-Item -Path $script -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Copied $fileName to scripts/utils" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "STEP 5: Moving SQL files to supabase folder" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# Create supabase folder structure
$supabaseFolder = "supabase"
if (-not (Test-Path $supabaseFolder)) {
    New-Item -ItemType Directory -Path $supabaseFolder -Force | Out-Null
}

$migrationsFolder = Join-Path $supabaseFolder "migrations"
if (-not (Test-Path $migrationsFolder)) {
    New-Item -ItemType Directory -Path $migrationsFolder -Force | Out-Null
    Write-Host "✓ Created supabase/migrations folder" -ForegroundColor Green
}

# Move SQL files
$sqlFiles = @(
    "PromptVault_2.0_Scripts\supabase_schema.sql",
    "PromptVault_2.0_Scripts\fresh_start.sql",
    "PromptVault_2.0_Scripts\migrate_existing_prompts_table.sql",
    "PromptVault_2.0_Scripts\check_existing_schema.sql"
)

foreach ($sqlFile in $sqlFiles) {
    if (Test-Path $sqlFile) {
        $fileName = Split-Path $sqlFile -Leaf
        $destination = Join-Path $migrationsFolder $fileName
        Copy-Item -Path $sqlFile -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Copied $fileName to supabase/migrations" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "STEP 6: Handling duplicate GitHub workflows" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# List duplicate workflows (keep the most recent version)
$workflowsPath = ".github\workflows"
if (Test-Path $workflowsPath) {
    $duplicateWorkflows = @(
        "$workflowsPath\unpack-and-merge-zips.yml",
        "$workflowsPath\unpack-merge-zips.yml"
    )
    
    foreach ($workflow in $duplicateWorkflows) {
        if (Test-Path $workflow) {
            $fileName = Split-Path $workflow -Leaf
            $destination = Join-Path "$reviewFolder\backup_files" $fileName
            Move-Item -Path $workflow -Destination $destination -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Moved duplicate workflow $fileName to review" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "STEP 7: Moving entire PromptVault_2.0_Scripts folder to review" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Yellow

# After copying needed files, move the entire folder to review
$scriptsFolder = "PromptVault_2.0_Scripts"
if (Test-Path $scriptsFolder) {
    $destination = Join-Path $reviewFolder "PromptVault_2.0_Scripts_OLD"
    Move-Item -Path $scriptsFolder -Destination $destination -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Moved PromptVault_2.0_Scripts to review folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 8: Cleaning up root-level clutter" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

# Move cleanup logs and temp files
$rootClutter = @(
    "cleanup_duplicates.ps1",
    "cleanup_log.txt",
    "file_structure.txt",
    "setup_branches.ps1"
)

foreach ($file in $rootClutter) {
    if (Test-Path $file) {
        $destination = Join-Path "$reviewFolder\backup_files" $file
        Move-Item -Path $file -Destination $destination -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Moved $file to review" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review files in __review_needed__ folder" -ForegroundColor White
Write-Host "2. Update .gitignore (see .gitignore_recommended.txt)" -ForegroundColor White
Write-Host "3. Run: npm install (to rebuild node_modules)" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White
Write-Host "5. Commit changes to GitHub" -ForegroundColor White
Write-Host ""
