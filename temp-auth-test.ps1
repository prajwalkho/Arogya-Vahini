$body = @{ email = 'admin1@gmail.com'; password = 'Admin123' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
Write-Output "LOGIN:"
Write-Output ($login | ConvertTo-Json)
if (-not $login.token) { throw 'No token returned' }
$stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/stats' -Method Get -Headers @{ Authorization = "Bearer $($login.token)" }
Write-Output "STATS:"
Write-Output ($stats | ConvertTo-Json)
