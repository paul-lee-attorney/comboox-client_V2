import { useEffect } from "react";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { getBoox, getKeepers } from "../../../comp/gk";
import { Stack, Typography } from "@mui/material";
import { longSnParser } from "../../../common/toolsKit";
import { CopyLongStrSpan } from "../../../common/CopyLongStr";
import { basedOnPar } from "../../../comp/rom/rom";
import { booxMap } from "../../../common";
import { getV1Boox, getV1Keepers } from "../../../compV1/gk";

export function CompSymbol() {

  const { gk, compInfo, setBoox, setKeepers, setOnPar, setCompInfo } = useComBooxContext();

  useEffect(() => {
    if (compInfo && gk) {
      if (compInfo.regNum == 8) {
        getV1Boox(gk).then(
          (res) => {
            setBoox(res.map(v=>(v.addr)));
            basedOnPar(res[booxMap.ROM].addr).then(
              flag => setOnPar(flag)
            );
          }
        );
        getV1Keepers(gk).then(
          (res) => {
            setKeepers(res.map(v=>(v.addr)));
          }
        );
      } else {        
        getBoox(gk).then(
          (res) => {
            setBoox(res.map(v=>(v.addr)));
            basedOnPar(res[booxMap.ROM].addr).then(
              flag => setOnPar(flag)
            );
          }
        );
        getKeepers(gk).then(
          (res) => {
            setKeepers(res.map(v=>(v.addr)));
          }
        );
      }      
    } else {
      setBoox(undefined);
      setOnPar(undefined);
      setCompInfo(undefined);
    }
  }, [gk, compInfo, setBoox, setKeepers, setOnPar, setCompInfo]);

  return (
    <Stack direction='row' sx={{ alignItems:'center', justifyContent:'center', flexGrow:5 }} >

      {gk && compInfo && (
        <Typography variant="h6" component="div" sx={{ mx:1 }} >
          {compInfo.symbol}
        </Typography>
      )}

      {gk && compInfo && (
        <Typography variant="h6" component="div" sx={{ mx:1 }} >
          ({longSnParser(compInfo.regNum.toString())})
        </Typography>
      )}

      {gk && (
        <CopyLongStrSpan title='Addr' src={gk.toLowerCase()} />
      )}
    </Stack>

  );
}




