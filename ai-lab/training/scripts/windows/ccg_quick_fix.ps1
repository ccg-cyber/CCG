<#
.SYNOPSIS
    CCG Remote Quick Fix Tool
.DESCRIPTION
    Basic maintenance script for remote clients. Cleans DNS, Temp files, and checks disk space.
.AUTHOR
    Consultant Computing Group (CCG)
#>

Write-Host "--- CCG REMOTE DIAGNOSTICS STARTED ---" -ForegroundColor Cyan

# 1. Flush DNS (Fixes internet glitches)
Write-Host "Step 1: Flushing DNS Cache..."
ipconfig /flushdns

# 2. Check Disk Space
Write-Host "Step 2: Checking Disk C: Space..."
$disk = Get-PSDrive C
$freeSpaceGB = [math]::Round($disk.Free / 1GB, 2)
if ($freeSpaceGB -lt 10) {
    Write-Host "WARNING: Low Disk Space! Only $freeSpaceGB GB remaining." -ForegroundColor Red
} else {
    Write-Host "Disk Space OK: $freeSpaceGB GB remaining." -ForegroundColor Green
}

# 3. Network Connection Test
Write-Host "Step 3: Testing Connectivity to Google DNS..."
$ping = Test-Connection -ComputerName 8.8.8.8 -Count 2 -Quiet
if ($ping) {
    Write-Host "Internet Connection: ONLINE" -ForegroundColor Green
} else {
    Write-Host "Internet Connection: OFFLINE" -ForegroundColor Red
}

Write-Host "--- CCG DIAGNOSTICS COMPLETE ---" -ForegroundColor Cyan
Write-Host "Please screenshot this window for the ticket."
