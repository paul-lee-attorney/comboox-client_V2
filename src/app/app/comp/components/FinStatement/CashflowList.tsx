import { Dispatch, SetStateAction } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { baseToDollar, bigIntToAddr, bigIntToStrNum, dateParser, longSnParser } from "../../../common/toolsKit";
import { CopyLongStrTF } from "../../../common/CopyLongStr";
import { Cashflow } from "../FinStatement";
import { exportToExcel } from "../../../../api/dataTools";
import { CloudDownloadOutlined } from "@mui/icons-material";

export interface SumInfo {
  title: string;
  data: bigint;
}

export interface CashflowListProps {
  inETH: boolean
  arrSum: SumInfo[];
  records: Cashflow[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function CashFlowList({inETH, arrSum, records, open, setOpen}:CashflowListProps ) {

  const columns: GridColDef[] = [
    {
      field: 'blockNumber',
      headerName: 'BlockNumber',
      valueGetter: p => longSnParser(p.row.blockNumber.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 188,
    },
    {
      field: 'timestamp',
      headerName: 'Date',
      valueGetter: p => dateParser(p.row.timestamp.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 218,
    },
    {
      field: 'typeOfFlow',
      headerName: 'TypeOfFlow',
      valueGetter: p => p.row.typeOfIncome,
      headerAlign: 'center',
      align: 'center',
      width: 218,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      valueGetter: p => bigIntToStrNum(p.row.amt, p.row.amt == p.row.usd ? 6 : 18),
      headerAlign: 'center',
      align: 'center',
      width: 218,
    },
    {
      field: 'ethPrice',
      headerName: 'Price / From',
      valueGetter: p => p.row.amt == p.row.usd ? bigIntToAddr(p.row.ethPrice) : bigIntToStrNum(p.row.ethPrice, 9),
      headerAlign: 'center',
      align: 'center',
      width: 258,
      renderCell: ({value}) => value.substring(0,2) == '0x'
        ? (<CopyLongStrTF title="Addr" src={value} />)
        : (value)
    },
    {
      field: 'usd',
      headerName: 'USD',
      valueGetter: p => p.row.amt == p.row.usd 
      ? bigIntToStrNum(p.row.usd, 6)
      : bigIntToStrNum(p.row.usd / 10n ** 9n, 9),
      headerAlign: 'center',
      align: 'center',
      width: 218,
    },
    {
      field: 'acct',
      headerName: 'Acct',
      valueGetter: p => longSnParser(p.row.acct.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 128,
    },
    {
      field: 'addr',
      headerName: 'Addr',
      valueGetter: p => p.row.addr,
      width: 258,
      headerAlign: 'center',
      renderCell: ({value}) => (
        <CopyLongStrTF title="Addr" src={value} />
      ),
    },
    {
      field: 'transactionHash',
      headerName: 'TransactionHash',
      valueGetter: p => longSnParser(p.row.transactionHash),
      width: 258,
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <CopyLongStrTF title="Hash" src={value} />
      ),
    },
  ];

  const exportData = ()=>{

    const rows = records.map(v => ({
      ...v,
      blockNumber: longSnParser(v.blockNumber.toString()),
      timestamp: dateParser(v.timestamp.toString()),
      amt: bigIntToStrNum(v.amt, v.amt == v.usd ? 6 : 18),
      ethPrice: v.amt == v.usd ? bigIntToAddr(v.ethPrice) : bigIntToStrNum(v.ethPrice, 9),
      usd: v.amt == v.usd ? bigIntToStrNum(v.usd, 6) : bigIntToStrNum(v.usd / 10n ** 9n, 9),
      acct: v.acct.toString(),
    }));

    const title = arrSum[0].title;

    exportToExcel(rows, title.substring(0, title.length-6));
  }

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >

      <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
        <b> { arrSum.length > 0 
              ? (arrSum[0].title + (inETH ? bigIntToStrNum(arrSum[0].data/10n**9n, 9) : baseToDollar((arrSum[0].data/10n**14n).toString())) + ')') 
              : '' } 
        </b>
      </DialogTitle>

      <DialogContent>
        <Paper elevation={3} sx={{m:1, p:1 }} >

          <Stack direction='row' sx={{m:1, p:1}}>

            {arrSum.map((v, i)=>{
              if (i == 0 ) return null;
              return (
                <Typography key={i} variant="h6" sx={{mx:2}}>
                  <b> {v.title}: { inETH 
                      ? bigIntToStrNum(v.data / 10n**9n, 9)
                      : baseToDollar((v.data / 10n ** 14n).toString()) } </b>
                </Typography>
              )
            })}

          </Stack>

          <DataGrid 
            initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
            pageSizeOptions={[5, 10, 15, 20]} 
            rows={ records } 
            getRowId={(row:Cashflow) => (row.seq)} 
            columns={ columns }
            disableRowSelectionOnClick
          />

        </Paper>
      </DialogContent>

      <DialogActions>
        <Tooltip title='Export Data' placement="top" arrow >
            <IconButton size="medium" sx={{m:1}} color="primary" onClick={()=>exportData()}>
              <CloudDownloadOutlined />
            </IconButton>
        </Tooltip>
        <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>

    </Dialog>
  );
} 