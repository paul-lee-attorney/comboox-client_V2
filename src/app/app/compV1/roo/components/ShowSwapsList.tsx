import { Chip } from "@mui/material";

import { baseToDollar, longDataParser, longSnParser } from "../../../common/toolsKit";
import { Dispatch, SetStateAction } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Swap } from "../roo";

const statesOfSwap = [
  'Pending', 'Issued', 'Closed', 'Terminated'
]

interface ShowSwapsListProps{
  list: readonly Swap[];
  setSeqOfSwap: Dispatch<SetStateAction<number>>;
}

export function ShowSwapsList({ list, setSeqOfSwap}: ShowSwapsListProps) {

  const handleRowSelect = (ids: GridRowSelectionModel) => setSeqOfSwap(Number(ids[0]));

  const columns: GridColDef[] = [
    { 
      field: 'seq', 
      headerName: 'Seq',
      valueGetter: p => longSnParser(p.row.seqOfSwap.toString()),
      width: 88,
    },
    { 
      field: 'seqOfPledge', 
      headerName: 'SeqOfPledge',
      valueGetter: p => longSnParser(p.row.seqOfPledge.toString()),
      width: 128,
    },
    { 
      field: 'paidOfPledge', 
      headerName: 'PaidOfPledge',
      valueGetter: p =>  baseToDollar(p.row.paidOfPledge.toString()),
      headerAlign: 'right',
      align:'right',
      width: 168,
    },  
    { 
      field: 'seqOfTarget', 
      headerName: 'SeqOfTarget',
      valueGetter: p => longDataParser(p.row.seqOfTarget.toString()),
      headerAlign: 'right',
      align:'right',
      width: 168,
    },  
  
    { 
      field: 'paidOfTarget', 
      headerName: 'PaidOfTarget',
      valueGetter: p =>  baseToDollar(p.row.paidOfTarget.toString()),
      headerAlign: 'right',
      align:'right',
      width: 168,
    },  
    { 
      field: 'priceOfDeal', 
      headerName: 'PriceOfDeal',
      valueGetter: p => baseToDollar(p.row.priceOfDeal.toString()),
      headerAlign: 'right',
      align:'right',
      width: 168,
    },  
    { 
      field: 'optType', 
      headerName: 'TypeOfOpt',
      valueGetter: p => p.row.isPutOpt ? 'Put' : 'Call',
      headerAlign: 'center',
      align:'center',
      width: 128,
    },  
    {
      field: 'state',
      headerName: 'State',
      valueGetter: p => p.row.state,
      width: 128,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ 
            statesOfSwap[value]
          } 
          color={
            value == 3
            ? 'warning'
            : value == 2
              ? 'success'
              : value == 1
                ? 'primary'
                : 'default'
          }
        />
      )
    }  
  ];

  return (
    <DataGrid 
      initialState={{pagination:{paginationModel:{pageSize: 10}}}} 
      pageSizeOptions={[5, 10, 15, 20]} 
      getRowId={row => row.seqOfSwap} 
      rows={ list } 
      columns={ columns }
      onRowSelectionModelChange={ handleRowSelect }
    />
  )

}