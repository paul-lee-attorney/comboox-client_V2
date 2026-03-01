import * as XLSX from 'xlsx';

export const exportToExcel = (rows:any, title:string) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    XLSX.writeFile(workbook, title + '.xlsx');
}

