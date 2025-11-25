function generateCSV(data, columns) {
  if (!data || data.length === 0) {
    return columns.join(',') + '\n';
  }
  
  const header = columns.join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      const stringVal = String(value);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}

module.exports = { generateCSV };
