import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { HexType } from "../app/common";
import { CompInfo } from "../app/comp/gk";

type ContextType = {
  userNo: number | undefined;
  setUserNo: Dispatch<SetStateAction<number | undefined>>;
  gk: HexType | undefined;
  setGK: Dispatch<SetStateAction<HexType | undefined>>;
  boox: HexType[] | undefined;
  setBoox: Dispatch<SetStateAction<HexType[] | undefined>>;
  keepers: HexType[] | undefined;
  setKeepers: Dispatch<SetStateAction<HexType[] | undefined>>;
  errMsg: string | undefined;
  setErrMsg: Dispatch<SetStateAction<string | undefined>>;
  onPar: boolean | undefined;
  setOnPar: Dispatch<SetStateAction<boolean | undefined>>;
  compInfo: CompInfo | undefined;
  setCompInfo: Dispatch<SetStateAction<CompInfo | undefined>>;
}

const ComBooxContext = createContext<ContextType>({
  userNo: undefined,
  setUserNo: ()=>{}, 
  gk: undefined, 
  setGK: ()=>{},
  boox: undefined,
  setBoox: ()=>{},
  keepers: undefined,
  setKeepers: ()=>{},
  errMsg: undefined,
  setErrMsg: ()=>{},
  onPar: undefined,
  setOnPar: ()=>{},
  compInfo: undefined,
  setCompInfo: ()=>{},
});

type ProviderType = {
  children: React.ReactNode
}

const ComBooxContextProvider = ({ children }: ProviderType) => {
  const [ userNo, setUserNo ] = useState<number>();
  const [ gk, setGK ] = useState<HexType>();
  const [ boox, setBoox ] = useState<HexType[]>();
  const [ keepers, setKeepers ] = useState<HexType[]>();
  const [ errMsg, setErrMsg ] = useState<string>();
  const [ onPar, setOnPar ] = useState<boolean>();
  const [ compInfo, setCompInfo ] = useState<CompInfo>();

  return (
    <ComBooxContext.Provider 
      value={{
        userNo, setUserNo, 
        gk, setGK, 
        boox, setBoox,
        keepers, setKeepers, 
        errMsg, setErrMsg, 
        onPar, setOnPar, 
        compInfo, setCompInfo
      }} 
    >
      { children }
    </ComBooxContext.Provider >
  );
}

const useComBooxContext = () => {
  return useContext(ComBooxContext);
}

export { ComBooxContextProvider, useComBooxContext };