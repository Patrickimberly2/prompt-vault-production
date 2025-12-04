# ========== Prompt Vault Cleanup Script ==========
# Moves suspected duplicate files into __review_needed__

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$ReviewFolder = "__review_needed__"
if (!(Test-Path $ReviewFolder)) {
    New-Item -ItemType Directory -Path $ReviewFolder | Out-Null
}

$Patterns = @(
    "*copy*",
    "*Copy*",
    "*COPY*",
    "*(1)*",
    "*(2)*",
    "* - Copy*",
    "*_copy*",
    "*_old*",
    "*old*",
    "*backup*",
    "*_final*",
    "*_final2*",
    "*_fixed*",
    "*_edited*"
)

$LogFile = "cleanup_log.txt"
"=== Cleanup started: $(Get-Date) ===" | Out-File $LogFile -Append

foreach ($pattern in $Patterns) {
    $matches = Get-ChildItem -Recurse -File -Filter $pattern
    foreach ($file in $matches) {
        $destination = Join-Path $ReviewFolder $file.Name
        Move-Item -Path $file.FullName -Destination $destination -Force
        "Moved: $($file.FullName) ➝ $destination" | Out-File $LogFile -Append
    }
}

"=== Cleanup complete: $(Get-Date) ===" | Out-File $LogFile -Append
Write-Host "Cleanup complete. Review files inside: $ReviewFolder"
