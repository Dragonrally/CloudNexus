$sensitivePatterns = @(".env*", "*.conf", "*.key", "keys/", "*secret*", "*.pem")
if (-not (Test-Path ".gitignore")) {
    New-Item -ItemType File -Name ".gitignore" | Out-Null
}
$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
foreach ($pattern in $sensitivePatterns) {
    if ($gitignoreContent -notcontains $pattern) {
        Add-Content -Path ".gitignore" -Value $pattern
    }
}

$msg = $args[0]
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "chore: update deployment"
}

git add .
git commit -m "$msg"

$remote = git remote | Select-String -Pattern "^CloudNexus$" -Quiet
if ($remote) {
    git push -u CloudNexus main
} else {
    git push -u origin main
}
