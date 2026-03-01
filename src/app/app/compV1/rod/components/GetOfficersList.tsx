import { Box, Paper, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dateParser, longSnParser } from "../../../common/toolsKit";

import { Position } from "../rod";
import { titleOfPositions } from "../../roc/sha/sha";

import { GetPosition } from "./GetPosition";
import { GetFullPosInfoInHand } from "./GetFullPosInfoInHand";

interface GetOfficersListProps {
  list: readonly Position[];
  title: string;
}

export function GetOfficersList({ list, title }:GetOfficersListProps) {

  const columns: GridColDef[] = [
    {
      field: 'sn',
      headerName: 'Sn',
      valueGetter: p => longSnParser(p.row.seqOfPos.toString()),
      renderCell: ({ value }) => (
        <GetPosition seq={value} />
      ),
      width: 288,    
    },
    {
      field: 'title',
      headerName: 'Title',
      valueGetter: p => titleOfPositions[p.row.title - 1],
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'userNo',
      headerName: 'UserNo',
      valueGetter: p => p.row.acct,
      renderCell: ({value}) => (
        <GetFullPosInfoInHand userNo={value} />
      ),
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'nominator',
      headerName: 'Nominator',
      valueGetter: p => longSnParser(p.row.nominator.toString()),
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'titleOfNominator',
      headerName: 'TitleOfNominator',
      valueGetter: p => titleOfPositions[p.row.titleOfNominator - 1],
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'startDate',
      headerName: 'StartDate',
      valueGetter: p => p.row.startDate > 0
        ? dateParser(p.row.startDate.toString())
        : '-',
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'endDate',
      headerName: 'EndDate',
      valueGetter: p => p.row.endDate > 0
          ? dateParser(p.row.endDate.toString())
          : '-',
      width: 218,
      headerAlign: 'center',
      align: 'center',
    },
  ];
  
  return (
    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }} >
      <Box sx={{width: '100%', color: 'black' }} >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>{ title }</b>
        </Typography>
        <DataGrid 
          initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
          pageSizeOptions={[5, 10, 15, 20]} 
          rows={ list } 
          getRowId={(row:Position) => row.seqOfPos.toString() } 
          columns={ columns }
          disableRowSelectionOnClick
        />      
      </Box>
    </Paper>
  );
}