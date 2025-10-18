# Script definitivo para corrigir PowerShell 7 e rodar npm install (versão segura)

Write-Host "🔧 Corrigindo ambiente do PowerShell 7..." -ForegroundColor Cyan

# Corrige ComSpec para a sessão atual e persiste no usuário
$env:ComSpec = "C:\Windows\System32\cmd.exe"
try {
    setx ComSpec "C:\Windows\System32\cmd.exe" | Out-Null
    Write-Host "✅ ComSpec atualizado com sucesso." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível persistir ComSpec, execute o PowerShell como administrador." -ForegroundColor Yellow
}

# Adiciona System32 e SysWOW64 ao PATH temporariamente
$env:Path += ";C:\Windows\System32;C:\Windows\SysWOW64"

# Verifica se o cmd.exe é encontrado
$whereCmd = (where.exe cmd) -join "`n"
if ($whereCmd) {
    Write-Host "✅ cmd.exe encontrado em:" -ForegroundColor Green
    Write-Host $whereCmd
} else {
    Write-Host "❌ cmd.exe não encontrado. Verifique o sistema." -ForegroundColor Red
    exit
}

# Vai para a pasta do backend
$backendPath = "C:\Users\ADMIN\Desktop\projeto-6-scraper-fullstack-universal\backend"
if (Test-Path $backendPath) {
    cd $backendPath
    Write-Host "`nDiretório backend encontrado: $backendPath" -ForegroundColor Cyan
} else {
    Write-Host "❌ Diretório backend não encontrado. Ajuste o caminho no script." -ForegroundColor Red
    exit
}

# Executa npm install
Write-Host "`nInstalando dependências com npm..." -ForegroundColor Cyan
npm install

Write-Host "`n🎉 Instalação concluída!" -ForegroundColor Green
Pause
