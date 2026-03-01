
import { TableContainer, Paper, Chip,Stack, Typography} from '@mui/material';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { Deal, dealState } from '../../ia';
import { baseToDollar, longDataParser, longSnParser, } from '../../../../../common/toolsKit';
import { Dispatch, SetStateAction } from 'react';

interface DealsListProps {
  list: Deal[];
  setDeal: Dispatch<SetStateAction<Deal>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function DealsList({ list, setDeal, setOpen }:DealsListProps ) {
  
  const columns: GridColDef[] = [
    {
      field: 'seqOfDeal', 
      headerName: 'Seq',
      valueGetter: p => p.row.head.seqOfDeal.toString(),
      width: 58,
      renderCell: ({ value }) => (
        <Chip
          variant="outlined"
          color='primary'
          // sx={{ minWidth: 58 }}
          label={ value } 
        />
      )
    },
    {
      field: 'seqOfShare',
      headerName: 'SeqOfCert',
      valueGetter: p => longSnParser(p.row.head.seqOfShare.toString()),
      width: 128,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'seller',
      headerName: 'Seller',
      valueGetter: p => longSnParser(p.row.head.seller.toString()),
      width: 218,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'buyer',
      headerName: 'Buyer',
      valueGetter: p => longSnParser(p.row.body.buyer.toString()),
      width: 218,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'par',
      headerName: 'Par',
      valueGetter: p => baseToDollar(p.row.body.par.toString()),
      width: 218,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'paid',
      headerName: 'Paid',
      valueGetter: p => baseToDollar(p.row.body.paid.toString()),
      width: 218,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'priceOfPaid',
      headerName: 'PriceOfPaid',
      valueGetter: p => baseToDollar(p.row.head.priceOfPaid.toString()),
      width: 218,
      headerAlign:'right',
      align: 'right',
    },
    {
      field: 'votingWeight',
      headerName: 'VotingWeight (%)',
      valueGetter: p => p.row.head.typeOfDeal == '1' 
          ? longDataParser(p.row.head.votingWeight.toString())
          : 'N/A',
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'distrWeight',
      headerName: 'DistrWeight (%)',
      valueGetter: p => p.row.head.typeOfDeal == '1'
          ? longDataParser(p.row.body.distrWeight.toString())
          : 'N/A',
      width: 218,
      headerAlign:'center',
      align: 'center',
    },
    {
      field: 'state',
      headerName: 'State',
      valueGetter: p => p.row.body.state,
      width: 128,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='outlined'
          label={ dealState[value] } 
          sx={{width: 128}}
          color={
            value == 3
            ? 'success'
            : value == 4
              ? 'error'
              : value == 2
                ? 'info'
                : value == 1
                    ? 'primary'
                    : 'default'
          }
        />
      )
    },
  ];
  
  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setDeal({head: p.row.head, body: p.row.body, hashLock: p.row.hashLock});
    setOpen(true);
  }

  return (
    <TableContainer component={Paper} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }} >        

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Deals List</b>
        </Typography>

      </Stack>

      <DataGrid
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        columns={ columns }
        getRowId={(row:Deal) => (row.head.seqOfDeal) } 
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
      />

    </TableContainer>
  )
}



