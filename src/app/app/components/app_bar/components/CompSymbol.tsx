import { useEffect } from "react";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { getBoox } from "../../../comp/gk";
import { Stack, Typography } from "@mui/material";
import { userNoParser } from "../../../common/toolsKit";
import { CopyLongStrSpan } from "../../../common/CopyLongStr";
import { basedOnPar } from "../../../comp/rom/rom";
import { booxMap } from "../../../common";
import { MembersListBtn } from "../../../comp/rom/components/MembersListBtn";
import { ToClipboard } from "../../../common/ToClipboard";
import { AccountCircle, NoteAltOutlined } from "@mui/icons-material";

export function CompSymbol() {

  const { gk, compInfo, setBoox, setOnPar, setCompInfo } = useComBooxContext();

  useEffect(() => {
    if (gk) {
      getBoox(gk).then(
        (res) => {
          setBoox(res.map(v=>(v.addr)));
          basedOnPar(res[booxMap.ROM].addr).then(
            flag => setOnPar(flag)
          );
        }
      );
    } else {
      setBoox(undefined);
      setOnPar(undefined);
      setCompInfo(undefined);
    }
  }, [gk, setBoox, setOnPar, setCompInfo]);

  let addr = gk?.toLowerCase();
  addr = addr?.substring(0, 7) + '...' + addr?.substring(addr.length-5);

  return (
    <Stack direction='row' sx={{ alignItems:'center', justifyContent:'center', flexGrow:1 }} >

      {gk && compInfo && (
        <MembersListBtn symbol={compInfo.symbol} />
      )}

      {gk && compInfo && (
        <ToClipboard icon={<AccountCircle />} info={compInfo.regNum.toString(16)} />
      )}

      {gk && (
        <ToClipboard icon={<NoteAltOutlined />} info={gk.toLowerCase()} />
      )}
    </Stack>

  );
}




