$ErrorActionPreference = 'Stop'

if ($env:SKIP_GOVERNANCE_AUDIT -eq 'true') {
    exit 0
}

[void][Console]::In.ReadToEnd()

$logDirectory = Join-Path 'logs' 'copilot/governance'
$logFile = Join-Path $logDirectory 'audit.log'
$blockFile = Join-Path $logDirectory 'blocked-prompt.json'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

$total = 0
$threats = 0

if (Test-Path $logFile) {
    $events = Get-Content -Path $logFile | Where-Object { $_.Trim() } | ForEach-Object {
        try { $_ | ConvertFrom-Json } catch { $null }
    } | Where-Object { $null -ne $_ }

    $sessionStart = $events | Where-Object { $_.event -eq 'session_start' } | Select-Object -Last 1
    if ($sessionStart) {
        $sessionEvents = $events | Where-Object { $_.timestamp -ge $sessionStart.timestamp }
    } else {
        $sessionEvents = $events
    }

    $total = @($sessionEvents).Count
    $threats = @($sessionEvents | Where-Object { $_.event -eq 'threat_detected' }).Count
}

$event = [ordered]@{
    timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    event = 'session_end'
    total_events = $total
    threats_detected = $threats
}

$event | ConvertTo-Json -Compress | Add-Content -Path $logFile -Encoding utf8

if ($threats -gt 0) {
    [Console]::Error.WriteLine("Session ended: $threats threat(s) detected in $total events")
} else {
    [Console]::Error.WriteLine("Session ended: $total events, no threats")
}

Remove-Item -Path $blockFile -ErrorAction SilentlyContinue

exit 0