import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { usePublicClient } from "wagmi";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { AddrZero, Bytes32Zero, HexType } from "../../../common";
import { dateParser, HexParser, longSnParser } from "../../../common/toolsKit";
import { getHeadByBody, HeadOfDoc } from "../../../rc";
import { HistoryEduOutlined } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CopyLongStrTF } from "../../../common/CopyLongStr";
import { ArbiscanLog, decodeArbiscanLog, getAllLogs } from "../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";

export type RegBooxRecord = {
  seq: number,
  blockNumber: bigint,
  timestamp: bigint,
  transactionHash: HexType,
  title: number,
  address: HexType,
  dk: HexType,
  headOfDoc: HeadOfDoc,
}

export const titleOfBoox: string[] = [
  'GK', 'ROCKeeper', 'RODKeeper', 'BMMKeeper', 'ROMKeeper', 'GMMKeeper',
  'ROAKeeper', 'ROOKeeper', 'ROPKeeper', 'SHAKeeper', 'LOOKeeper', 
  'UsdROMKeeper', 'UsdROAKeeper', 'UsdLOOKeeper', 'UsdROOKeeper', 'UsdKeeper',
  'ROC', 'ROD', 'BMM', 'ROM', 'GMM',
  'ROA', 'ROO', 'ROP', 'ROS', 'LOE',
  'Cashier', 'USDC', 'LOU'
]

export function HistoryOfBoox() {
  const { gk } = useComBooxContext();
  
  const client = usePublicClient();

  const [ list, setList ] = useState<RegBooxRecord[]>([]);

  useEffect(()=>{

    const getBooxHistory = async () => {

      if (!gk) return;
      

      let arr: RegBooxRecord[] = [];
      let counter = 0;

      let rawLogs = await getAllLogs(gk, 'GeneralKeeper', gk, 'RegKeeper');
      let abiStr = 'event RegKeeper(uint indexed title, address indexed keeper, address indexed dk)';
      type TypeOfRegKeeperLog = ArbiscanLog & {
        eventName: string, 
        args: {
          title: bigint,
          keeper: Hex,
          dk: Hex,
        }
      }

      let keepersLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRegKeeperLog) ?? [];

      let cnt = keepersLogs.length;

      while (cnt > 0) {
        let log = keepersLogs[cnt-1];

        let headOfDoc = await getHeadByBody(log.args.keeper ?? AddrZero);

        let item:RegBooxRecord = {
          seq: counter,
          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          title: Number(log.args.title ?? 0n),
          address: HexParser(log.args.keeper ?? AddrZero),
          dk: HexParser(log.args.dk ?? AddrZero),
          headOfDoc: headOfDoc
        }

        arr.push(item);
        counter++;
        
        cnt--;
      }

      rawLogs = await getAllLogs(gk, 'GeneralKeeper', gk, 'RegBook');
      abiStr = 'event RegBook(uint indexed title, address indexed book, address indexed dk)';
      type TypeOfRegBookLog = ArbiscanLog & {
        eventName: string, 
        args: {
          title: bigint,
          book: Hex,
          dk: Hex,
        }
      }

      let booxLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRegBookLog) ?? [];

      cnt = booxLogs.length;

      while (cnt > 0) {

        let log = booxLogs[cnt-1];

        let headOfDoc = await getHeadByBody(log.args.book ?? AddrZero);

        let item:RegBooxRecord = {
          seq: counter,
          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          title: 15 + Number(log.args.title ?? 0n),
          address: HexParser(log.args.book ?? AddrZero),
          dk: HexParser(log.args.dk ?? AddrZero),
          headOfDoc: headOfDoc
        }

        arr.push(item);
        counter++;
        
        cnt--;
      }

      setList(arr);
    }

    if (client && gk) getBooxHistory();

  },[client, gk, setList]);

  const [ open, setOpen ] = useState(false);

  const showList = ()=>{
    setOpen(true);    
  }

  const columns: GridColDef [] = [
    {
      field: 'blockNumber',
      headerName: 'BlockNumber',
      valueGetter: p => longSnParser(p.row.blockNumber.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 218,
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
      field: 'title',
      headerName: 'Titel',
      valueGetter: p => titleOfBoox[p.row.title],
      headerAlign: 'center',
      align: 'center',
      width: 128,
    },
    {
      field: 'version',
      headerName: 'Version',
      valueGetter: p => longSnParser(p.row.headOfDoc.version.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 128,
    },
    {
      field: 'seqOfDoc',
      headerName: 'SeqOfDoc',
      valueGetter: p => longSnParser(p.row.headOfDoc.seqOfDoc.toString()),
      headerAlign: 'center',
      align: 'center',
      width: 128,
    },
    {
      field: 'addr',
      headerName: 'Addr',
      valueGetter: p => p.row.address,
      width: 258,
      headerAlign: 'center',
      renderCell: ({value}) => (
        <CopyLongStrTF title="Addr" src={value} />
      ),
    },
    {
      field: 'dk',
      headerName: 'Secretary',
      valueGetter: p => p.row.dk,
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

  return (
    <>
      <Stack direction='row' sx={{ alignItems:'center' }}>
        <Tooltip 
          title='Get Boox History' 
          placement='right' 
          arrow 
        >
          <span>
            <IconButton 
              sx={{mx:1, ml: 5}}
              size="large"
              onClick={showList}
              color="primary"
            >
              <HistoryEduOutlined />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title" 
      >

        <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
          <b> History of Keepers & Boox </b>
        </DialogTitle>

        <DialogContent>
          <Paper elevation={3} sx={{m:1, p:1 }} >

            <DataGrid 
              initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
              pageSizeOptions={[5, 10, 15, 20]} 
              rows={ list } 
              getRowId={(row:RegBooxRecord) => (row.seq)} 
              columns={ columns }
              disableRowSelectionOnClick
            />

          </Paper>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  );
} 