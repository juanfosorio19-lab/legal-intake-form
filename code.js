function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = doc.getSheetByName('Inbox_Legal_System');

        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var nextRow = sheet.getLastRow() + 1;

        var data = JSON.parse(e.postData.contents);
        var idCaso = Utilities.getUuid();
        var newRow = headers.map(function (header) {
            if (header === 'id_caso') return idCaso;
            if (header === 'creado_en') return new Date();
            if (header === 'etapa') return 'lead';
            if (header === 'estado') return 'Abierto';
            if (header === 'send_confirm') return false;
            if (header === 'fuente') return 'web'; // Hidden field value

            // Map user input fields
            return data[header] || '';
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow, 'id_caso': idCaso }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    finally {
        lock.releaseLock();
    }
}
