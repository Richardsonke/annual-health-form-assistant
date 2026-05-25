import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

async function extractFields() {
  const pdfBytes = await fs.readFile('./public/680-001_AB.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  const fieldData = fields.map(f => {
    return { name: f.getName(), type: f.constructor.name };
  });

  await fs.writeFile('pdf-fields.json', JSON.stringify(fieldData, null, 2));
  console.log('Fields written to pdf-fields.json');
}

extractFields().catch(console.error);
