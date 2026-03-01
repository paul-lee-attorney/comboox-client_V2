import { IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { baseToDollar, longSnParser, } from "../../../common/toolsKit";
import { RequestProps } from "../ror";
import { CloudDownloadOutlined, Refresh } from "@mui/icons-material";
import { exportToExcel } from "../../../../api/dataTools";

export interface RequestsListProps {
  titleOfList: string,
  paid: bigint,
  value: bigint,
  list: RequestProps[];
  refresh: ()=>void;
}

export function RequestsList({list, titleOfList, paid, value, refresh}: RequestsListProps) {

  const columns: GridColDef[] = [
    {
      field: 'seqOfPack',
      headerName: 'SeqOfPack',
      valueGetter: p => longSnParser(p.row.seqOfPack.toString()),
      headerAlign: 'center',
      align:'center',
      width: 218,
    },
    {
      field: 'class',
      headerName: 'Class',
      valueGetter: p => longSnParser(p.row.class.toString()),
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'seqOfShare',
      headerName: 'SeqOfShare',
      valueGetter: p => longSnParser(p.row.seqOfShare.toString()),
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'navPrice',
      headerName: 'NavPrice',
      valueGetter: p => baseToDollar(p.row.navPrice.toString()),
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'shareholder',
      headerName: 'Shareholder',
      valueGetter: p => longSnParser(p.row.shareholder.toString()),
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
      field: 'value',
      headerName: 'Value',
      valueGetter: p => baseToDollar(p.row.value.toString()),
      headerAlign: 'right',
      align:'right',      
      width: 256,
    },
  ];

  const exportData = ()=>{

    const rows = list.map(v => ({
      ...v,
      seqOfPack: longSnParser(v.seqOfPack.toString()),
      class: longSnParser(v.class.toString()),
      seqOfShare: longSnParser(v.seqOfShare.toString()),
      navPrice: baseToDollar(v.navPrice.toString()),
      shareholder: longSnParser(v.shareholder.toString()),
      paid: baseToDollar(v.paid.toString()),
      value: baseToDollar(v.value.toString()),
    }));

    const title = titleOfList;

    exportToExcel(rows, title);
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction={'row'} sx={{ alignItems:'center' }} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>{titleOfList} Paid: { baseToDollar(paid.toString()) } Value: {baseToDollar(value.toString())}</b>  
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
        getRowId={(row:RequestProps) => (row.seqNum)} 
        columns={ columns }
        disableRowSelectionOnClick
      />

    </Paper>
  );
} 