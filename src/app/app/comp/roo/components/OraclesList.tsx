import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";

import { dateParser, bigIntToStrNum, longSnParser } from "../../../common/toolsKit";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CheckPoint } from "../roo";

const columns: GridColDef[] = [
  { 
    field: 'timestamp', 
    headerName: 'Timestamp',
    valueGetter: p => dateParser(p.row.timestamp.toString()),
    width: 180,
  },
  { 
    field: 'p1', 
    headerName: 'Para-1',
    valueGetter: p => bigIntToStrNum(p.row.paid, 4),
    headerAlign: 'right',
    align:'right',
    width: 180,
  },
  { 
    field: 'p2', 
    headerName: 'Para-2',
    valueGetter: p => bigIntToStrNum(p.row.par, 4),
    headerAlign: 'right',
    align:'right',
    width: 180,
  },  
  { 
    field: 'p3', 
    headerName: 'Para-3',
    valueGetter: p => bigIntToStrNum(p.row.cleanPaid, 4),
    headerAlign: 'right',
    align:'right',
    width: 180,
  },
];

interface OraclesListProps{
  list: readonly CheckPoint[];
  seqOfOpt: number;
}

export function OraclesList({ list, seqOfOpt }: OraclesListProps) {

  const [ open, setOpen ] = useState(false);
  const [ oracle, setOracle ] = useState<CheckPoint>();

  useEffect(()=>{
    let len = list.length;
    if (len > 0)
      setOracle(list[len-1]);
  }, [list])

  const handleClick = ()=>{
    setOpen(true);
  }

  return (
    <>
      <Button 
        variant="outlined" 
        fullWidth
        sx={{
          m:1, height:40
        }} 
        onClick={ handleClick } 
      >

        <Typography
          variant="body2"
          fontWeight="xl"
          color="primary"
        >
          Oracles : 
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx:2 }} />

        <Typography
          variant="body2"
          fontWeight="xl"
          color="primary"
        >
          p1: {bigIntToStrNum((oracle?.paid ?? 0n), 4)}
        </Typography>
        
        <Divider orientation="vertical" flexItem sx={{ mx:2 }} />

        <Typography
          variant="body2"
          fontWeight="xl"
          color="primary"
        >
          p2: {bigIntToStrNum((oracle?.par ?? 0n), 4)}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx:2 }} />

        <Typography
          variant="body2"
          fontWeight="xl"
          color="primary"
        >        
          p3: {bigIntToStrNum((oracle?.points ?? 0n), 4)}
        </Typography>

      </Button>

      <Dialog
        maxWidth="xl"
        fullWidth
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
        sx={{m:1, p:1}}
      >
        <DialogTitle id="dialog-title">
          Oracles List For The Option - { longSnParser( seqOfOpt.toString() )}
        </DialogTitle>

        <DialogContent>

          <Box sx={{minWidth: '1280' }}>
            {list && (
              <DataGrid 
                initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
                pageSizeOptions={[5, 10, 15, 20]} 
                getRowId={row => row.timestamp} 
                rows={ list } 
                columns={ columns }
                disableRowSelectionOnClick
              />      
            )}
          </Box>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  )

}