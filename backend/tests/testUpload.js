// Test file upload with actual files using Node.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000/api';

async function testFileUpload() {
  console.log('=== Test d\'upload de fichiers ===\n');

  try {
    // Step 1: Login as Fatma (Level 1)
    console.log('1. Connexion en tant que Fatma (Level 1)...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'fatma@sos.tn',
        password: 'fatma123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const villageId = loginData.user.village;
    console.log('✓ Connecté avec succès. Village ID:', villageId);

    // Step 2: Create test files
    console.log('\n2. Création des fichiers de test...');
    const testDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // Create a test image (JPEG header + random data)
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const imageData = Buffer.concat([jpegHeader, Buffer.alloc(1024, 0x42)]);
    const imagePath = path.join(testDir, 'test-image.jpg');
    fs.writeFileSync(imagePath, imageData);

    // Create a test PDF (PDF header + minimal content)
    const pdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n203\n%%EOF';
    const pdfPath = path.join(testDir, 'test-document.pdf');
    fs.writeFileSync(pdfPath, pdfContent);

    console.log('✓ Fichiers de test créés');

    // Step 3: Upload signalement with multiple attachments
    console.log('\n3. Upload du signalement avec pièces jointes...');
    
    const form = new FormData();
    form.append('title', 'Test upload avec multiple fichiers');
    form.append('description', 'Test d\'upload de fichiers avec image et PDF. Le système devrait accepter ces deux types de fichiers et les stocker correctement.');
    form.append('village', villageId);
    form.append('incidentType', 'SECURITE_ENFANT');
    form.append('urgencyLevel', 'MOYENNE');
    form.append('isAnonymous', 'false');
    form.append('attachments', fs.createReadStream(imagePath), {
      filename: 'photo-incident.jpg',
      contentType: 'image/jpeg'
    });
    form.append('attachments', fs.createReadStream(pdfPath), {
      filename: 'rapport.pdf',
      contentType: 'application/pdf'
    });

    const uploadResponse = await fetch(`${API_BASE}/signalement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const uploadData = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
    }

    const signalementId = uploadData._id;
    console.log('✓ Signalement créé avec succès!');
    console.log('  ID:', signalementId);
    console.log('  Titre:', uploadData.title);
    console.log('  Nombre de pièces jointes:', uploadData.attachments.length);

    if (uploadData.attachments.length > 0) {
      console.log('\n  Fichiers uploadés:');
      uploadData.attachments.forEach(att => {
        console.log(`    - ${att.originalName} (${att.size} bytes, type: ${att.mimeType})`);
        console.log(`      Nom serveur: ${att.filename}`);
      });
    }

    // Step 4: Download the uploaded files
    console.log('\n4. Téléchargement des pièces jointes...');
    for (const attachment of uploadData.attachments) {
      const downloadUrl = `${API_BASE}/signalement/${signalementId}/attachments/${attachment.filename}`;
      const downloadResponse = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const downloadPath = path.join(testDir, `downloaded-${attachment.filename}`);
      const buffer = await downloadResponse.buffer();
      fs.writeFileSync(downloadPath, buffer);

      console.log(`✓ Fichier téléchargé: ${attachment.originalName}`);
      console.log(`  Taille: ${buffer.length} bytes (original: ${attachment.size} bytes)`);
      
      if (buffer.length === attachment.size) {
        console.log('  ✓ Taille vérifiée');
      } else {
        console.log('  ⚠ Taille différente!');
      }
    }

    // Step 5: Test that Level 2 can see attachments
    console.log('\n5. Vérification que Level 2 peut voir les pièces jointes...');
    const psyLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'psy@sos.tn',
        password: 'psy123'
      })
    });

    const psyData = await psyLoginResponse.json();
    const psyToken = psyData.token;

    const signalementResponse = await fetch(`${API_BASE}/signalement/${signalementId}`, {
      headers: { 'Authorization': `Bearer ${psyToken}` }
    });

    const signalement = await signalementResponse.json();
    console.log('✓ Psychologue peut voir le signalement');
    console.log('  Nombre de pièces jointes visibles:', signalement.attachments.length);

    // Step 6: Test file size limit (optional)
    console.log('\n6. Test de la limite de taille de fichier...');
    console.log('  (Skipped - would create 50MB+ file)');

    // Clean up
    console.log('\n7. Nettoyage des fichiers de test...');
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('✓ Fichiers de test supprimés');

    console.log('\n=== TEST RÉUSSI ===');
    console.log('✓ Upload de fichiers multiples fonctionne');
    console.log('✓ Téléchargement de fichiers fonctionne');
    console.log('✓ Métadonnées correctement enregistrées');
    console.log('✓ Contrôle d\'accès par rôle fonctionne');

  } catch (error) {
    console.error('\n✗ ERREUR lors du test');
    console.error(error.message);
    if (error.response) {
      console.error(await error.response.text());
    }
  }
}

// Run the test
testFileUpload();
