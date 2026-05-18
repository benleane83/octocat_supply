$ErrorActionPreference = 'Stop'

if ($env:SKIP_GOVERNANCE_AUDIT -eq 'true') {
    exit 0
}

[void][Console]::In.ReadToEnd()

$logDirectory = Join-Path 'logs' 'copilot/governance'
$blockFile = Join-Path $logDirectory 'blocked-prompt.json'

if (-not (Test-Path $blockFile)) {
    exit 0
}

try {
    $block = Get-Content -Path $blockFile -Raw | ConvertFrom-Json
    $reason = if ($block.reason) { [string]$block.reason } else { 'Prompt blocked by governance policy.' }
} catch {
    $reason = 'Prompt blocked by governance policy.'
}

[Console]::Error.WriteLine($reason)
[ordered]@{
    permissionDecision = 'deny'
    permissionDecisionReason = $reason
    hookSpecificOutput = [ordered]@{
        hookEventName = 'PreToolUse'
        permissionDecision = 'deny'
        permissionDecisionReason = $reason
    }
} | ConvertTo-Json -Compress -Depth 5 | Write-Output

exit 0