import { useEffect, useState } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { booxMap } from '../../../common';
import { bigIntToStrNum, longDataParser, longSnParser, splitStrArr, userNoParser } from '../../../common/toolsKit';

import { getEquityList, MemberShareClip, sortedMembersList } from '../rom';

import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

import { AccountCircle, NumbersOutlined, StarsOutlined } from '@mui/icons-material';
import { ToClipboard } from '../../../common/ToClipboard';

const columns: GridColDef[] = [
  {
    field: 'usrNo',
    headerName: 'UserNo',
    valueGetter: (p) => p.row.acct.toString(16),
    width: 188, 
    headerAlign: 'center',
    align: 'center',
    renderCell: ({value}) => (
      <ToClipboard icon={<AccountCircle />} info={ value } />
    ),
  },
  {
    field: 'sharesInHand',
    headerName: 'SharesInHand',
    valueGetter: (p) => (p.row.sharesInHand.map((v:string) => longSnParser(v))),
    width: 168,
    headerAlign: 'center',
    align: 'center',
    renderCell: ({value}) => (
      <TextField 
        variant='outlined'
        fullWidth
        inputProps={{readOnly: true}}
        size="small"
        multiline
        rows={ 1 }
        sx={{
          m:1,
        }}
        value={ splitStrArr(value) }
      />
    )
  },
  {
    field: 'votingPoints',
    headerName: 'VotingPoints',
    valueGetter: (p) => longDataParser(
      bigIntToStrNum((p.row.clip.points), 4)
    ),
    width: 218,
    headerAlign: 'center',
    align: 'center',
  },    
  {
    field: 'distrPoints',
    headerName: 'DistributionPoints',
    valueGetter: (p) => longDataParser(
      bigIntToStrNum((p.row.distr.points), 4)
    ),
    width: 218,
    headerAlign: 'center',
    align: 'center',
  },
]

interface MembersListBtnProps {
  symbol: string;
}

export function MembersListBtn({symbol}: MembersListBtnProps) {
  const { boox } = useComBooxContext();

    const [equityList, setEquityList] = useState<MemberShareClip[]>();
  
    useEffect(()=>{
      if (boox) {
        sortedMembersList(boox[booxMap.ROM]).then(
          ls => {
            let numLs = ls.map(v => Number(v));
            getEquityList(boox[booxMap.ROM], numLs).then(
              list => setEquityList(list)
            )
          }
        );
      }
    }, [boox]); 

  const [ open, setOpen ] = useState(false);

  return (

    <>
      <Button 
        variant='outlined'
        size="small"
        color = 'inherit'
        sx={{
          m:1, height:40, width:168,
        }}
        startIcon={
          <StarsOutlined />
        }
        onClick={ ()=>{
          setOpen(true);
        }}
      >
        { symbol }
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title" 
      >
        <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
          <b>Members List of Entity - ({symbol})</b>
        </DialogTitle>

        <DialogContent>

          {equityList && (  
            <DataGrid
              initialState={{pagination:{paginationModel:{pageSize: 10}}}}
              pageSizeOptions={[5, 10, 15, 20]}
              getRowId={row => row.acct.toString()}
              rows={ equityList }
              columns={ columns }
            />
          )}

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>
    </>
    


  )
}



