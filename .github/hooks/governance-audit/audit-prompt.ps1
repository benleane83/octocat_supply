$ErrorActionPreference = 'Stop'

if ($env:SKIP_GOVERNANCE_AUDIT -eq 'true') {
    exit 0
}

$inputText = [Console]::In.ReadToEnd()
$logDirectory = Join-Path 'logs' 'copilot/governance'
$logFile = Join-Path $logDirectory 'audit.log'
$blockFile = Join-Path $logDirectory 'blocked-prompt.json'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
Remove-Item -Path $blockFile -ErrorAction SilentlyContinue

$level = if ($env:GOVERNANCE_LEVEL) { $env:GOVERNANCE_LEVEL } else { 'standard' }
$block = if ($env:BLOCK_ON_THREAT) { $env:BLOCK_ON_THREAT } else { 'false' }
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

$prompt = ''
try {
    $inputJson = $inputText | ConvertFrom-Json
    if ($inputJson.prompt) {
        $prompt = [string]$inputJson.prompt
    } elseif ($inputJson.userMessage) {
        $prompt = [string]$inputJson.userMessage
    }
} catch {
    $prompt = ''
}

if ([string]::IsNullOrWhiteSpace($prompt)) {
    $prompt = $inputText
}

$threatsFound = New-Object System.Collections.Generic.List[object]

function Add-ThreatIfMatched {
    param(
        [string]$Pattern,
        [string]$Category,
        [double]$Severity,
        [string]$Description
    )

    $match = [regex]::Match($script:prompt, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    if ($match.Success) {
        $script:threatsFound.Add([pscustomobject][ordered]@{
            category = $Category
            severity = $Severity
            description = $Description
            evidence = $match.Value
        })
    }
}

Add-ThreatIfMatched 'send\s+(all|every|entire)\s+\w+\s+to\s+' 'data_exfiltration' 0.8 'Bulk data transfer'
Add-ThreatIfMatched 'export\s+.*\s+to\s+(external|outside|third[_-]?party)' 'data_exfiltration' 0.9 'External export'
Add-ThreatIfMatched 'curl\s+.*\s+-d\s+' 'data_exfiltration' 0.7 'HTTP POST with data'
Add-ThreatIfMatched 'upload\s+.*\s+(credentials|secrets|keys)' 'data_exfiltration' 0.95 'Credential upload'

Add-ThreatIfMatched '(sudo|as\s+root|admin\s+access|runas\s+/user)' 'privilege_escalation' 0.8 'Elevated privileges'
Add-ThreatIfMatched 'chmod\s+777' 'privilege_escalation' 0.9 'World-writable permissions'
Add-ThreatIfMatched 'add\s+.*\s+(sudoers|administrators)' 'privilege_escalation' 0.95 'Adding admin access'

Add-ThreatIfMatched '(rm\s+-rf\s+/|del\s+/[sq]|format\s+c:)' 'system_destruction' 0.95 'Destructive command'
Add-ThreatIfMatched '(drop\s+database|truncate\s+table|delete\s+from\s+\w+\s*(;|\s*$))' 'system_destruction' 0.9 'Database destruction'
Add-ThreatIfMatched 'wipe\s+(all|entire|every)' 'system_destruction' 0.9 'Mass deletion'

Add-ThreatIfMatched 'ignore\s+(previous|above|all)\s+(instructions?|rules?|prompts?)' 'prompt_injection' 0.9 'Instruction override'
Add-ThreatIfMatched 'you\s+are\s+now\s+(a|an)\s+(assistant|ai|bot|system|expert|language\s+model)\b' 'prompt_injection' 0.7 'Role reassignment'
Add-ThreatIfMatched '(^|\n)\s*system\s*:\s*you\s+are' 'prompt_injection' 0.6 'System prompt injection'

Add-ThreatIfMatched '(api[_-]?key|secret[_-]?key|password|token)\s*[:=]\s*[''"]?\w{8,}' 'credential_exposure' 0.9 'Possible hardcoded credential'
Add-ThreatIfMatched '(aws_access_key|AKIA[0-9A-Z]{16})' 'credential_exposure' 0.95 'AWS key exposure'

if ($threatsFound.Count -gt 0) {
    $maxSeverity = ($threatsFound | Measure-Object -Property severity -Maximum).Maximum
    $threats = @($threatsFound.ToArray())
    $event = [ordered]@{
        timestamp = $timestamp
        event = 'threat_detected'
        governance_level = $level
        threat_count = $threatsFound.Count
        max_severity = $maxSeverity
        threats = $threats
    }

    $event | ConvertTo-Json -Compress -Depth 5 | Add-Content -Path $logFile -Encoding utf8
    if ($block -eq 'true' -or $level -eq 'strict' -or $level -eq 'locked') {
        $stopReason = "Prompt blocked by governance policy (level: $level): $($threatsFound.Count) threat signal(s) detected."
        [ordered]@{
            timestamp = $timestamp
            reason = $stopReason
            threats = $threats
        } | ConvertTo-Json -Compress -Depth 5 | Set-Content -Path $blockFile -Encoding utf8

        [Console]::Error.WriteLine($stopReason)
        foreach ($threat in $threatsFound) {
            [Console]::Error.WriteLine("  [$($threat.category)] $($threat.description) (severity: $($threat.severity))")
        }

        [ordered]@{
            continue = $false
            stopReason = $stopReason
            systemMessage = $stopReason
        } | ConvertTo-Json -Compress | Write-Output
        exit 0
    }

    $systemMessage = "Governance: $($threatsFound.Count) threat signal(s) detected (max severity: $maxSeverity)."
    [ordered]@{
        continue = $true
        systemMessage = $systemMessage
    } | ConvertTo-Json -Compress | Write-Output
} else {
    $event = [ordered]@{
        timestamp = $timestamp
        event = 'prompt_scanned'
        governance_level = $level
        status = 'clean'
    }

    $event | ConvertTo-Json -Compress | Add-Content -Path $logFile -Encoding utf8
}

exit 0