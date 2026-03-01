import { useEffect, useState } from "react";

import { Paper, TextField, Stack, Grid, Typography } from "@mui/material";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";

import { AddrZero, booxMap, currencies } from "../../common";
import { baseToDollar, dateParser, longSnParser 
} from "../../common/toolsKit";
import { CopyLongStrTF } from "../../common/CopyLongStr";

import { CompInfo, getCompInfo } from "../gk";
import { getDK } from "../common/draftControl";

import { balanceOfWei } from "../../rc";

import { Position, getDirectorsFullPosInfo } from "../rod/rod";
import { GetOfficersList } from "../rod/components/GetOfficersList";
import { MembersEquityList } from "../rom/components/MembersList";
import { getControllor, getOwnersEquity, votesOfGroup } from "../rom/rom";
import { InvHistoryOfMember } from "../rom/components/InvHistoryOfMember";

import { ConfigSetting } from "./config_setting/ConfigSetting";
import { usePublicClient } from "wagmi";
import { HistoryOfBoox } from "./GeneralInfo/HistoryOfBoox";
import { CashBox } from "./GeneralInfo/CashBox";

export function GeneralInfo() {
  const { gk, boox } = useComBooxContext();

  const client = usePublicClient();

  const [ time, setTime ] = useState<number>(0);

  const [ compInfo, setCompInfo ] = useState<CompInfo>();
  const [ dk, setDK ] = useState<string>('');

  useEffect(()=>{
    if (gk) {
      getCompInfo(gk).then(
        res => {
          if (res.state > 0) {
                res.name = 'Deprecated GK';
                setCompInfo(res);
          } else setCompInfo(res);
        }
      )      
      getDK(gk).then(
        res => setDK(res)
      )
      
    }
  }, [gk, time, client]);

  const [ controllor, setControllor ] = useState<string>();
  const [ votesOfController, setVotesOfController ] = useState<string>();
  const [ par, setPar ] = useState<string>();
  const [ paid, setPaid ] = useState<string>();
  const [ directorsList, setDirectorsList ] = useState<readonly Position[]>();

  useEffect(()=>{
    if (boox) {
      getControllor(boox[booxMap.ROM]).then(
        res => {
          if (res > 0) {
            setControllor(res.toString());
            votesOfGroup(boox[booxMap.ROM], Number(res)).then(
              votes => setVotesOfController(votes.toString())
            );
          }
        }
      );

      getOwnersEquity(boox[booxMap.ROM]).then(
        res => {
          setPar(res.par.toString());
          setPaid(res.paid.toString());
        }
      );

      getDirectorsFullPosInfo(boox[booxMap.ROD]).then(
        ls => setDirectorsList(ls)
      );
    }
  }, [boox]); 

  const [ balanceOfETH, setBalanceOfETH ] = useState(0n);

  useEffect(()=>{
    if (gk) {
      balanceOfWei(gk).then(
        res => setBalanceOfETH(res)
      )
    }

  }, [ gk, boox, time ]);

  let cap = balanceOfETH.toString();

  const [ acct, setAcct ] = useState<number>(0);
  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Paper elevation={3} 
        sx={{
          alignContent:'center', 
          justifyContent:'center', 
          m:1, p:1, border:1, 
          borderColor:'divider' 
        }} 
      >

        <Paper elevation={3} sx={{m:1, p:1 }} >
          <Stack direction='row' sx={{ alignItems:'center' }} >

            <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
              <b>General Info</b>
            </Typography>

            {compInfo && (
              <ConfigSetting companyName={ compInfo.name } symbol={  compInfo.symbol } time={ time } setTime={ setTime } />
            )}

            <HistoryOfBoox />

          </Stack>

          <Grid container direction='row' spacing={2} >
            
            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ compInfo?.name ?? ' ' } 
                variant='outlined'
                size='small' 
                label="NameOfCompany" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }}
                fullWidth
              />            
            </Grid>            

            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ longSnParser(compInfo?.regNum.toString() ?? '0') } 
                variant='outlined'
                size='small' 
                label="RegNum" 
                inputProps={{readOnly: true}}
                sx={{
                  minWidth: 120,
                  m:1,
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={compInfo?.symbol ?? ' '} 
                variant='outlined'
                size='small' 
                label="SymbolOfCompany" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <CopyLongStrTF title="AddrOfCompany" src={gk ?? AddrZero} />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <CopyLongStrTF title="AddrOfCashier" src={boox ? boox[booxMap.Cashier] : AddrZero} />
            </Grid>            

            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ currencies[ compInfo?.currency ?? 0 ] } 
                variant='outlined'
                size='small' 
                label="BookingCurrency" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ dateParser(compInfo?.regDate.toString() ?? '0') } 
                variant='outlined'
                size='small' 
                label="RegDate" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <CopyLongStrTF title="Secretary" src={dk ?? AddrZero} />
            </Grid>

            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ longSnParser(controllor ?? '0') } 
                variant='outlined'
                size='small' 
                label="ActualControllor" 
                inputProps={{readOnly: true}}
                sx={{ m:1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ baseToDollar(votesOfController ?? '0')} 
                variant='outlined'
                size='small' 
                label="VotesOfController" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }} 
                fullWidth
              />              
            </Grid>
            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ baseToDollar(par ?? '0')} 
                variant='outlined'
                size='small' 
                label="RegisteredCapital" 
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                }}
                fullWidth
              />              
            </Grid>
            <Grid item xs={3} md={3} lg={3} >
              <TextField 
                value={ baseToDollar(paid ?? '0') } 
                variant='outlined'
                size='small' 
                label="PaidInCapital" 
                inputProps={{readOnly: true}}
                sx={{
                  m: 1,
                }}
                fullWidth
              />              
            </Grid>

          </Grid>

        </Paper>

        <Grid container direction='row' spacing={2} >

          <Grid item xs={12} md={12} lg={12} >
            <MembersEquityList setAcct={setAcct} setOpen={setOpen} />
            {acct > 0 && open && (
              <InvHistoryOfMember acct={ acct } open={ open } setOpen={ setOpen } />
            )}
          </Grid>

          <Grid item xs={12} md={12} lg={12} >
            {directorsList && directorsList.length > 0 && (
              <GetOfficersList list={directorsList} title="Directors List" />
            )}
          </Grid>

        </Grid>

        <CashBox />

      </Paper>
    </>
  );
} 