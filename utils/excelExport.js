function generateExcelXML(data, columns, sheetName = 'Sheet1') {
  const escapeXml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += `  <Worksheet ss:Name="${escapeXml(sheetName)}">\n`;
  xml += '    <Table>\n';
  
  xml += '      <Row>\n';
  columns.forEach(col => {
    xml += `        <Cell><Data ss:Type="String">${escapeXml(col)}</Data></Cell>\n`;
  });
  xml += '      </Row>\n';
  
  data.forEach(row => {
    xml += '      <Row>\n';
    columns.forEach(col => {
      const value = row[col];
      const type = typeof value === 'number' ? 'Number' : 'String';
      xml += `        <Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>\n`;
    });
    xml += '      </Row>\n';
  });
  
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  xml += '</Workbook>';
  
  return xml;
}

module.exports = { generateExcelXML };
