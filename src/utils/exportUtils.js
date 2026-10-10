import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from 'docx';
import { format } from 'date-fns';

export const exportData = async (data, columns, formatType, reportName) => {
  const fileName = `${reportName}_${format(new Date(), 'yyyy-MM-dd')}`;

  const headers = columns.map(c => c.header);
  const rows = data.map(row => columns.map(c => String(row[c.accessor] || '')));

  switch (formatType) {
    case 'csv':
    case 'txt': {
      const separator = formatType === 'csv' ? ',' : '\t';
      const csvContent = [
        headers.join(separator),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(separator))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: formatType === 'csv' ? 'text/csv' : 'text/plain' });
      downloadBlob(blob, `${fileName}.${formatType}`);
      break;
    }
    
    case 'xlsx': {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      break;
    }

    case 'pdf': {
      const doc = new jsPDF();
      doc.text(reportName, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);
      
      doc.autoTable({
        startY: 30,
        head: [headers],
        body: rows,
      });
      doc.save(`${fileName}.pdf`);
      break;
    }

    case 'docx': {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: reportName, bold: true, size: 32 })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` })
              ]
            }),
            new Paragraph({ text: "" }),
            new Table({
              rows: [
                new TableRow({
                  children: headers.map(header => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })]
                  }))
                }),
                ...rows.map(row => new TableRow({
                  children: row.map(cell => new TableCell({
                    children: [new Paragraph({ text: cell })]
                  }))
                }))
              ]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `${fileName}.docx`);
      break;
    }

    default:
      throw new Error('Unsupported format');
  }
};

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
