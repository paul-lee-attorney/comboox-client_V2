
import { 
  Stack,
  Paper,
  TextField,
  Chip,
} from "@mui/material";

import {
  Face,
} from "@mui/icons-material"

import { StrSig } from "./sigPage";
import { dateParser, longSnParser, } from "../../../../../common/toolsKit";

interface SigColumnProps {
  isSha: boolean;
  isBuyer: boolean;
  sigs: StrSig[];
}

export function SigColumn({ isSha, isBuyer, sigs }: SigColumnProps) {

  return (
    <Paper elevation={3} sx={{m:1, border:1, borderColor:'divider', width:700}} >
      
      <Chip
        sx={{ minWidth:168, m:1, ml:4, p:1 }}
        label={
              isSha 
            ?  isBuyer
              ? 'Investors' : 'Shareholders'
            :  isBuyer
              ? 'Buyers' : 'Sellers'
        } 
        color={ isBuyer ? 'primary' : 'success' } 
      />

      {sigs?.map(v => (
        <Paper elevation={3} key={ v.signer } sx={{m:1, p:1, border:1, borderColor:'divider'}}>
      
          <Stack  direction={'row'} sx={{ alignItems:'center', justifyContent:'center' }} > 

            <Chip
              sx={{minWidth: 168, height: 35,
                m:1, p:1, justifyContent:'start' }}
              icon={<Face />}
              size="small"
              variant={v.sigDate > 0 
                ? 'filled' 
                : 'outlined'
              }
              color={ isBuyer ? 'primary' : 'success' }
              label={ longSnParser(v.signer.toString()) }
            />

            <TextField 
              variant='outlined'
              size='small'
              label='SigDate'
              inputProps={{readOnly: true}}
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ dateParser(v.sigDate.toString()) }
            />

            <TextField 
              variant='outlined'
              size='small'
              label='Blocknumber'
              inputProps={{readOnly: true}}
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ longSnParser(v.blocknumber) }
            />

          </Stack>

          <TextField 
            variant='outlined'
            size='small'
            label='SigHash'
            inputProps={{readOnly: true}}
            sx={{
              m:1,
              minWidth: 645,
            }}
            value={ v.sigHash }
          />

        </Paper>
      ))}

    </Paper>
  );
} 

