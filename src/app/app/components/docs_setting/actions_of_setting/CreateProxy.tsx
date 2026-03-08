
import { Dispatch, SetStateAction, useState } from "react";

import { Alert, Collapse, IconButton, Paper, Stack, TextField } from "@mui/material";
import { Close, Create } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

import { AddrOfRegCenter, AddrZero, HexType } from "../../../common";
import { FormResults, HexParser, defFormResults, getReceipt, hasError, onlyHex, userNoParser } from "../../../common/toolsKit";

import { useRegCenterProxyDoc } from "../../../../../../generated";

function codifySn(typeOfDoc: number, version: number): HexType {
  let snOfDoc: HexType = `0x${
    typeOfDoc.toString(16).padStart(8, '0') +
    version.toString(16).padStart(8, '0') + 
    '0'.padEnd(48, '0')
  }`;

  console.log('typeOfDoc: ', typeOfDoc, 'version: ', version);
  console.log('soOfDoc', snOfDoc);

  return snOfDoc;
}

export interface CreateDocProps{
  typeOfDoc: number;
  version: number;
  addr: HexType;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<number>>;
}

export function CreateProxy({typeOfDoc, version, addr, setOpen, setTime}:CreateDocProps) {

  const { setErrMsg } = useComBooxContext();

  // const [ owner, setOwner ] = useState<HexType>(AddrZero);
  const [ docAddr, setDocAddr ] = useState<HexType>(AddrZero);

  // const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ show, setShow ] = useState(false);

  const updateResults = ()=>{
    setLoading(false);
    setTime( Date.now());
  }

  const {
    isLoading: createDocLoading,
    write: createDoc,
  } = useRegCenterProxyDoc({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      getReceipt(hash).then(
        r => {
          console.log("Receipt: ", r);
          setDocAddr(`0x${r.logs[2].topics[2].substring(26)}`);
          setShow(true);
          updateResults();
        }
      );
    }
  });

  const handleClick = ()=>{
    createDoc({
      args: [ 
        BigInt(typeOfDoc), 
        BigInt(version)
      ],
    });
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          label='TypeOfDoc'
          size="small"
          inputProps={{readOnly: true }}
          sx={{
            m:1,
            width: 128,
          }}
          value={ HexParser(typeOfDoc.toString(16)) }
        />

        <TextField 
          variant='outlined'
          label='Version'
          size="small"
          inputProps={{readOnly: true }}
          sx={{
            m:1,
            width: 128,
          }}
          value={ version.toString().padStart(4, '0') }
        />

        <LoadingButton 
          disabled = { createDocLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 128, height: 40 }} 
          variant="contained" 
          endIcon={<Create />}
          onClick={ handleClick }
          size='small'
        >
          Create
        </LoadingButton>

        <Collapse in={ show } sx={{ m:1, width:518 }} >
          <Alert 
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setShow(false);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }

            variant="outlined" 
            severity='info' 
            sx={{ height: 45, p:0.5 }} 
          >
            Doc Created At: { docAddr }
          </Alert>          
        </Collapse>

      </Stack>
    </Paper>

  );  


}