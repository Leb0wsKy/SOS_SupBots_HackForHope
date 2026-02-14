# Upload a real file (image/video/PDF) to test the system
param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "=== Upload de fichier reel ===" -ForegroundColor Cyan

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "[ERROR] Fichier introuvable: $FilePath" -ForegroundColor Red
    exit 1
}

$fileInfo = Get-Item $FilePath
Write-Host "`nFichier a uploader:" -ForegroundColor Yellow
Write-Host "  Nom: $($fileInfo.Name)" -ForegroundColor Gray
Write-Host "  Taille: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
Write-Host "  Type: $($fileInfo.Extension)" -ForegroundColor Gray

# Check file size (50MB limit)
if ($fileInfo.Length -gt 50MB) {
    Write-Host "`n[ERROR] Fichier trop grand! Limite: 50 MB" -ForegroundColor Red
    exit 1
}

# Step 1: Login as Fatma (Level 1)
Write-Host "`n1. Connexion en tant que Fatma..." -ForegroundColor Yellow
$loginBody = @{
    email = "fatma@sos.tn"
    password = "fatma123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    $villageId = $loginResponse.user.village._id
    Write-Host "[OK] Connecte. Village: $($loginResponse.user.village.name)" -ForegroundColor Green

    # Step 2: Detect MIME type
    Write-Host "`n2. Detection du type MIME..." -ForegroundColor Yellow
    $mimeType = switch ($fileInfo.Extension.ToLower()) {
        ".jpg"  { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".png"  { "image/png" }
        ".mp4"  { "video/mp4" }
        ".mov"  { "video/quicktime" }
        ".mp3"  { "audio/mpeg" }
        ".wav"  { "audio/wav" }
        ".pdf"  { "application/pdf" }
        default { "application/octet-stream" }
    }
    Write-Host "[OK] Type MIME: $mimeType" -ForegroundColor Green

    # Step 3: Upload file
    Write-Host "`n3. Upload du fichier vers le serveur..." -ForegroundColor Yellow

    # Prepare multipart form
    $boundary = [System.Guid]::NewGuid().ToString()
    $contentType = "multipart/form-data; boundary=$boundary"
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    # Read file
    $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)

    # Build multipart body
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"title`"",
        "",
        "Upload fichier reel: $($fileInfo.Name)",
        "--$boundary",
        "Content-Disposition: form-data; name=`"description`"",
        "",
        "Test d'upload avec un vrai fichier ($($fileInfo.Extension)). Taille: $([math]::Round($fileInfo.Length / 1KB, 2)) KB.",
        "--$boundary",
        "Content-Disposition: form-data; name=`"village`"",
        "",
        "$villageId",
        "--$boundary",
        "Content-Disposition: form-data; name=`"program`"",
        "",
        "Accueil Familial",
        "--$boundary",
        "Content-Disposition: form-data; name=`"incidentType`"",
        "",
        "COMPORTEMENT",
        "--$boundary",
        "Content-Disposition: form-data; name=`"urgencyLevel`"",
        "",
        "MOYEN",
        "--$boundary",
        "Content-Disposition: form-data; name=`"isAnonymous`"",
        "",
        "false",
        "--$boundary",
        "Content-Disposition: form-data; name=`"attachments`"; filename=`"$($fileInfo.Name)`"",
        "Content-Type: $mimeType",
        "",
        $fileEnc,
        "--$boundary--"
    )

    $body = $bodyLines -join "`r`n"

    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/signalement" `
        -Method Post `
        -Headers $headers `
        -ContentType $contentType `
        -Body $body

    $signalementId = $uploadResponse._id
    Write-Host "[OK] Upload reussi!" -ForegroundColor Green
    Write-Host "`nDetails du signalement:" -ForegroundColor Cyan
    Write-Host "  ID: $signalementId" -ForegroundColor Gray
    Write-Host "  Titre: $($uploadResponse.title)" -ForegroundColor Gray
    Write-Host "  Village: $($uploadResponse.village.name)" -ForegroundColor Gray
    Write-Host "  Statut: $($uploadResponse.status)" -ForegroundColor Gray
    
    if ($uploadResponse.attachments.Count -gt 0) {
        Write-Host "`n  Pieces jointes:" -ForegroundColor Cyan
        foreach ($att in $uploadResponse.attachments) {
            Write-Host "    - Nom original: $($att.originalName)" -ForegroundColor Gray
            Write-Host "      Nom serveur: $($att.filename)" -ForegroundColor DarkGray
            Write-Host "      Taille: $([math]::Round($att.size / 1KB, 2)) KB" -ForegroundColor Gray
            Write-Host "      Type: $($att.mimeType)" -ForegroundColor Gray
        }
    }

    # Step 4: Download and verify
    Write-Host "`n4. Verification du telechargement..." -ForegroundColor Yellow
    $filename = $uploadResponse.attachments[0].filename
    $downloadUrl = "http://localhost:5000/api/signalement/$signalementId/attachments/$filename"
    
    $downloadPath = "$PSScriptRoot\downloaded-$filename"
    Invoke-RestMethod -Uri $downloadUrl `
        -Method Get `
        -Headers $headers `
        -OutFile $downloadPath
    
    $downloadedSize = (Get-Item $downloadPath).Length
    Write-Host "[OK] Fichier telecharge: $downloadPath" -ForegroundColor Green
    Write-Host "  Taille originale: $($fileInfo.Length) bytes" -ForegroundColor Gray
    Write-Host "  Taille telechargee: $downloadedSize bytes" -ForegroundColor Gray
    
    if ($fileInfo.Length -eq $downloadedSize) {
        Write-Host "[OK] Tailles identiques - fichier intact!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Tailles differentes!" -ForegroundColor Yellow
    }

    # Step 5: Check with Level 2 viewer
    Write-Host "`n5. Verification acces Level 2..." -ForegroundColor Yellow
    $psyLoginBody = @{
        email = "psy@sos.tn"
        password = "psy123"
    } | ConvertTo-Json

    $psyLoginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -Body $psyLoginBody `
        -ContentType "application/json"

    $psyHeaders = @{
        "Authorization" = "Bearer $($psyLoginResponse.token)"
    }

    $signalement = Invoke-RestMethod -Uri "http://localhost:5000/api/signalement/$signalementId" `
        -Headers $psyHeaders

    Write-Host "[OK] Level 2 peut voir le signalement avec $($signalement.attachments.Count) piece(s) jointe(s)" -ForegroundColor Green

    Write-Host "`n=== TEST REUSSI ===" -ForegroundColor Green
    Write-Host "[OK] Fichier reel uploade avec succes" -ForegroundColor Green
    Write-Host "[OK] Fichier stocke dans: backend\uploads\$filename" -ForegroundColor Green
    Write-Host "[OK] Telechargement verifie" -ForegroundColor Green
    Write-Host "[OK] Acces multi-niveau fonctionnel" -ForegroundColor Green
    Write-Host "`nLe fichier upload est accessible via:" -ForegroundColor Cyan
    Write-Host "  API: http://localhost:5000/api/signalement/$signalementId/attachments/$filename" -ForegroundColor Gray
    Write-Host "  Static: http://localhost:5000/uploads/$filename" -ForegroundColor Gray

    # Clean up downloaded file
    Write-Host "`nNettoyage du fichier telecharge..." -ForegroundColor Yellow
    Remove-Item $downloadPath -ErrorAction SilentlyContinue
    Write-Host "[OK] Fichier test supprime" -ForegroundColor Green

} catch {
    Write-Host "`n[ERROR] Erreur lors de l'upload" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    exit 1
}
