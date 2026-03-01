
import { Paper, Toolbar, Chip } from '@mui/material';

import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Member } from '../../../lop';
import { Dispatch, SetStateAction } from 'react';
import { centToDollar, longSnParser } from '../../../../../common/toolsKit';

export interface GetTeamsListProps {
  setSeq: Dispatch<SetStateAction<number>>;
  list: readonly Member[];
}

export function GetTeamsList({ setSeq, list }:GetTeamsListProps ) {
  
  const handleRowSelect = (ids: GridRowSelectionModel) => setSeq(Number(ids[0]));

  const columns: GridColDef[] = [
    {
      field: 'seqOfTeam', 
      headerName: 'Team',
      valueGetter: p => longSnParser(p.row.seqOfTeam.toString()),
      width: 80,
    },
    {
      field: 'userNo',
      headerName: 'Leader',
      valueGetter: p => longSnParser(p.row.userNo.toString()),
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
      field: 'budgetAmt', 
      headerName: 'BudgetAmt',
      valueGetter: p => centToDollar(p.row.budgetAmt.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    { 
      field: 'approvedAmt', 
      headerName: 'ApprovedAmt',
      valueGetter: p => centToDollar(p.row.approvedAmt.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    { 
      field: 'workHours', 
      headerName: 'PendingAmt',
      valueGetter: p => centToDollar(p.row.workHours.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    { 
      field: 'receivableAmt', 
      headerName: 'ReceivableAmt',
      valueGetter: p => centToDollar(p.row.receivableAmt.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    { 
      field: 'paidAmt', 
      headerName: 'PaidAmt',
      valueGetter: p => centToDollar(p.row.paidAmt.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    {
      field: 'state',
      headerName: 'State',
      valueGetter: p => p.row.state,
      width: 128,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ 
            value == 1
            ? 'Enrolled'
            : 'Pending'
          } 
          color={
            value == 1
            ? 'primary'
            : 'default'
          }
        />
      )
    }
  ];
  
  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>

      <Toolbar sx={{ mr:5, textDecoration:'underline', }}>
        <b>Payroll Of Teams</b>
      </Toolbar>

      <DataGrid
        initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        columns={ columns }
        getRowId={(row:Member) => (row.seqOfTeam.toString())} 
        onRowSelectionModelChange={ handleRowSelect }
      />

    </Paper>
  )
}



