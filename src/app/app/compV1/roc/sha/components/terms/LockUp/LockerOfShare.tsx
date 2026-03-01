import { 
  Stack,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import { dateParser, longSnParser, splitStrArr } from '../../../../../../common/toolsKit';

interface LockerOfShareProps {
  seqOfShare: number,
  dueDate: number,
  keyholders: number[],
}

export function LockerOfShare({ seqOfShare, dueDate, keyholders }: LockerOfShareProps) {

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

        <Chip label={longSnParser(seqOfShare.toString())} color='primary' sx={{m:1, minWidth:128 }} />

        <TextField 
          variant='outlined'
          label='DueDate'
          inputProps={{readOnly: true}}
          size="small"
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ dateParser(dueDate.toString()) }
        />

        <TextField 
          variant='outlined'
          label='Keyholders'
          inputProps={{readOnly: true}}
          size="small"
          sx={{
            m:1,
            minWidth: 218,
          }}
          multiline
          rows={1}
          value={ splitStrArr(keyholders.map(v=> longSnParser(v.toString()))) }
        />

      </Stack>
    </Paper>
  )
}
