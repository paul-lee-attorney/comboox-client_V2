import { Card, CardContent, Paper, Typography } from "@mui/material";
import { centToDollar, longDataParser, longSnParser, weiToEth } from "../../../../../common/toolsKit";
import { currencies } from "../../../../../common";
import { useEffect, useState } from "react";
import { Member, defaultMember, getCurrency, getMemberInfo, getProjectInfo, getTeamInfo } from "../../../lop";
import { getCentPriceInWei } from "../../../../../rc";
import { PayrollProps } from "../Owner/OwnerPage";

export interface MemberInfoProps extends PayrollProps {
  seqOfTeam: number;
  acct: number;
  time: number;
}

type Tags = {
  userNo: string;
  workHours: string;
  approvedAmt: string;
}

const strTags: Tags[] = [
  { 
    userNo: 'Project Manager',
    workHours: 'Pending Amount',
    approvedAmt: 'Approved Sub-Budget'
  },
  { 
    userNo: 'Team Leader',
    workHours: 'Pending Amount',
    approvedAmt: 'Approved Sub-Budget'
  },
  { 
    userNo: "User No",
    workHours: "Work Hours",
    approvedAmt: "Pending Amount"
  },
]

export function MemberInfo({ addr, time, seqOfTeam, acct  }:MemberInfoProps) {

  const [ currency, setCurrency ] = useState<number>(0);
  const [ info, setInfo ] = useState<Member>(defaultMember);
  const [ tags, setTags ] = useState<Tags>(strTags[2]);

  useEffect(() => { 
    getCurrency(addr).then(
      res => {
        // console.log('currency: ', res);
        setCurrency(res);
      }
    );
  }, [ addr, time ]);

  useEffect(() => { 
    if (acct == 0) {
      if (seqOfTeam == 0) {
        getProjectInfo(addr).then(
          info => {
            setInfo(info);
            setTags(strTags[0]);
          }
        );
      } else {
        getTeamInfo(addr, seqOfTeam).then(
          info => {
            setInfo(info);
            setTags(strTags[1]);
          }
        );
      }
    } else {
      getMemberInfo(addr, acct, seqOfTeam).then(
        info => {
          setInfo(info);
          setTags(strTags[2]);
        }
      );
    }
  }, [ addr, seqOfTeam, acct, time ]);

  const [ centPriceInWei, setCentPriceInWei ] = useState(0n);

  useEffect(()=>{
    getCentPriceInWei( currency ).then(
      price => setCentPriceInWei(price)
    )
  }, [ currency, time ]);

return (
  <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>

      <Typography variant="body1" sx={{ m:1 }} >
        { tags.userNo } : { longSnParser(info.userNo.toString() ?? '0') }
      </Typography>
      <Typography variant="body1" sx={{ m:1 }} >
        Booking Currency: { currencies[currency] }
      </Typography>

      <hr />

      <Typography variant="body1" sx={{ m:1 }} >
        Budget Amount: { centToDollar(info.budgetAmt.toString() ?? '0') }
      </Typography>

      <Typography variant="body1" sx={{ m:1 }} >
        { tags.approvedAmt }: { centToDollar(info.approvedAmt.toString() ?? '0') }
      </Typography>

      <hr />

      {(acct > 0) && (
        <Typography variant="body1" sx={{ m:1 }} >
          Rate: { centToDollar(info.rate.toString()) }
        </Typography>
      )}

      {(seqOfTeam > 0) && (
        <Typography variant="body1" sx={{ m:1 }} >
          { tags.workHours }: { acct > 0 ? longDataParser(info.workHours.toString()) : centToDollar(info.workHours.toString())}
        </Typography>
      )}

      <Typography variant="body1" sx={{ m:1 }} >
        Receivable Amount: { centToDollar(info.receivableAmt.toString() ?? '0') }
      </Typography>
      <Typography variant="body1" sx={{ m:1 }} >
        Paid Amount: { centToDollar(info.paidAmt.toString() ?? '0') }
      </Typography>

      <hr />

      <Typography variant="body1" sx={{ m:1 }} >
        Outstanding Amount: { centToDollar((info.receivableAmt - info.paidAmt).toString()) }
      </Typography>

      <Typography variant="body1" sx={{ m:1 }} >
        Outstanding in ETH: { weiToEth((BigInt(info.receivableAmt - info.paidAmt) * centPriceInWei).toString()) }
      </Typography>

  </Paper>
);

}
