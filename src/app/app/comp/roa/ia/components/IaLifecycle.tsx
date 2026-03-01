import { useEffect, useState } from "react";

import { Stack, Paper, Box, Stepper, Step, StepLabel,
  StepContent, Typography } from "@mui/material";

import { HexType, booxMap } from "../../../../common";
import { VoteCountingOfGm } from "../../../gmm/components/actions_on_motion/VoteCountingOfGm";
import { voteEnded } from "../../../gmm/meetingMinutes";
import { SignIa } from "./SignIa";
import { CirculateIa } from "./CirculateIa";
import { ProposeDocOfGm } from "../../../gmm/components/actions_on_motion/ProposeDocOfGm";
import { VoteForDocOfGm } from "../../../gmm/components/actions_on_motion/VoteForDocOfGm";
import { FinalizeIa } from "./FinalizeIa";
import { getTypeOfIA } from "../ia";
import { established } from "../../../roc/sha/components/sigPage/sigPage";
import { getHeadOfFile } from "../../../roc/components/filesFolder";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

interface IaLifecycleProps {
  addr: HexType;
  isFinalized: boolean;
}

export function IaLifecycle({addr, isFinalized}: IaLifecycleProps) {

  const { boox } = useComBooxContext();
  const [ activeStep, setActiveStep ] = useState<number>(0);
  const [ seqOfMotion, setSeqOfMotion ] = useState<bigint>();

  const [ typeOfIa, setTypeOfIa ] = useState<number>();
  const [ finalized, setFinalized ] = useState<boolean>(isFinalized);

  useEffect(()=>{
    getTypeOfIA(addr).then(
      res => setTypeOfIa(res)
    )
  }, [addr, activeStep])

  useEffect(()=>{
    if (boox) {
      getHeadOfFile(boox[booxMap.ROA], addr).then(
        head => {
          let seq = head.seqOfMotion;
          if (seq) setSeqOfMotion(seq);
    
          let fileState = head.state;
          let flag = false;
    
          switch (fileState) {
              case 1: 
                setActiveStep(finalized ? 1: 0);
                break;
              case 2:
                established(addr).then(
                  flag => setActiveStep(flag ? 3 : 2)
                )
                break;
              case 3: 
                if (boox ) voteEnded(boox[booxMap.GMM], seq).then(
                  flag => setActiveStep(flag ? 5 : 4)
                );
                break;
              case 4: 
                setActiveStep(6);
                break;
              case 5: // Rejected
                setActiveStep(8);
                break;
              default:
                setActiveStep(fileState + 1);
          }    
        }
      )
    }
  }, [boox, addr, finalized]);

  return (
    <Stack sx={{ width: '100%', alignItems:'center' }} direction={'column'} >
      
      <Paper elevation={3}
        sx={{
          m:1, p:1,
          border:1,
          borderColor:'divider'
        }} 
      >
        {activeStep != undefined && (
          <Box sx={{ width:1280 }} >
            <Stepper sx={{ pl:5 }} activeStep={ activeStep } orientation="vertical" >

              <Step index={0} >
                
                <StepLabel>
                  <h3>Finalize IA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Finalize terms & conditions of IA (only for Owner of IA).
                  </Typography>

                  <FinalizeIa addr={ addr } setIsFinalized={ setFinalized } setNextStep={ setActiveStep }  />
                </StepContent>

              </Step>

              <Step index={1} >

                <StepLabel>
                  <h3>Circulate IA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Circulate IA to parties for execution (only for Parties of IA).
                  </Typography>
                  <CirculateIa addr={ addr } setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={2} >

                <StepLabel>
                  <h3>Sign IA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Sign IA to accept its terms (only for Parties of IA).
                  </Typography>
                  <SignIa addr={ addr } setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={3} >

                <StepLabel>
                  <h3>Propose IA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Propose IA to General Meeting for approval (only for Parties & Members).
                  </Typography>
                  {typeOfIa && (
                    <ProposeDocOfGm addr={ addr } seqOfVR={typeOfIa} setNextStep={ setActiveStep } />
                  )}
                </StepContent>

              </Step>

              <Step index={4} >

                <StepLabel>
                  <h3>Vote for IA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Cast vote in General Meeting to approve IA.
                  </Typography>

                  {seqOfMotion != undefined && (
                    <VoteForDocOfGm seqOfMotion={ seqOfMotion } setNextStep={()=>{}} />
                  )}
                </StepContent>

              </Step>

              <Step index={5} >

                <StepLabel>
                  <h3>Count Vote</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Count vote result of IA (only for Members).
                  </Typography>
                  {seqOfMotion != undefined && (
                    <VoteCountingOfGm seqOfMotion={ seqOfMotion } setResult={()=>{}} setNextStep={ setActiveStep } setOpen={()=>{}} refresh={()=>{}}  />
                  )}
                </StepContent>

              </Step>

              <Step index={6} >

                <StepLabel>
                  <h3>Is Approved</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    The IA is approved by Shareholders.
                  </Typography>                  
                </StepContent>

              </Step>

              <Step index={7} >

                <StepLabel>
                  <h3>Closed</h3>
                </StepLabel>
                <StepContent  >
                  
                  <Typography>
                    The IA currently is Closed.
                  </Typography>

                </StepContent>

              </Step>

              <Step index={8} >

                <StepLabel>
                  <h3>Revoked</h3>
                </StepLabel>
                <StepContent  >
                  
                  <Typography>
                    The IA currently is revoked.
                  </Typography>

                </StepContent>

              </Step>

            </Stepper>
          </Box>
        )}

      </Paper>

    </Stack>   
  );
} 
