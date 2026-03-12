
import { IconButton, Tooltip } from "@mui/material";

import Link from "next/link";

import { HexParser } from "../common/toolsKit";

import { useComBooxContext } from "../../_providers/ComBooxContextProvider";

import Logo from "/public/assets/ComBoox_FullSlogan.png";
import Image from "next/image";
import { getCompInfo } from "../comp/gk";

export function BtnDAO() {

  const { setGK, setBoox, setCompInfo } = useComBooxContext();

  const addrOfDAO = process.env.NEXT_PUBLIC_DAO_ADDR;

  const handleClick = async () => {
    setGK(undefined);
    setBoox(undefined);
    setCompInfo(undefined);

    if (addrOfDAO) {
      const body = HexParser(addrOfDAO);
      getCompInfo(body).then(
        info => {
          setGK(body);
          setCompInfo(info);
      });
    }
  }

  return (
    <>
    {addrOfDAO && (

      <Tooltip 
        title='ComBoox DAO'
        placement='bottom'
        arrow
      >

        <Link href={{pathname: `/app/comp`}} >

          <IconButton
            sx={{ml:3, mr:1}}
            size="small"
            color="inherit"
            onClick={ handleClick }
          >
            <Image src={ Logo } alt='ComBoox Logo' />
          </IconButton>
      
        </Link>

      </Tooltip>
    )}
  </>
  );
}