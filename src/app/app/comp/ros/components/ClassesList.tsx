import { Chip,Paper,Typography } from '@mui/material';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid'

import { baseToDollar, dateParser, longDataParser, longSnParser } from '../../../common/toolsKit';

import { Share } from '../ros';

const columns: GridColDef[] = [
  { 
    field: 'class', 
    headerName: 'Class',
    valueGetter: p => p.row.head.class,
    renderCell: ({ value }) => (
      <Chip 
        label={value} 
        color={ value % 7 == 1
          ? 'primary'
          : value % 7 == 2
            ? 'default'
              : value % 7 == 3
                ? 'secondary'
                  : value % 7 == 4
                    ? 'info' 
                      : value % 7 == 5
                        ? 'success'
                          : value % 7 == 6
                            ? 'warning'
                            : 'error'} 
      />),
    headerAlign:'center',
    align: 'center',
    width: 88,
  },
  { 
    field: 'issueDate', 
    headerName: 'IssueDate',
    valueGetter: p => dateParser(p.row.head.issueDate.toString()),
    headerAlign: 'center',
    align:'center',
    width: 168,
  },
  { 
    field: 'par', 
    headerName: 'Par',
    valueGetter: p => baseToDollar(p.row.body.par.toString()),
    headerAlign: 'right',
    align:'right',
    width: 218,
  },
  { 
    field: 'paid', 
    headerName: 'Paid',
    valueGetter: p => baseToDollar(p.row.body.paid.toString()),
    headerAlign: 'right',
    align:'right',
    width: 218,
  },
  { 
    field: 'clean', 
    headerName: 'CleanPaid',
    valueGetter: p => baseToDollar(p.row.body.cleanPaid.toString()),
    headerAlign: 'right',
    align:'right',
    width: 218,
  },
  { 
    field: 'votingWeight', 
    headerName: 'VotingWeight (%)',
    valueGetter: p => longDataParser(p.row.head.votingWeight.toString()),
    headerAlign: 'center',
    align:'center',
    width: 188,
  },
  { 
    field: 'distrWeight', 
    headerName: 'DistributionWeight (%)',
    valueGetter: p => longDataParser(p.row.body.distrWeight.toString()),
    headerAlign: 'center',
    align:'center',
    width: 188,
  },
];

interface ClassesListProps {
  list: readonly Share[],
  setShare: (share:Share)=>void,
  setOpen: (flag:boolean)=>void,
}

export function ClassesList({ list, setShare, setOpen }:ClassesListProps ) {

  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setShare({head: p.row.head, body: p.row.body});
    setOpen(true);
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider', width:'100%' }} >

      <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
        <b>Classes List</b>
      </Typography>
      <DataGrid 
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        getRowId={row => row.head.class} 
        rows={ list } 
        columns={ columns }
        disableRowSelectionOnClick
        onRowClick={ handleRowClick }
      />   

    </Paper>
  )
}



