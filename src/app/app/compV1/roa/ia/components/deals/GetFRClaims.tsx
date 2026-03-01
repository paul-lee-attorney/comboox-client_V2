import { useEffect, useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Toolbar } from "@mui/material";
import { Calculate, ListAltOutlined } from "@mui/icons-material";
import { useGeneralKeeperComputeFirstRefusal } from "../../../../../../../../generated-v1";
import { baseToDollar, dateParser, longSnParser, refreshAfterTx, toPercent } from "../../../../../common/toolsKit";
import { ActionsOfDealCenterProps } from "./ActionsOfDeal";
import { FRClaim, getFRClaimsOfDeal, hasFRClaims } from "../../../roa";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { defaultDeal } from "../../ia";
import { CopyLongStrSpan } from "../../../../../common/CopyLongStr";
import { HexType, booxMap } from "../../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

export function GetFRClaims({addr, deal, setOpen, setDeal, refresh, timeline, timestamp}: ActionsOfDealCenterProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ claims, setClaims ] = useState<readonly FRClaim[]>([]);
  const [ appear, setAppear ] = useState(false);

  const columns: GridColDef[] = [
    {
      field: 'seqOfDeal', 
      headerName: 'SeqOfDeal',
      valueGetter: p => longSnParser(p.row.seqOfDeal.toString()),
      width: 128,
      headerAlign:'center',
      align:'center',
    },

    { 
      field: 'claimer', 
      headerName: 'Claimer',
      valueGetter: p => longSnParser(p.row.claimer.toString()),
      headerAlign:'right',
      align: 'right',
      width: 218,
    },
    { 
      field: 'weight', 
      headerName: 'Weight',
      valueGetter: p => baseToDollar(p.row.weight.toString()) ,
      headerAlign:'right',
      align: 'right',
      width: 218,
    },
    { 
      field: 'ratio', 
      headerName: 'Ratio',
      valueGetter: p => toPercent(p.row.ratio.toString()) ,
      headerAlign:'center',
      align: 'center',
      width: 218,
    },
    { 
      field: 'sigDate', 
      headerName: 'SigDate',
      valueGetter: p => dateParser(p.row.sigDate.toString()) ,
      headerAlign:'center',
      align: 'center',
      width: 218,
    },
    { 
      field: 'sigHash', 
      headerName: 'SigHash',
      valueGetter: p => p.row.sigHash,
      headerAlign:'center',
      align: 'center',
      width: 218,
      renderCell:({value})=>(
        <CopyLongStrSpan title='Hash' src={value} />
      )
    },
  ]
  
  useEffect(()=>{
    if (boox) {
      hasFRClaims(boox[booxMap.ROA], addr, deal.head.seqOfDeal).then(
        flag => {
          if (flag) getFRClaimsOfDeal(boox[booxMap.ROA], addr, deal.head.seqOfDeal).then(
            v => setClaims(v)
          );
        }
      );
    }
  }, [boox, addr, deal.head.seqOfDeal]);

  const handleClick = () => {
    setAppear(true);
  }

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: computeFirstRefusalLoading,
    write: computeFirstRefusal,
  } = useGeneralKeeperComputeFirstRefusal({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const computeClick = ()=>{
    computeFirstRefusal({
      args: [ addr, BigInt(deal.head.seqOfDeal)],
    })
  }

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<ListAltOutlined />}
        sx={{ m:1, height:40 }}
        onClick={handleClick}
      >
        FR Claims ({claims?.length})
      </Button>

      <Dialog
        maxWidth={false}
        open={appear}
        onClose={()=>setAppear(false)}
        aria-labelledby="dialog-title"
      >

        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
          <b>First Refusal Claims</b>
        </DialogTitle>

        <DialogContent>

          <Box sx={{minWidth: '1680' }}>
            {claims && (  
              <DataGrid 
                initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
                pageSizeOptions={[5, 10, 15, 20]} 
                getRowId={row => row.claimer} 
                rows={ claims } 
                columns={ columns }
                disableRowSelectionOnClick
              />
            )}

            { claims && claims.length > 0 && timestamp >= timeline.frDeadline && timestamp < timeline.terminateStart &&  (
              <Paper elevation={3} sx={{
                m:1, p:1, 
                border: 1, 
                borderColor:'divider' 
                }} 
              >
                <Toolbar>
                <h4>Compute First Refusal Claims</h4> 
                </Toolbar>

                <Stack direction="row" sx={{ alignItems:'center' }} >
                  
                  <LoadingButton 
                    disabled = { computeFirstRefusalLoading }
                    loading={loading}
                    loadingPosition="end"
                    sx={{ m: 1, minWidth: 168, height: 40 }} 
                    variant="contained" 
                    endIcon={<Calculate />}
                    onClick={ computeClick }
                    size='small'
                  >
                    Compute
                  </LoadingButton>

                </Stack>
              </Paper>
            )}
          </Box>

        </DialogContent>

        <DialogActions>
          <Button 
            sx={{m:1, mx:3, p:1, minWidth:128 }}
            variant="outlined"
            onClick={()=>setAppear(false)}
          >
            Close
          </Button>
        </DialogActions>
      
      </Dialog>
    </>
  );
}