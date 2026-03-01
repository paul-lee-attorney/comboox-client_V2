
import { Paper, Toolbar, Chip } from '@mui/material';

import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Member, defaultMember, getMembersOfTeam } from '../../../lop';
import { centToDollar, longDataParser, longSnParser } from '../../../../../common/toolsKit';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { MemberInfoProps } from '../Member/MemberInfo';

export interface GetMembersListProps extends MemberInfoProps{
  setSeq: Dispatch<SetStateAction<number>>;
}

export function GetMembersList({ addr, time, seqOfTeam, setSeq }:GetMembersListProps ) {

  const [ list, setList ] = useState<readonly Member[]>([defaultMember]);

  useEffect(() => {
    if (seqOfTeam > 0) {
      getMembersOfTeam(addr, seqOfTeam).then(
        res => setList(res)
      );
    }
  }, [addr, seqOfTeam, time]);


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
      headerName: 'User',
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
      field: 'rate', 
      headerName: 'Rate',
      valueGetter: p => centToDollar(p.row.rate.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
    },
    { 
      field: 'workHours', 
      headerName: 'Work Hours',
      valueGetter: p => longDataParser(p.row.workHours.toString()),
      headerAlign: 'right',
      align:'right',
      width: 128,
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
      headerName: 'PendingAmt',
      valueGetter: p => centToDollar(p.row.approvedAmt.toString()),
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
            : value == 2
              ? 'Applied'
              : value == 3
                ? 'Verified'
                : 'Pending'
          } 
          color={
            value == 1
            ? 'primary'
            : value == 2
              ? 'success'
              : value == 3
                ? 'warning'
                : 'default'
          }
        />
      )
    }
  ];
  
  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>

      <Toolbar sx={{ mr:5, textDecoration:'underline' }}>
        <b>Payroll of Members</b>
      </Toolbar>

      <DataGrid
        initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        columns={ columns }
        getRowId={(row:Member) => (row.userNo.toString()) } 
        onRowSelectionModelChange={ handleRowSelect }
      />

    </Paper>
  )
}



