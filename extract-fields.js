import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

async function extractFields() {
  const pdfBytes = await fs.readFile('./public/680-001_AB.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  const fieldData = fields.map(f => {
    const widgets = f.acroField.getWidgets();
    let width = null;
    let height = null;
    let x = null;
    let y = null;
    if (widgets && widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      width = rect.width;
      height = rect.height;
      x = rect.x;
      y = rect.y;
    }
    return { 
      name: f.getName(), 
      type: f.constructor.name,
      width,
      height,
      x,
      y
    };
  });

  await fs.writeFile('pdf-fields-geometry.json', JSON.stringify(fieldData, null, 2));
  console.log('Fields geometry written to pdf-fields-geometry.json');
}

extractFields().catch(console.error);
