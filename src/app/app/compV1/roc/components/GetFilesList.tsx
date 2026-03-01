
import { Dispatch, SetStateAction } from 'react';

import { 
  TableContainer, 
  Paper, 
  Toolbar, 
  Chip,
  Button,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BookOutlined, } from '@mui/icons-material';

import Link from 'next/link';

import { dateParser, longSnParser } from '../../../common/toolsKit';
import { InfoOfFile } from './filesFolder';

import { CopyLongStrSpan } from '../../../common/CopyLongStr';

interface GetFilesListProps {
  list: InfoOfFile[],
  title: string,
  pathName: string,
  setFile: Dispatch<SetStateAction<InfoOfFile | undefined>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const labState = ['Created', 'Circulated',  'Proposed', 'Approved', 
'Rejected', 'Closed', 'Terminated'];

export function GetFilesList({ list, title, pathName, setFile, setOpen }:GetFilesListProps ) {

  
  const columns: GridColDef[] = [
    {
      field: 'sn', 
      headerName: 'Sn',
      valueGetter: p => p.row.sn.substring(10, 34),
      width: 128,
      renderCell: ( p ) => (
        <Link
          href={{
            pathname: pathName,
            query: {
              addr: p.row.addr
              // fileInfo: p.row,
              // snOfDoc: p.row.sn.substring(10, 34),
            },
          }}
          // as={ pathAs }
        >
          { parseInt(p.row.sn.substring(10, 18)).toString().padStart(2, '0')} - {longSnParser(parseInt(p.row.sn.substring(18, 34)).toString())}
        </Link>
      )
    },
    {
      field: 'indexCard',
      headerName: 'IndexCard',
      valueGetter: p => p.row,
      width: 128,
      headerAlign:'center',
      align: 'center',
      renderCell:({value})=>(
        <Button
          variant='outlined'
          size='small'
          fullWidth
          onClick={()=>{
            setFile(value);
            setOpen(true);
          }}
          startIcon={
            <BookOutlined />
          }
        >
          Index
        </Button>
      )
    },
    {
      field: 'author',
      headerName: 'Author',
      valueGetter: p => longSnParser(Number(p.row.sn.substring(34, 44)).toString()),
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
      valueGetter: p => dateParser(parseInt(`0x${p.row.sn.substring(54, 66)}`).toString()),
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'circulateDate',
      headerName: 'CirculateDate',
      valueGetter: p => dateParser(p.row.head.circulateDate.toString()),
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'closingDeadline',
      headerName: 'ClosingDeadline',
      valueGetter: p => dateParser((p.row.head.circulateDate + (p.row.head.closingDays * 86400)).toString()),
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'addr',
      headerName: 'Address',
      valueGetter: p => p.row.addr,
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell:({value})=>(
        <CopyLongStrSpan title='Addr' src={value} />
      )
    },
    {
      field: 'state',
      headerName: 'State',
      valueGetter: p => p.row.head.state,
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ 
            labState[value - 1] == 'Closed' && title == 'SHA List' 
              ? 'In Force' 
              : labState[value - 1]
          } 
          sx={{width: 128}}
          color={
            value == 6
            ? 'success'
            : value == 5
              ? 'error'
              : value == 4
                ? 'info'
                : value == 3
                  ? 'secondary'
                  : value == 2
                    ? 'primary'
                    : value == 1
                      ? 'warning'
                      : 'default'
          }
        />
      )
    },
  ];
  
  return (
    <TableContainer component={Paper} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>{ title }</b>
        </Typography>

      {list && (
        <DataGrid
          initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
          pageSizeOptions={[5, 10, 15, 20]} 
          rows={ list } 
          columns={ columns }
          getRowId={(row:InfoOfFile) => (row.sn.substring(10, 34)) } 
          disableRowSelectionOnClick
        />
      )}


    </TableContainer>
  )
}



