import { Box, Chip, Paper, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridEventListener } from "@mui/x-data-grid";
import { dateParser, longSnParser } from "../../../common/toolsKit";
import { Motion, motionType, statesOfMotion } from "../meetingMinutes";

interface GetMotionsListProps {
  list: Motion[];
  title: string;
  setMotion: (motion: Motion) => void;
  setOpen: (flag: boolean) => void;
}

export function GetMotionsList({ list, title, setMotion, setOpen }:GetMotionsListProps) {

  const columns: GridColDef[] = [
    {
      field: 'sn',
      headerName: 'Sn',
      valueGetter: p => longSnParser(p.row.head.seqOfMotion.toString()),
      width: 120,    
    },
    {
      field: 'typeOfMotion',
      headerName: 'TypeOfMotion',
      valueGetter: p => motionType[p.row.head.typeOfMotion - 1],
      width: 120,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'seqOfVR',
      headerName: 'SeqOfVR',
      valueGetter: p => p.row.head.seqOfVR,
      width: 120,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'creator',
      headerName: 'Creator',
      valueGetter: p => longSnParser(p.row.head.creator.toString()),
      width: 160,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'createDate',
      headerName: 'CreateDate',
      valueGetter: p => dateParser( p.row.head.createDate.toString() ),
      width: 180,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'proposer',
      headerName: 'Proposer',
      valueGetter: p => p.row.body.proposer > 0
          ? longSnParser(p.row.body.proposer.toString())
          : '-',
      width: 160,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'proposeDate',
      headerName: 'ProposeDate',
      valueGetter: p => p.row.body.proposeDate > 0
          ? dateParser(p.row.body.proposeDate.toString())
          : '-',
      width: 180,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'voteStartDate',
      headerName: 'VoteStartDate',
      valueGetter: p => p.row.body.voteStartDate > 0
          ? dateParser(p.row.body.voteStartDate.toString())
          : '-',
      width: 180,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'voteEndDate',
      headerName: 'VoteEndDate',
      valueGetter: p => p.row.body.voteEndDate > 0
          ? dateParser(p.row.body.voteEndDate.toString())
          : '-',
      width: 180,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'state',
      headerName: 'State',
      valueGetter: p => statesOfMotion[p.row.body.state - 1],
      renderCell: ({ value }) => (
        <Chip
          sx={{width: 168}} 
          label={ value }
          variant="filled"
          color={
            value == 'Passed' 
                ? 'success'
                : value == 'Rejected' || value == 'Rejected_NotToBuy' 
                ? 'default'
                : value == 'Created'
                ? 'primary'
                : value == 'Proposed'
                ? 'error'
                : value == 'Rejected_ToBuy'
                ? 'warning'
                : value == 'Executed'
                ? 'info'
                : 'default'
          }
        />
      ),
      width: 180,
      headerAlign: 'center',
      align: 'center',
    },
  ];
  
  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setMotion({head: p.row.head, body: p.row.body, votingRule: p.row.votingRule, contents: p.row.contents});
    setOpen(true);
  }

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
          getRowId={(row:Motion) => row.head.seqOfMotion.toString() } 
          columns={ columns }
          disableRowSelectionOnClick
          onRowClick={ handleRowClick }
        />      
      </Box>
    </Paper>
  );
}