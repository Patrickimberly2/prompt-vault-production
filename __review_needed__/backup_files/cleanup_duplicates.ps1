$root = "C:\Users\KLHst\OneDrive\Documents\GitHub\prompt-vault-production"
Set-Location $root

$review = "__review_needed__"
if (!(Test-Path $review)) { New-Item -ItemType Directory -Path $review | Out-Null }

# Duplicate patterns
$patterns = @(
    "* (copy).*",
    "*copy*",
    "*(1).*",
    "*(2).*"
)

foreach ($pattern in $patterns) {
    Get-ChildItem -Recurse -File -Filter $pattern | ForEach-Object {
        $dest = Join-Path $review $_.Name
        Move-Item $_.FullName $dest -Force
        Write-Host "Moved: $($_.Name)"
    }
}
