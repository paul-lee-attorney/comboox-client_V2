

import { Stack, TextField, Paper, Chip } from '@mui/material';

import { longSnParser } from '../../../../../../common/toolsKit';

interface BenchmarkType {
  classOfShare: string,
  floorPrice: string,
  obligors: string,
}

export function Benchmark({ classOfShare, floorPrice, obligors }: BenchmarkType) {

  return (
    <Paper elevation={3} 
      sx={{
        p:1, m:1,
        alignContent:'center', 
        justifyContent:'center', 
        border: 1,
        borderColor:'divider' 
      }} 
    >
      <Stack direction={'row'} sx={{ alignItems: 'center' }} >

        <Chip label={ 'Class: ' + `${longSnParser(classOfShare)}` } color='primary' sx={{m:1}} />

        <TextField 
          variant='outlined'
          label='FloorPrice'
          inputProps={{readOnly: true}}
          size='small'
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ floorPrice }
        />

        <TextField 
          variant='outlined'
          label='Obligors'
          size='small'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          multiline
          rows={1}
          value={ obligors }
        />

      </Stack>
    </Paper>
  )
}
