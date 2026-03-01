
import { TableContainer, Paper, Chip, Typography } from '@mui/material';

import Link from 'next/link';

import { dateParser, } from '../../../common/toolsKit';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CopyLongStrSpan } from '../../../common/CopyLongStr';
import { DocItem } from '../../../rc';

interface GetDocsListProps {
  list: DocItem[],
}

export function GetDocsList({ list }:GetDocsListProps ) {
  
  const columns: GridColDef[] = [
    {
      field: 'seqOfDoc', 
      headerName: 'Seq',
      valueGetter: p => p.row.doc.head.seqOfDoc,
      width: 80,
      renderCell: ( p ) => (
        <Link
          href={{
            pathname: '/app/comp/lop/payroll',
            query: {
              body: p.row.doc.body,
              seq: p.row.doc.head.seqOfDoc,
              creator: p.row.doc.head.creator,
              createDate: p.row.doc.head.createDate
            }
          }}
          // as={ '/comp/pop/Payroll' }
        >
          { parseInt(p.row.doc.head.seqOfDoc).toString().padStart(6, '0') }
        </Link>
      )
    },
    {
      field: 'creator',
      headerName: 'Creator',
      valueGetter: p => BigInt(p.row.doc.head.creator).toString(16),
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='outlined'
          label={ value }
        />
      ),
    },
    {
      field: 'createDate',
      headerName: 'CreateDate',
      valueGetter: p => dateParser(parseInt(p.row.doc.head.createDate).toString()),
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'addr',
      headerName: 'Address',
      valueGetter: p => p.row.doc.body,
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell:({value})=>(
        <CopyLongStrSpan title='Addr' src={value} />
      )
    },
  ];
  
  return (
    <TableContainer component={Paper} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
        <b>Payroll Of Projects</b>
      </Typography>

      <DataGrid
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        columns={ columns }
        getRowId={(row:DocItem) => (row.doc.head.seqOfDoc.toString()) } 
        disableRowSelectionOnClick
      />


    </TableContainer>
  )
}



