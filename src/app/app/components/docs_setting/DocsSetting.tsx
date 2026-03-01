import { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, IconButton, Stack, Tooltip 
} from "@mui/material";

import { AddrOfRegCenter, AddrZero, HexType } from "../../common";

import Logo from '/public/assets/Symbol_white_xs.png';

import { DocItem, getBookeeper, getDocsList, getOwner, getTempsList } from "../../rc";
import { DocsList } from "./DocsList";
import Image from "next/image";
import { CopyLongStrTF } from "../../common/CopyLongStr";
import { ActionsOfSetting } from "./ActionsOfSetting";

export function DocsSetting() {

  const [ time, setTime ] = useState(0);

  const [ temps, setTemps ] = useState<DocItem[]>([]);
  const [ docs, setDocs ] = useState<DocItem[]>([]);
  
  const [ typeOfDoc, setTypeOfDoc ] = useState(1);
  const [ version, setVersion ] = useState(1);
  const [ addr, setAddr ] = useState(AddrZero);
  
  useEffect(() => {
    getTempsList().then(
      res => setTemps(res)
    )
  }, [time]);

  useEffect(()=>{
    
    let snOfDoc:HexType = `0x${
      typeOfDoc.toString(16).padStart(8, '0') +
      version.toString(16).padStart(8, '0') + 
      '0'.padEnd(48, '0')
    }`;

    getDocsList(snOfDoc).then(
      ls => setDocs(ls)
    );

  }, [typeOfDoc, version, time]);

  const [ owner, setOwner ] = useState(AddrZero);
  const [ keeper, setKeeper ] = useState(AddrZero);

  useEffect(()=>{
    getOwner().then(
      res => setOwner(res)
    );
  }, [time])

  useEffect(()=>{
    getBookeeper().then(
      res => setKeeper(res)
    );
  }, [time])

  const [ open, setOpen ] = useState(false);

  const handleClick = ()=> {
    setTime(Date.now());
    setOpen(true);
  }

  return (
    <>
      <Tooltip 
        title='Documents Repository' 
        placement='bottom' 
        arrow 
      >
        <span>
          <IconButton
            sx={{ml:3, mr:1}}
            size="small"
            color="inherit"
            onClick={handleClick}      
          >
            <Image src={ Logo } alt='Documents Repository' />

          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
          <b>Documents Setting </b>
        </DialogTitle>

        <DialogContent>

          <Stack direction='column' >

            <Stack direction='row' >

              <CopyLongStrTF title="RegCenter" src={ AddrOfRegCenter } />

              <CopyLongStrTF title="Owner" src={ owner } />

              <CopyLongStrTF title="BooKeeper" src={ keeper } />

            </Stack>

            <DocsList title='Templates' list={temps} typeOfDoc={typeOfDoc} version={version} setAddr={setAddr} setTypeOfDoc={setTypeOfDoc} setVersion={setVersion} />

            <DocsList title='Documents' list={docs} typeOfDoc={typeOfDoc} version={version} setAddr={setAddr} setTypeOfDoc={setTypeOfDoc} setVersion={setVersion} />

            <ActionsOfSetting typeOfDoc={typeOfDoc} version={version} addr={addr} setTime={setTime} setOpen={setOpen} />

          </Stack>

        </DialogContent>

        <DialogActions>
          <Button 
            sx={{m:1, ml:5, p:1, minWidth:128 }}
            variant="outlined"
            onClick={()=>setOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      
      </Dialog>
    </>
  );
}