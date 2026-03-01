import { Chip, Paper, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridEventListener } from "@mui/x-data-grid";
import { baseToDollar, dateParser, longSnParser } from "../../../common/toolsKit";
import { Dispatch, SetStateAction } from "react";
import { statesOfOpt } from "../../roc/sha/components/terms/Options/ContentOfOpt";
import { SearchOption } from "./SearchOption";
import { OptWrap, typeOfOpts } from "../roo";


interface OptionsListProps {
  list: readonly OptWrap[],
  setOpt: Dispatch<SetStateAction<OptWrap>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
}

export function OptionsList({list, setOpt, setOpen}:OptionsListProps) {

  const columns: GridColDef[] = [
    {
      field: 'seqOfOpt',
      headerName: 'SeqOfOpt',
      valueGetter: p => longSnParser(p.row.opt.head.seqOfOpt.toString()),
      headerAlign: 'left',
      align:'left',      
      width: 218,
    },
    {
      field: 'typeOfOpt',
      headerName: 'typeOfOpt',
      valueGetter: p => typeOfOpts[p.row.opt.head.typeOfOpt],
      headerAlign: 'center',
      align:'center',
      width: 128,
    },
    { 
      field: 'classOfShare', 
      headerName: 'Class',
      valueGetter: p => p.row.opt.head.classOfShare.toString(),
      headerAlign: 'center',
      align:'center',
      width: 88,
      renderCell:({value}) => {
        return (
          <Chip 
            variant="filled"
            label={ value }
          />
        )
      }
    },
    { 
      field: 'Rightholder', 
      headerName: 'Rightholder',
      valueGetter: p => longSnParser(p.row.opt.body.rightholder.toString()),
      headerAlign: 'center',
      align:'center',
      width: 218,
    },
    { 
      field: 'triggerDate', 
      headerName: 'TriggerDate',
      valueGetter: p => dateParser(p.row.opt.head.triggerDate.toString()),
      headerAlign: 'center',
      align:'center',
      width: 180,
    },
    { 
      field: 'execDeadline', 
      headerName: 'ExecDeadline',
      valueGetter: p => dateParser((p.row.opt.head.triggerDate + p.row.opt.head.execDays * 86400).toString()),
      headerAlign: 'center',
      align:'center',
      width: 180,
    },
    { 
      field: 'closingDeadline', 
      headerName: 'ClosingDeadline',
      valueGetter: p => dateParser(p.row.opt.body.closingDeadline.toString()),
      headerAlign: 'center',
      align:'center',
      width: 180,
    },
    { 
      field: 'paid', 
      headerName: 'Paid',
      valueGetter: p => baseToDollar(p.row.opt.body.paid.toString()),
      headerAlign: 'right',
      align:'right',
      width: 240,
    },
    { 
      field: 'state', 
      headerName: 'State',
      valueGetter: p => p.row.opt.body.state,
      renderCell: ({ value }) => (
        <Chip 
          label={ statesOfOpt[value] } 
          variant='filled'
          sx={{ width:120 }} 
          color={
            value == 0
            ? 'default'
            : value == 1
              ? 'info'
              : value == 2
                ? 'primary'
                : 'success'
          } 
        />
      ),
      headerAlign: 'center',
      align: 'center',
      width: 128,  
    },
  ];

  const handleRowClick: GridEventListener<'rowClick'> = (p) => {
    setOpt({
      opt: p.row.opt, 
      obligors: p.row.obligors, 
    });
    setOpen(true);
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >
      <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
        <b>Options List</b>
      </Typography>
      
      <SearchOption setOpt={setOpt} setOpen={setOpen} />

      <DataGrid 
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        getRowId={row => (longSnParser(row.opt.head.seqOfOpt.toString()))} 
        rows={ list } 
        columns={ columns }
        disableRowSelectionOnClick
        onRowClick={ handleRowClick }
      /> 

    </Paper>
  );
}