// ─────────────────────────────────────────────
//  dgenny® — Candidaturas Customer Success
//  Cole este código em script.google.com
// ─────────────────────────────────────────────

var SHEET_NAME  = 'Candidaturas';
var FOLDER_NAME = 'Currículos - Customer Success';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Planilha
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Data', 'Nome', 'E-mail', 'WhatsApp', 'Cidade',
        'LinkedIn', 'Experiência', 'Motivação', 'Currículo (Drive)'
      ]);
      // Formata cabeçalho
      var header = sheet.getRange(1, 1, 1, 9);
      header.setFontWeight('bold');
      header.setBackground('#121325');
      header.setFontColor('#FFBEF5');
    }

    // Salva currículo no Google Drive
    var driveLink = '';
    if (data.curriculo_base64 && data.curriculo_nome) {
      var folder = obterOuCriarPasta(FOLDER_NAME);
      var bytes  = Utilities.base64Decode(data.curriculo_base64);
      var blob   = Utilities.newBlob(bytes, data.curriculo_tipo || 'application/octet-stream', data.curriculo_nome);
      var file   = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveLink = file.getUrl();
    }

    // Adiciona linha na planilha
    sheet.appendRow([
      new Date(),
      data.nome        || '',
      data.email       || '',
      data.whatsapp    || '',
      data.cidade      || '',
      data.linkedin    || '',
      data.experiencia || '',
      data.motivacao   || '',
      driveLink
    ]);

    return resposta({ ok: true });

  } catch (err) {
    return resposta({ ok: false, error: err.message });
  }
}

function obterOuCriarPasta(nome) {
  var pastas = DriveApp.getFoldersByName(nome);
  return pastas.hasNext() ? pastas.next() : DriveApp.createFolder(nome);
}

function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Teste manual: rode esta função no editor para verificar a planilha
function testar() {
  doPost({
    postData: {
      contents: JSON.stringify({
        nome: 'Teste Silva',
        email: 'teste@email.com',
        whatsapp: '(11) 91234-5678',
        cidade: 'São Paulo, SP',
        linkedin: 'https://linkedin.com/in/teste',
        experiencia: '1 a 2 anos',
        motivacao: 'Teste de envio.',
        curriculo_nome: '',
        curriculo_base64: '',
        curriculo_tipo: ''
      })
    }
  });
}
