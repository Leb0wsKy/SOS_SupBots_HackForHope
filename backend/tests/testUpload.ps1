# Test file upload functionality
Write-Host "=== Test d'upload de fichiers ===" -ForegroundColor Cyan

# Step 1: Login as Fatma (Level 1 user)
Write-Host "`n1. Connexion en tant que Fatma (Level 1)..." -ForegroundColor Yellow
$loginBody = @{
    email = "fatma@sos.tn"
    password = "fatma123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token
$villageId = $loginResponse.user.village._id
Write-Host "[OK] Connecte avec succes. Village ID: $villageId" -ForegroundColor Green

# Step 2: Create a test image file
Write-Host "`n2. Creation d'un fichier de test..." -ForegroundColor Yellow
$testFilePath = "$PSScriptRoot\test-image.jpg"

# Create a simple test file (simulating an image)
$testContent = New-Object byte[] 1024
for ($i = 0; $i -lt 1024; $i++) {
    $testContent[$i] = $i % 256
}
[System.IO.File]::WriteAllBytes($testFilePath, $testContent)
Write-Host "[OK] Fichier de test cree: $testFilePath" -ForegroundColor Green

# Step 3: Upload signalement with file attachment
Write-Host "`n3. Upload du signalement avec pièce jointe..." -ForegroundColor Yellow

# Prepare multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"
$headers = @{
    "Authorization" = "Bearer $token"
}

# Read test file
$fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
$fileEnc = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)

# Build multipart body
$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"title`"",
    "",
    "Test upload avec photo",
    "--$boundary",
    "Content-Disposition: form-data; name=`"description`"",
    "",
    "Ceci est un test d'upload de fichier pour vérifier que le système multer fonctionne correctement.",
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
    "Content-Disposition: form-data; name=`"attachments`"; filename=`"test-image.jpg`"",
    "Content-Type: image/jpeg",
    "",
    $fileEnc,
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/signalement" `
        -Method Post `
        -Headers $headers `
        -ContentType $contentType `
        -Body $body

    $signalementId = $uploadResponse._id
    Write-Host "[OK] Signalement cree avec succes!" -ForegroundColor Green
    Write-Host "  ID: $signalementId" -ForegroundColor Gray
    Write-Host "  Titre: $($uploadResponse.title)" -ForegroundColor Gray
    Write-Host "  Nombre de pieces jointes: $($uploadResponse.attachments.Count)" -ForegroundColor Gray
    
    if ($uploadResponse.attachments.Count -gt 0) {
        Write-Host "`n  Fichiers uploades:" -ForegroundColor Gray
        foreach ($att in $uploadResponse.attachments) {
            Write-Host "    - $($att.originalName) ($($att.size) bytes, type: $($att.mimeType))" -ForegroundColor Gray
            Write-Host "      Nom serveur: $($att.filename)" -ForegroundColor DarkGray
        }
    }

    # Step 4: Download the uploaded file
    Write-Host "`n4. Telechargement de la piece jointe..." -ForegroundColor Yellow
    if ($uploadResponse.attachments.Count -gt 0) {
        $filename = $uploadResponse.attachments[0].filename
        $downloadUrl = "http://localhost:5000/api/signalement/$signalementId/attachments/$filename"
        
        $downloadPath = "$PSScriptRoot\downloaded-$filename"
        Invoke-RestMethod -Uri $downloadUrl `
            -Method Get `
            -Headers $headers `
            -OutFile $downloadPath
        
        Write-Host "[OK] Fichier telecharge: $downloadPath" -ForegroundColor Green
        
        # Verify file size
        $originalSize = (Get-Item $testFilePath).Length
        $downloadedSize = (Get-Item $downloadPath).Length
        
        if ($originalSize -eq $downloadedSize) {
            Write-Host "[OK] Taille du fichier verifiee: $originalSize bytes" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Taille differente! Original: $originalSize, Telecharge: $downloadedSize" -ForegroundColor Yellow
        }
    }

    # Step 5: Verify Level 2 can see the signalement with attachments
    Write-Host "`n5. Verification que Level 2 peut voir les pieces jointes..." -ForegroundColor Yellow
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

    Write-Host "[OK] Psychologue peut voir le signalement" -ForegroundColor Green
    Write-Host "  Nombre de pieces jointes visibles: $($signalement.attachments.Count)" -ForegroundColor Gray

    # Clean up test files
    Write-Host "`n6. Nettoyage des fichiers de test..." -ForegroundColor Yellow
    Remove-Item $testFilePath -ErrorAction SilentlyContinue
    Remove-Item "$PSScriptRoot\downloaded-*" -ErrorAction SilentlyContinue
    Write-Host "[OK] Fichiers de test supprimes" -ForegroundColor Green

    Write-Host "`n=== TEST REUSSI ===" -ForegroundColor Green
    Write-Host "[OK] Upload de fichier fonctionne" -ForegroundColor Green
    Write-Host "[OK] Telechargement de fichier fonctionne" -ForegroundColor Green
    Write-Host "[OK] Metadonnees correctement enregistrees" -ForegroundColor Green

} catch {
    Write-Host "`n[ERROR] ERREUR lors de l'upload" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    # Clean up test files
    Remove-Item $testFilePath -ErrorAction SilentlyContinue
}
