$ErrorActionPreference = 'Stop'

if ($env:SKIP_GOVERNANCE_AUDIT -eq 'true') {
    exit 0
}

[void][Console]::In.ReadToEnd()

$logDirectory = Join-Path 'logs' 'copilot/governance'
$logFile = Join-Path $logDirectory 'audit.log'
$blockFile = Join-Path $logDirectory 'blocked-prompt.json'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
Remove-Item -Path $blockFile -ErrorAction SilentlyContinue

$level = if ($env:GOVERNANCE_LEVEL) { $env:GOVERNANCE_LEVEL } else { 'standard' }
$event = [ordered]@{
    timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    event = 'session_start'
    governance_level = $level
    cwd = (Get-Location).Path
}

$event | ConvertTo-Json -Compress | Add-Content -Path $logFile -Encoding utf8
[Console]::Error.WriteLine("Governance audit active (level: $level)")
exit 0