import { Dispatch, SetStateAction, useState, } from "react";
import { IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MaxPrice } from "../../../common";
import { DataGrid, GridColDef, GridEventListener } from "@mui/x-data-grid";
import { baseToDollar, dateParser, defFormResults, FormResults, longSnParser, onlyInt } from "../../../common/toolsKit";
import { BriefProps } from "../loe";
import { CloudDownloadOutlined, Refresh } from "@mui/icons-material";
import { exportToExcel } from "../../../../api/dataTools";

export interface DealsListProps {
  list: readonly BriefProps[];
  qty: string;
  amt: string;
  setDeal: Dispatch<SetStateAction<BriefProps | undefined>>;
  setShow: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function DealsList({list, qty, amt, refresh, setDeal, setShow}: DealsListProps) {

  const columns: GridColDef[] = [
    {
      field: 'blockNumber',
      headerName: 'BlockNumber',
      valueGetter: p => longSnParser(p.row.blockNumber.toString()),
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'timestamp',
      headerName: 'Date',
      valueGetter: p => dateParser(p.row.timestamp.toString()),
      headerAlign: 'center',
      align:'center',      
      width: 180,
    },
    {
      field: 'buyer',
      headerName: 'Buyer',
      valueGetter: p => p.row.buyer,
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'paid',
      headerName: 'Paid',
      valueGetter: p => baseToDollar(p.row.paid.toString()),
      headerAlign: 'right',
      align:'right',      
      width: 256,
    },
    {
      field: 'price',
      headerName: 'PriceOfPaid',
      valueGetter: p => baseToDollar(p.row.price.toString()),
      headerAlign: 'right',
      align:'right',      
      width: 256,
    },
    {
      field: 'value',
      headerName: 'Value',
      valueGetter: p => baseToDollar((BigInt(p.row.paid) * BigInt(p.row.price) / 10000n).toString()),
      headerAlign: 'right',
      align:'right',      
      width: 256,
    },
    { 
      field: 'consideration', 
      headerName: 'Value (ETH)',
      valueGetter: p => baseToDollar((p.row.consideration / 10n ** 14n).toString()),
      headerAlign: 'right',
      align:'right',
      width: 256,
    },    
  ];

  const exportData = ()=>{

    const rows = list.map(v => ({
      ...v,
      blockNumber: longSnParser(v.blockNumber.toString()),
      timestamp: dateParser(v.timestamp.toString()),
      buyer: v.buyer,
      paid: baseToDollar(v.paid.toString()),
      price: baseToDollar(v.price.toString()),
      value: baseToDollar((BigInt(v.paid) * BigInt(v.price) / 10000n).toString()),
      consideration: baseToDollar((v.consideration / 10n ** 9n).toString()),
    }));

    const title = 'Deals List';

    exportToExcel(rows, title);
  }

  // const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setDeal(p.row);
    setShow(true);
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction={'row'} sx={{ alignItems:'center' }} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Deals List</b>  
        </Typography>

        <Typography variant='h5' sx={{ m:2 }}  >
          (Paid: { qty} / Value: { amt })
        </Typography>

        <Tooltip 
          title='Refresh List' 
          placement='right' 
          arrow 
        >
          <IconButton 
            size='small'
            sx={{ mx:5 }}
            onClick={()=>refresh()}
            color="primary"
          >
            <Refresh />
          </IconButton>
        </Tooltip>

        <Tooltip title='Export Data' placement="top" arrow >
          <IconButton size="medium" sx={{m:1}} color="primary" onClick={()=>exportData()}>
            <CloudDownloadOutlined />
          </IconButton>
        </Tooltip>

      </Stack>

      <DataGrid 
        initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        getRowId={(row:BriefProps) => (row.seqOfDeal)} 
        columns={ columns }
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
      />

    </Paper>
  );
} 