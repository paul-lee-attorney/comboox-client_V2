import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { qtyOfTeams } from "../../../lop";
import { MemberInfoProps } from "../Member/MemberInfo";

export interface TeamSelectorProps extends MemberInfoProps {
  setSeqOfTeam: Dispatch<SetStateAction<number>>;
}

export function TeamSelector({addr, time, seqOfTeam, setSeqOfTeam}:TeamSelectorProps) {

  const [ teamNoList, setTeamNoList ] = useState<number[]>();

  useEffect(() => { 
    qtyOfTeams(addr).then(
      res => {
        if (res > 0) {
          let ls:number[] = [];
          for (let i = 1; i <= res; i++){
            ls.push(i);
          }
          setTeamNoList(ls);
        } 
      }
    );
  }, [ addr, time ]);


  return (
    <>
      {teamNoList && (
        <FormControl variant="outlined" size="small" sx={{ m:1, ml: 20, minWidth: 168 }}>
          <InputLabel id="seqOfTeam-label">SeqOfTeam</InputLabel>
          <Select
            labelId="seqOfTeam-label"
            id="seqOfTeam-select"
            label="SeqOfTeam"
            value={ seqOfTeam?.toString() ?? '0' }
            onChange={(e) => setSeqOfTeam(Number(e.target.value))}
          >
            {teamNoList.map((v, i) => (
              <MenuItem key={i} value={v.toString()}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}




