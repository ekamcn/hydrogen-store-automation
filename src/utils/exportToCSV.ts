/**
 * Utility function to convert object array to CSV and trigger download
 * @param data - Array of objects to convert to CSV
 * @param filename - Name for the downloaded file (without .csv extension)
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string = 'export'): void {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Ensure 'error' is the last column if it exists
  if (headers.includes('error')) {
    const errorIndex = headers.indexOf('error');
    headers.splice(errorIndex, 1);
    headers.push('error');
  }
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row => {
      return headers.map(header => {
        const cellValue = row[header] === null || row[header] === undefined ? '' : row[header];
        
        // Handle special characters and commas in the cell value
        const formattedValue = typeof cellValue === 'string' 
          ? `"${cellValue.replace(/"/g, '""')}"` // Escape quotes with double quotes
          : cellValue;
        
        return formattedValue;
      }).join(',');
    })
  ];
  
  // Combine rows into a CSV string
  const csvString = csvRows.join('\n');
  
  // Create a Blob with the CSV data
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Append link to the body
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
