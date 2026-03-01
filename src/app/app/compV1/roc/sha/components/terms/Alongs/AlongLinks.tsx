import { 
  Stack,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import { longSnParser, splitStrArr } from '../../../../../../common/toolsKit';
import { LinkRule } from './LinkRule';
import { AlongLink } from './da';

interface AlongLinksProps {
  link: AlongLink;
}

export function AlongLinks({ link }: AlongLinksProps) {

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

        <Chip 
          label={ 'Drager: ' + longSnParser(link.drager.toString()) }
          color='primary' 
          sx={{ m:1, minWidth:128 }} 
        />

        <LinkRule rule={link.linkRule} />

        <TextField 
          variant='outlined'
          label='Followers'
          inputProps={{readOnly: true}}
          size='small'
          sx={{
            m:1,
            minWidth: 218,
          }}
          multiline
          rows={1}
          value={ splitStrArr(link.followers.map(v => longSnParser(v.toString()))) }
        />

      </Stack>
    </Paper>
  )
}
