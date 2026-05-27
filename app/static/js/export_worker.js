// Export Web Worker
// Handles heavy data fetching and file generation off the main UI thread.

// Load pdfmake for PDF generation
importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js'
);

self.onmessage = async function(e) {
    const { format, url } = e.data;
    
    try {
        // Fetch raw data
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        const transactions = data.transactions || [];
        
        if (format === 'csv') {
            generateCSV(transactions);
        } else if (format === 'pdf') {
            generatePDF(transactions);
        } else {
            throw new Error(`Unknown format: ${format}`);
        }
        
    } catch (err) {
        self.postMessage({
            status: 'error',
            error: err.toString()
        });
    }
};

function generateCSV(transactions) {
    if (transactions.length === 0) {
        self.postMessage({ status: 'error', error: 'No data to export' });
        return;
    }
    
    // Build CSV headers
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Description', 'Note'];
    let csvContent = headers.join(',') + '\n';
    
    // Build rows
    for (const t of transactions) {
        // Escape quotes
        const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
        const note = `"${(t.note || '').replace(/"/g, '""')}"`;
        
        const row = [
            t.id,
            t.date,
            t.type,
            t.amount,
            desc,
            note
        ];
        csvContent += row.join(',') + '\n';
    }
    
    self.postMessage({
        status: 'success',
        content: csvContent,
        mimeType: 'text/csv;charset=utf-8;',
        filename: `shopvision_export_${new Date().getTime()}.csv`
    });
}

function generatePDF(transactions) {
    if (transactions.length === 0) {
        self.postMessage({ status: 'error', error: 'No data to export' });
        return;
    }
    
    // Define pdfmake document
    const tableBody = [
        // Headers
        [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Type', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeader' },
            { text: 'Description', style: 'tableHeader' }
        ]
    ];
    
    // Calculate total
    let totalSales = 0;
    let totalExpenses = 0;
    
    for (const t of transactions) {
        if (t.type === 'sale') totalSales += t.amount;
        if (t.type === 'expense') totalExpenses += t.amount;
        
        // Format date string nicely
        const dateStr = new Date(t.date).toLocaleDateString();
        
        tableBody.push([
            dateStr,
            t.type.replace('_', ' ').toUpperCase(),
            { text: `Rs. ${t.amount.toFixed(2)}`, alignment: 'right' },
            t.description || '-'
        ]);
    }
    
    const docDefinition = {
        content: [
            { text: 'ShopVision Transaction Report', style: 'header' },
            { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
            {
                columns: [
                    { text: `Total Sales: Rs. ${totalSales.toFixed(2)}`, style: 'summary' },
                    { text: `Total Expenses: Rs. ${totalExpenses.toFixed(2)}`, style: 'summary' },
                    { text: `Net: Rs. ${(totalSales - totalExpenses).toFixed(2)}`, style: 'summary' }
                ]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', '*'],
                    body: tableBody
                },
                layout: 'lightHorizontalLines'
            }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 12, margin: [0, 0, 0, 20], color: 'gray' },
            summary: { fontSize: 12, bold: true, margin: [0, 0, 0, 20] },
            tableHeader: { bold: true, fontSize: 13, color: 'black' }
        },
        defaultStyle: {
            fontSize: 10
        }
    };
    
    // Generate PDF blob in worker
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    pdfDocGenerator.getBlob((blob) => {
        // Since we are in worker, we can pass Blob directly, but we cannot pass Blob natively sometimes.
        // Wait, postMessage supports Blob natively!
        self.postMessage({
            status: 'success',
            content: blob,
            mimeType: 'application/pdf',
            filename: `shopvision_report_${new Date().getTime()}.pdf`
        });
    });
}
