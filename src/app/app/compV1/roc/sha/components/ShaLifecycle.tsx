import { useEffect, useState } from "react";
import { 
  Stack,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
} from "@mui/material";
import { AddrZero, HexType, booxMap } from "../../../../common";

import { VoteCountingOfGm } from "../../../gmm/components/actions_on_motion/VoteCountingOfGm";

import { getHeadOfFile } from "../../components/filesFolder";
import { CirculateSha } from "./actions/CirculateSha";
import { SignSha } from "./actions/SignSha";

import { ProposeDocOfGm } from "../../../gmm/components/actions_on_motion/ProposeDocOfGm";
import { VoteForDocOfGm } from "../../../gmm/components/actions_on_motion/VoteForDocOfGm";

import { ActivateSha } from "./actions/ActivateSha";
import { FinalizeSha } from "./actions/FinalizeSha";
import { getSHA } from "../../../gk";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { voteEnded } from "../../../gmm/meetingMinutes";
import { established } from "./sigPage/sigPage";
import { membersAllSigned } from "../sha";

interface ShaLifecycleProps {
  sha: HexType;
  finalized: boolean;
}

export function ShaLifecycle({sha, finalized}: ShaLifecycleProps) {

  const { gk, boox } = useComBooxContext();
  const [ activeStep, setActiveStep ] = useState<number>(0);
  const [ seqOfMotion, setSeqOfMotion ] = useState<bigint>();
  const [ passed, setPassed ] = useState<boolean>(false);
  const [ isFinalized, setIsFinalized ] = useState<boolean>(finalized);

  useEffect(()=>{
    const updateActiveStep = async () => {

      if (gk && boox) {

        // let shaInForce = await getSHA(gk);

        let allSigned = await membersAllSigned( boox[booxMap.ROM], sha);

        let head = await getHeadOfFile(boox[booxMap.ROC], sha);
        let fileState = head.state;
        let seq = head.seqOfMotion;
        let nextStep = 0;
        let flag = false;
        
        switch (fileState) {
          case 1: 
            nextStep = isFinalized ? 1: 0;
            break;
          case 2:
            flag = await established(sha);
            nextStep = flag 
              ? allSigned
                ? 6 : 3
              : 2;
            break;
          case 3: 
            flag = await voteEnded(boox[booxMap.GMM], seq);
            nextStep = flag ? 5 : 4;
            break;
          case 4: 
            nextStep = 6;
            break;
          case 5: // Rejected
            nextStep = 8;
            break;
          case 6: // Closed
            nextStep = 7;
            break;
          case 7: // Revoked
            nextStep = 8;
            break;
        }
  
        setActiveStep( nextStep );
  
        if (seq) setSeqOfMotion(seq); 
      }
    };

    updateActiveStep();
  }, [boox, gk, sha, isFinalized, passed, activeStep]);

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
                  <h3>Finalize SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Finalize terms & conditions of SHA (only for Owner of SHA).
                  </Typography>
                  <FinalizeSha addr={ sha } setIsFinalized={setIsFinalized} setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={1} >

                <StepLabel>
                  <h3>Circulate SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Circulate SHA to parties for execution (only for Parties of SHA).
                  </Typography>
                  <CirculateSha addr={ sha } setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={2} >

                <StepLabel>
                  <h3>Sign SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Sign SHA to accept its terms (only for Parties of SHA).
                  </Typography>
                  <SignSha addr={ sha } setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={3} >

                <StepLabel>
                  <h3>Propose SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Propose SHA to General Meeting for approval (only for Parties & Members).
                  </Typography>
                  <ProposeDocOfGm addr={ sha } seqOfVR={8} setNextStep={ setActiveStep } />
                </StepContent>

              </Step>

              <Step index={4} >

                <StepLabel>
                  <h3>Vote for SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Cast vote in General Meeting to approve SHA.
                  </Typography>

                  {seqOfMotion?.toString() && (
                    <VoteForDocOfGm seqOfMotion={ seqOfMotion } setNextStep={ setActiveStep } />
                  )}
                </StepContent>

              </Step>

              <Step index={5} >

                <StepLabel>
                  <h3>Count Vote</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Count vote result of SHA (only for Members).
                  </Typography>
                  {seqOfMotion?.toString() && (
                    <VoteCountingOfGm seqOfMotion={ seqOfMotion } setResult={setPassed} setNextStep={ setActiveStep } setOpen={()=>{}} refresh={()=>{}}/>
                  )}
                </StepContent>

              </Step>

              <Step index={6} >

                <StepLabel>
                  <h3>Activate SHA</h3>
                </StepLabel>
                <StepContent  >
                  <Typography>
                    Activate SHA into leagal forces (only for Parties of SHA).
                  </Typography>
                  <ActivateSha addr={ sha } setNextStep={ setActiveStep } />
                  
                </StepContent>

              </Step>

              <Step index={7} >

                <StepLabel>
                  <h3>In Force</h3>
                </StepLabel>
                <StepContent  >
                  
                  <Typography color={'HighlightText'}>
                    The SHA currently is In Force.
                  </Typography>

                </StepContent>

              </Step>

              <Step index={8} >

                <StepLabel>
                  <h3>Revoked</h3>
                </StepLabel>
                <StepContent  >
                  
                  <Typography color={'HighlightText'}>
                    SHA currently is revoked.
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
