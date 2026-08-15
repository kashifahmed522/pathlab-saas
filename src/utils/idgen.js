const dayjs = require('dayjs');

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function orderNo(labCode) {
  return `${labCode}-${dayjs().format('YYMMDD')}-${randomDigits(4)}`;
}

function uhid(labCode) {
  return `${labCode}-P${dayjs().format('YY')}-${randomDigits(5)}`;
}

function barcode() {
  return `SMP${dayjs().format('YYMMDDHHmmss')}${randomDigits(3)}`;
}

function invoiceNo(labCode) {
  return `${labCode}-INV-${dayjs().format('YYMMDD')}-${randomDigits(4)}`;
}

function reportNo(labCode) {
  return `${labCode}-RPT-${dayjs().format('YYMMDD')}-${randomDigits(4)}`;
}

module.exports = { orderNo, uhid, barcode, invoiceNo, reportNo };
