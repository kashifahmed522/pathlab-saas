const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

function reportPdf(res, { lab, patient, doctor, order, report, itemsWithResults }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${report.report_no}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(18).text(lab.name, { align: 'center' });
  doc.fontSize(9).fillColor('#555')
    .text(lab.address || '', { align: 'center' })
    .text(`${lab.phone || ''}  ${lab.email || ''}${lab.nabl_no ? '  | NABL: ' + lab.nabl_no : ''}`, { align: 'center' });
  doc.fillColor('#000');
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(13).text('LABORATORY REPORT', { align: 'center', underline: true });
  doc.moveDown(0.5);

  // Patient info block
  const infoTop = doc.y;
  doc.fontSize(10);
  doc.text(`Patient: ${patient.name}`, 40, infoTop);
  doc.text(`Age/Gender: ${patient.age || '-'} ${patient.age_unit || ''} / ${patient.gender || '-'}`, 40, infoTop + 15);
  doc.text(`UHID: ${patient.uhid}`, 40, infoTop + 30);

  doc.text(`Order No: ${order.order_no}`, 320, infoTop);
  doc.text(`Report No: ${report.report_no}`, 320, infoTop + 15);
  doc.text(`Referred By: ${doctor ? 'Dr. ' + doctor.name : 'Self'}`, 320, infoTop + 30);
  doc.text(`Date: ${dayjs().format('DD-MMM-YYYY hh:mm A')}`, 320, infoTop + 45);

  doc.moveDown(4);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // Results table header
  const colX = { test: 40, value: 260, unit: 340, range: 410, flag: 500 };
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Test', colX.test, doc.y, { continued: false });
  doc.text('Result', colX.value, doc.y - 12);
  doc.text('Unit', colX.unit, doc.y - 12);
  doc.text('Reference Range', colX.range, doc.y - 12);
  doc.font('Helvetica');
  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);

  let currentCategory = null;
  itemsWithResults.forEach((row) => {
    if (row.category !== currentCategory) {
      currentCategory = row.category;
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#333')
        .text(currentCategory || 'General', colX.test, doc.y);
      doc.fillColor('#000').font('Helvetica');
      doc.moveDown(0.2);
    }
    const y = doc.y;
    const flagColor = row.flag === 'critical' ? '#c00' : (row.flag === 'high' || row.flag === 'low') ? '#c60' : '#000';
    doc.fontSize(9.5);
    doc.text(row.test_name, colX.test, y, { width: 210 });
    doc.fillColor(flagColor).text(row.value || '-', colX.value, y, { width: 70 });
    doc.fillColor('#000').text(row.unit || '', colX.unit, y, { width: 60 });
    doc.text(row.reference_range || '', colX.range, y, { width: 145 });
    doc.moveDown(0.6);
  });

  doc.moveDown(1.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#555').text(
    'This is a computer-generated report. Clinical correlation is advised. Results relate only to the sample tested.',
    { align: 'center' }
  );
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#000').text('_______________________', 380, doc.y);
  doc.text('Pathologist / Lab In-charge', 380);

  doc.end();
}

function invoicePdf(res, { lab, patient, order, invoice, items }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoice_no}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(lab.name, { align: 'center' });
  doc.fontSize(9).fillColor('#555').text(lab.address || '', { align: 'center' });
  doc.fillColor('#000');
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(13).text('INVOICE', { align: 'center', underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10);
  doc.text(`Invoice No: ${invoice.invoice_no}`);
  doc.text(`Patient: ${patient.name}  (UHID: ${patient.uhid})`);
  doc.text(`Order No: ${order.order_no}`);
  doc.text(`Date: ${dayjs(invoice.created_at).format('DD-MMM-YYYY')}`);
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold');
  doc.text('Test', 40, doc.y, { continued: false });
  doc.text('Price', 470, doc.y - 12);
  doc.font('Helvetica');
  doc.moveDown(0.3);

  items.forEach((it) => {
    const y = doc.y;
    doc.fontSize(9.5).text(it.name, 40, y, { width: 400 });
    doc.text(`Rs. ${Number(it.price).toFixed(2)}`, 470, y);
    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  const line = (label, val) => {
    doc.fontSize(10).text(label, 400, doc.y, { continued: false, width: 80 });
    doc.text(`Rs. ${Number(val).toFixed(2)}`, 470, doc.y - 12.5);
    doc.moveDown(0.4);
  };
  line('Subtotal:', invoice.subtotal);
  line('Discount:', invoice.discount);
  line('Tax:', invoice.tax);
  doc.font('Helvetica-Bold');
  line('Total:', invoice.total);
  doc.font('Helvetica');
  line('Paid:', invoice.paid_amount);
  line('Balance:', invoice.total - invoice.paid_amount);

  doc.moveDown(1);
  doc.fontSize(9).fillColor('#555').text('Thank you for choosing us for your diagnostic needs.', { align: 'center' });

  doc.end();
}

module.exports = { reportPdf, invoicePdf };
