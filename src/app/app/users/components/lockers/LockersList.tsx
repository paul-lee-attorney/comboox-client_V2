import { 
  Paper, Toolbar,
} from '@mui/material';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid'
import { bigIntToStrNum, dateParser, longDataParser, longSnParser } from '../../../common/toolsKit';
import { StrLocker } from '../../../rc';

import { Dispatch, SetStateAction } from 'react';
import { LockerFinder } from './LockerFinder';

const columns: GridColDef[] = [
  { 
    field: 'lock', 
    headerName: 'HashLock',
    valueGetter: p => p.row.hashLock.substring(0,6) + '...' + p.row.hashLock.substring(62,66),
    width: 120,
  },
  { 
    field: 'from', 
    headerName: 'From',
    valueGetter: p => longSnParser(p.row.head.from),
    headerAlign: 'center',
    align: 'center',
    width: 268,
  },
  { 
    field: 'to', 
    headerName: 'To',
    valueGetter: p => longSnParser(p.row.head.to),
    headerAlign: 'center',
    align: 'center',
    width: 268,
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
    valueGetter: p => bigIntToStrNum(BigInt(p.row.head.value), 9),
    headerAlign: 'right',
    align:'right',
    width: 330,
  }
];

interface LocksListProps {
  list: StrLocker[],
  setLocker: Dispatch<SetStateAction<StrLocker>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
}

export function LockersList({ list, setLocker, setOpen }:LocksListProps ) {

  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setLocker({hashLock: p.row.hashLock, head: p.row.head, body: p.row.body});
    setOpen(true);
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, border: 1, borderColor:'divider'}} >
      <Toolbar>
        <h4>CBP Lockers List</h4>
      </Toolbar>

      <LockerFinder setLocker={ setLocker } setOpen={ setOpen } />

      <DataGrid 
        sx={{ m:1 }}
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        getRowId={row => row.hashLock} 
        rows={ list } 
        columns={ columns }
        disableRowSelectionOnClick
        onRowClick={ handleRowClick }
      />      
    </Paper>
  )
}



