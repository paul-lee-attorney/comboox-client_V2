import { 
  Stack,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import { longSnParser, splitStrArr } from '../../../../../../common/toolsKit';
import { ContentOfOpt } from './ContentOfOpt';
import { TriggerCondition } from './TriggerCondition';
import { OptWrap } from '../../../../../roo/roo';

interface OptProps {
  optWrap: OptWrap;
}

export function Opt({ optWrap }: OptProps) {

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

        <Chip label={ 'Opt: ' + longSnParser(optWrap.opt.head.seqOfOpt.toString()) } color={ optWrap.opt.head.typeOfOpt % 2 == 0 ? 'primary' : 'success'} sx={{m:1, minWidth:128 }} />

        <ContentOfOpt opt={optWrap.opt} />

        <TriggerCondition cond={optWrap.opt.cond} />

        <TextField 
          variant='outlined'
          label='Obligors'
          inputProps={{readOnly: true}}
          size='small'
          sx={{
            m:1,
            minWidth: 218,
          }}
          multiline
          rows={1}
          value={ splitStrArr(optWrap.obligors.map(v => longSnParser(v.toString()))) }
        />

      </Stack>
    </Paper>
  )
}
