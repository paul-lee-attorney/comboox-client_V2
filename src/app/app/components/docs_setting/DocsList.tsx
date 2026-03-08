
import { Dispatch, SetStateAction, useState } from 'react';

import { TableContainer, Paper, Chip, Typography, Stack, TextField} from '@mui/material';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import { CopyLongStrSpan } from '../../common/CopyLongStr';

import { DocItem, } from '../../rc';
import { dateParser, defFormResults, FormResults, HexParser, longSnParser, onlyHex, onlyInt, userNoParser } from '../../common/toolsKit';
import { HexType, MaxData, MaxPrice } from '../../common';

interface DocsListProps {
  title: string;
  list: DocItem[];
  titleOfTemp: string;
  typeOfDoc: number;
  version: number;
  setTypeOfDoc: Dispatch<SetStateAction<number>>;
  setTitleOfTemp: Dispatch<SetStateAction<string>>;
  setVersion: Dispatch<SetStateAction<number>>;
  setAddr: Dispatch<SetStateAction<HexType>>;
}

export function DocsList({ title, list, titleOfTemp, typeOfDoc, version, setTypeOfDoc, setTitleOfTemp, setVersion, setAddr }:DocsListProps ) {
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const columns: GridColDef[] = [
    // {
    //   field: 'type',
    //   headerName: 'Type',
    //   valueGetter: p =>  userNoParser(p.row.doc.head.typeOfDoc.toString(16)),
    //   width: 88,
    //   headerAlign:'center',
    //   align: 'center',
    //   renderCell: ({ value }) => (
    //     <Chip 
    //       variant='outlined'
    //       label={ value }
    //     />
    //   ),
    // },
    {
      field: 'title',
      headerName: 'Title',
      valueGetter: p =>  p.row.title,
      width: 218,
      headerAlign:'center',
      align: 'center',
    },    
    {
      field: 'version',
      headerName: 'Version',
      valueGetter: p =>  longSnParser( p.row.doc.head.version.toString() ),
      width: 88,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ value }
        />
      ),
    },
    // {
    //   field: 'seqOfDoc',
    //   headerName: 'Sn',
    //   valueGetter: p =>  longSnParser(p.row.doc.head.seqOfDoc.toString()),
    //   width: 188,
    //   headerAlign:'center',
    //   align: 'center',
    //   renderCell: ({ value }) => (
    //     <Chip 
    //       variant='filled'
    //       label={ value }
    //     />
    //   ),
    // },
    {
      field: 'author',
      headerName: 'Author',
      valueGetter: p =>  userNoParser(p.row.doc.head.author.toString(16)),
      width: 188,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ value }
        />
      ),
    },
    {
      field: 'creator',
      headerName: 'Creator',
      valueGetter: p => userNoParser(p.row.doc.head.creator.toString(16)),
      width: 188,
      headerAlign:'center',
      align: 'center',
      renderCell: ({ value }) => (
        <Chip 
          variant='filled'
          label={ value }
        />
      ),
    },
    { 
      field: 'createDate', 
      headerName: 'CreateDate',
      valueGetter: p => dateParser(p.row.doc.head.createDate.toString()),
      headerAlign: 'center',
      align:'center',
      width: 180,
    },
    {
      field: 'body',
      headerName: 'Body',
      valueGetter: p => p.row.doc.body,
      width: 218,
      headerAlign:'center',
      align: 'center',
      renderCell: ({value}) => (
        <CopyLongStrSpan title='Addr' src={value} />
      )
    },
  ];
  
  const handleRowClick = (p:GridRowParams)=>{
    setTypeOfDoc(p.row.doc.head.typeOfDoc);
    setTitleOfTemp(p.row.title);
    setVersion(p.row.doc.head.version);
    setAddr(p.row.doc.body);
  }

  return (
    <TableContainer component={Paper} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Typography variant='h5' sx={{ mx:1, my:2, textDecoration:'underline' }} >
        <b>List Of {title}</b>
      </Typography>

      {title == 'Documents' && (
        <Stack direction = 'row' sx={{ alignItems:'start'}} >
          <TextField 
            variant='outlined'
            label='Title'
            size="small"
            sx={{
              m:1,
              minWidth: 218,
            }}
            inputProps={{readOnly: true}}
            value={ titleOfTemp }
          />
          <TextField 
            variant='outlined'
            label='TypeOfDoc'
            size="small"
            sx={{
              m:1,
              minWidth: 218,
            }}
            inputProps={{readOnly: true}}
            value={ HexParser(typeOfDoc.toString(16)) }
          />

          <TextField 
            variant='outlined'
            label='Version'
            size="small"
            sx={{
              m:1,
              minWidth: 218,
            }}
            inputProps={{readOnly: true}}
            value={ version }
          />

        </Stack>
      )}

      <DataGrid
        initialState={{pagination:{paginationModel:{pageSize: 5}}}} 
        pageSizeOptions={[5, 10, 15, 20]} 
        rows={ list } 
        columns={ columns }
        getRowId={ (row:DocItem) => (row.seqOfList) } 
        disableRowSelectionOnClick
        onRowClick={ handleRowClick }
      />

    </TableContainer>
  )
}



