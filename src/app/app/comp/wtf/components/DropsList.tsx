import { IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { baseToDollar, dateParser, longSnParser, } from "../../../common/toolsKit";
import { DropProps, } from "../wtf";
import { CloudDownloadOutlined, Refresh } from "@mui/icons-material";
import { exportToExcel } from "../../../../api/dataTools";
import { booxMap } from "../../../common";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { useEffect, useState } from "react";
import { counterOfShares } from "../../ros/ros";

export interface DropsListProps {
  list: DropProps[];
}

export function DropsList({list}: DropsListProps) {

  const {boox} = useComBooxContext();

  const [maxSeqOfShare, setMaxSeqOfShare] = useState(0);

  useEffect(()=>{
    if (boox) {
      counterOfShares(boox[booxMap.ROS]).then(
        res => setMaxSeqOfShare(res)
      );
    }
  }, [boox]);

  const columns: GridColDef[] = [

    {
      field: 'seq',
      headerName: 'SeqNum',
      valueGetter: p => longSnParser(p.row.seqNum.toString()),
      headerAlign: 'center',
      align:'center',
      width: 128,
    },
    {
      field: 'seqOfDistr',
      headerName: 'SeqOfDistr',
      valueGetter: p => longSnParser(p.row.seqOfDistr.toString()),
      headerAlign: 'center',
      align:'center',
      width: 218,
    },
    {
      field: 'member',
      headerName: 'Member',
      valueGetter: p => longSnParser(p.row.member.toString()),
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
      headerName: 'SeqOfShare/Date',
      valueGetter: p => p.row.distrDate > maxSeqOfShare
        ? dateParser(p.row.distrDate.toString()) 
        : longSnParser(p.row.distrDate.toString()),
      headerAlign: 'center',
      align:'center',
      width: 218,
    },
    {
      field: 'principal',
      headerName: 'Principal',
      valueGetter: p => baseToDollar((p.row.principal / 100n).toString()),
      headerAlign: 'center',
      align:'center',      
      width: 218,
    },
    {
      field: 'income',
      headerName: 'Income',
      valueGetter: p => baseToDollar((p.row.income / 100n).toString()),
      headerAlign: 'right',
      align:'right',      
      width: 256,
    },
  ];

  const exportData = ()=>{

    const rows = list.map(v => ({
      ...v,
      seq: longSnParser(v.seqNum.toString()),
      seqOfDistr: longSnParser(v.seqOfDistr.toString()),
      class: longSnParser(v.class.toString()),
      seqOfShare: longSnParser(v.distrDate.toString()),
      member: longSnParser(v.member.toString()),
      principal: baseToDollar(v.principal.toString()),
      income: baseToDollar(v.income.toString()),
    }));

    const title = 'Distribution Drops List';

    exportToExcel(rows, title);
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction={'row'} sx={{ alignItems:'center' }} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Drops List</b>  
        </Typography>

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
        getRowId={(row:DropProps) => (row.seqNum)} 
        columns={ columns }
        disableRowSelectionOnClick
      />

    </Paper>
  );
} 