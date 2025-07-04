#! /bin/bash

Write-Host "Starting cache cleaning process..."
$appDataPath = "C:\Users\amyvp\AppData\Roaming\Claude"
Get-ChildItem -Path $appDataPath -Include "Cache", "Code Cache", "Crashpad", "DawnGraphiteCache", "DawnWebGPUCache", "GPUCache" -Directory -Recurse | Remove-Item -Recurse -Force
Write-Host "Claude cache cleaning process completed."