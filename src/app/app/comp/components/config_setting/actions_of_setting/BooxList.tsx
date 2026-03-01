
import { Dispatch, SetStateAction } from 'react';

import { TableContainer, Paper, Toolbar, Chip} from '@mui/material';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import { CopyLongStrSpan } from '../../../../common/CopyLongStr';
import { BookInfo } from '../../../gk';
import { HexType } from '../../../../common';

interface BooxListProps {
  title: string;
  list: BookInfo[] | undefined;
  names: string[];
  setTitle: Dispatch<SetStateAction<number>>;
  setAddr: Dispatch<SetStateAction<HexType>>;
}

export function BooxList({ title, list, names, setTitle, setAddr }:BooxListProps ) {
  
  const columns: GridColDef[] = [
    {
      field: 'sn',
      headerName: 'Sn',
      valueGetter: p =>  p.row.title,
      width: 128,
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
      field: 'title',
      headerName: 'Title',
      valueGetter: p =>  p.row.name,
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ value }
        />
      ),
    },
    {
      field: 'addr',
      headerName: 'Address',
      valueGetter: p => p.row.addr,
      width: 268,
      headerAlign:'center',
      align: 'center',
      renderCell: ({value}) => (
        <CopyLongStrSpan title='Addr' src={value} />
      )
    },
    {
      field: 'owner',
      headerName: 'Owner',
      valueGetter: p => p.row.owner,
      width: 268,
      headerAlign:'center',
      align: 'center',
      renderCell: ({value}) => (
        <CopyLongStrSpan title='Owner' src={value} />
      )
    },
    {
      field: 'dk',
      headerName: 'DirectKeeper',
      valueGetter: p => p.row.dk,
      width: 268,
      headerAlign:'center',
      align: 'center',
      renderCell: ({value}) => (
        <CopyLongStrSpan title='DK' src={value} />
      )
    },
  ];
  
  const handleRowClick = (p:GridRowParams)=>{
    setTitle(p.row.title);
    setAddr(p.row.addr);
  }

  return (
    <TableContainer component={Paper} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Toolbar sx={{ textDecoration:'underline' }} >
        <h4>{ title }</h4>
      </Toolbar>

      {list && (
        <DataGrid
          initialState={{pagination:{paginationModel:{pageSize: 15}}}} 
          pageSizeOptions={[5, 10, 15, 20]} 
          rows={ list.filter(v => names[v.title] != 'Blank').
            map((v) => ({...v,name: names[v.title],}))
          } 
          columns={ columns }
          getRowId={ (row:BookInfo) => (row.title) } 
          disableRowSelectionOnClick
          onRowClick={ handleRowClick }
        />
      )}


    </TableContainer>
  )
}



