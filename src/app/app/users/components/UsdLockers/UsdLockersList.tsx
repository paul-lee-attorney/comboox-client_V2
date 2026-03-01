import { 
  Paper, Toolbar,
} from '@mui/material';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid'
import { bigIntToStrNum, dateParser, longSnParser } from '../../../common/toolsKit';


import { Dispatch, SetStateAction } from 'react';
import { CopyLongStrSpan } from '../../../common/CopyLongStr';

import { UsdLockerFinder } from './UsdLockerFinder';
import { ItemLocker } from '../../../cl';

const columns: GridColDef[] = [
  { 
    field: 'lock', 
    headerName: 'HashLock',
    valueGetter: p => p.row.lock,
    width: 268,
    headerAlign:'center',
    align: 'center',    
    renderCell: ({value}) => (
      <CopyLongStrSpan title='Lock' src={value} />
    )
  },
  {
    field: 'from',
    headerName: 'From',
    valueGetter: p => p.row.head.from,
    width: 268,
    headerAlign:'center',
    align: 'center',
    renderCell: ({value}) => (
      <CopyLongStrSpan title='Addr' src={value} />
    )
  },
  {
    field: 'to',
    headerName: 'To',
    valueGetter: p => p.row.head.to,
    width: 268,
    headerAlign:'center',
    align: 'center',
    renderCell: ({value}) => (
      <CopyLongStrSpan title='Addr' src={value} />
    )
  },
  { 
    field: 'expireDate', 
    headerName: 'ExpireDate',
    valueGetter: p => dateParser(p.row.head.expireDate),
    headerAlign: 'center',
    align:'center',
    width: 180,
  },
  { 
    field: 'amt', 
    headerName: 'Amount',
    valueGetter: p => bigIntToStrNum(p.row.head.amt, 6),
    headerAlign: 'right',
    align:'right',
    width: 330,
  }
];

interface UsdLocksListProps {
  list: ItemLocker[],
  setLocker: Dispatch<SetStateAction<ItemLocker>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
}

export function UsdLockersList({ list, setLocker, setOpen }:UsdLocksListProps ) {

  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setLocker({lock: p.row.lock, head: p.row.head, body: p.row.body});
    setOpen(true);
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, border: 1, borderColor:'divider'}} >
      <Toolbar>
        <h4>USD Lockers List</h4>
      </Toolbar>

      <UsdLockerFinder setLocker={ setLocker } setOpen={ setOpen } />

      <DataGrid 
        sx={{ m:1 }}
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        getRowId={row => row.lock} 
        rows={ list } 
        columns={ columns }
        disableRowSelectionOnClick
        onRowClick={ handleRowClick }
      />      
    </Paper>
  )
}



