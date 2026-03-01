import { useEffect, useState } from "react"
import { getCentPrice } from "../compV1/gk";
import { strNumToBigInt } from "./toolsKit";
import { ShowValueOf } from "./ShowValueOf";
import { useComBooxContext } from "../../_providers/ComBooxContextProvider";

interface GetValueOfProps {
  amt: string;
}

export function GetValueOf({ amt }:GetValueOfProps ) {

  const { gk } = useComBooxContext();

  const [ value, setValue ] = useState(0n);

  useEffect(()=>{
    if (gk) {
      getCentPrice( gk ).then(
        centPrice => {
          let output = strNumToBigInt(amt, 4) / 100n * centPrice;
          setValue(output);
        }
      )
    }    
  }, [gk, amt]);

  return (
    <ShowValueOf value={value} />
  )
}