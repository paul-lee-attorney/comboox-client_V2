import { readContract } from "@wagmi/core";


import { meetingMinutesABI } from "../../../../../generated-v1";
import { OrgVotingRule } from "../roc/sha/components/rules/VotingRules/SetVotingRule";
import { AddrZero, HexType } from "../../common";

export interface Action {
  target: HexType;
  value: string;
  params: HexType;
}

export const defaultAction: Action = {
  target: AddrZero,
  value: '0',
  params: `0x${'00'}`,
}

export async function isProposed(minutes: HexType, seqOfMotion: bigint): Promise<boolean> {
  let flag: boolean = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'isProposed',
    args: [ seqOfMotion ],
  })

  return flag;
}

export async function voteStarted(minutes: HexType, seqOfMotion: bigint): Promise<boolean> {
  let flag: boolean = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'voteStarted',
    args: [ seqOfMotion ],
  })

  return flag;
}

export async function voteEnded(minutes: HexType, seqOfMotion: bigint): Promise<boolean> {
  let flag: boolean = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'voteEnded',
    args: [ seqOfMotion ],
  })

  return flag;
}

// ==== Delegate ====

export interface LeavesInfo {
  weight: bigint;
  emptyHead: number;
}

export interface Voter {
  delegate: number;
  weight: bigint;
  repWeight: bigint;
  repHead: number;
  principals: readonly number[];
}

export async function getVoterOfDelegateMap(minutes: HexType, seqOfMotion: bigint, acct: bigint): Promise<Voter> {

  let res = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'getVoterOfDelegateMap',
    args: [ seqOfMotion, acct ],
  })

  let voter:Voter = {
    delegate: res.delegate,
    weight: res.weight,
    repWeight: res.repWeight,
    repHead: Number(res.repHead),
    principals: res.principals.map(v => Number(v)),
  }

  return voter;
}

export async function getDelegateOf(minutes: HexType, seqOfMotion: bigint, acct: bigint): Promise<bigint> {
  
  let delegate:bigint = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'getDelegateOf',
    args: [ seqOfMotion, acct ],
  })

  return delegate;
}

// ==== Motion ====

export interface HeadOfMotion {
  typeOfMotion: number;
  seqOfMotion: bigint;
  seqOfVR: number;
  creator: number;
  executor: number;
  createDate: number;
  data: number;
}

export interface BodyOfMotion {
  proposer: number;
  proposeDate: number;
  shareRegDate: number;
  voteStartDate: number;
  voteEndDate: number;
  para: number;
  state: number;
}

export interface Motion {
  head: HeadOfMotion,
  body: BodyOfMotion,
  votingRule: OrgVotingRule,
  contents: bigint,
}

export function motionSnParser(sn: HexType): HeadOfMotion {
  let head: HeadOfMotion = {
    typeOfMotion: parseInt(sn.substring(2, 6), 16),
    seqOfMotion: BigInt(`0x${sn.substring(6, 22)}`),
    seqOfVR: parseInt(sn.substring(22, 26)),
    creator: parseInt(sn.substring(26, 36)),
    executor: parseInt(sn.substring(36, 46)),
    createDate: parseInt(sn.substring(46, 58)),
    data: parseInt(sn.substring(58, 66)),
  }
  return head;
}

export async function getMotion(bog: HexType, seq: bigint): Promise<Motion> {
  let motion = await readContract({
    address: bog,
    abi: meetingMinutesABI,
    functionName: 'getMotion',
    args: [seq],
  })

  return motion;
}

export async function getSeqList(minutes: HexType): Promise<readonly bigint[]> {
  let list: readonly bigint[] = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'getSeqList',
  })

  return list;  
}

export async function getMotionsList(minutes: HexType): Promise<Motion[]> {

  let seqList: readonly bigint[] = await getSeqList(minutes);

  let len = seqList.length;
  let ls: Motion[] = [];
  let i = len >= 100 ? len - 100 : 0;

  while( i < len ) {
    let motion = await getMotion(minutes, seqList[len-i-1]);
    ls.push(motion);
    i++;
  }

  return ls;
}

// ==== Voting ====

export interface VoteCase {
  sumOfHead: number;
  sumOfWeight: bigint;
  voters: readonly bigint[];
}

export const defaultVoteCase: VoteCase = {
  sumOfHead: 0,
  sumOfWeight: BigInt(0),
  voters: [BigInt(0)],
}

export async function isVoted(minutes: HexType, seqOfMotion: bigint, acct: bigint): Promise<boolean> {
  let flag:boolean = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'isVoted',
    args: [ seqOfMotion, acct ],
  })

  return flag;
}

export async function isVotedFor(minutes: HexType, seqOfMotion: bigint, acct: bigint, atti: bigint): Promise<boolean> {

  let flag:boolean = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'isVotedFor',
    args: [ seqOfMotion, acct, atti ],
  })

  return flag;
}

export async function getCaseOfAttitude(minutes: HexType, seqOfMotion: bigint, atti: bigint): Promise<VoteCase> {
  let voteCase: VoteCase = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'getCaseOfAttitude',
    args: [ seqOfMotion, atti ],
  });

  return voteCase;
}

export async function getVoteResult(minutes: HexType, seqOfMotion: bigint): Promise<VoteCase[]>{

  let i = 0;
  let list: VoteCase[] = [];

  while (i < 4) {
    let item = await getCaseOfAttitude(minutes, seqOfMotion, BigInt(i));
    list.push(item);
    i++;
  }

  return list;
}

// ==== Ballot ====

export interface Ballot {
  acct: number;
  attitude: number;
  head: number;
  weight: bigint;
  sigDate: number;
  blocknumber: bigint;
  sigHash: HexType;
}

export async function getBallot(minutes:HexType, seqOfMotion: bigint, acct: bigint): Promise<Ballot> {
  let ballot:Ballot = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'getBallot',
    args: [ seqOfMotion, acct ],
  });

  return ballot;
}

export async function getBallotsList(minutes: HexType, seqOfMotion: bigint, voters: readonly bigint[]): Promise<Ballot[]> {
  let list: Ballot[] = [];

  let len = voters.length;
  let i=0;

  while (i < len) {
    let ballot = await getBallot(minutes, seqOfMotion, voters[i]);
    list.push(ballot);
    i++;
  }

  return list;
}

export async function isPassed(minutes: HexType, seqOfMotion: bigint): Promise<boolean> {
  let flag = await readContract({
    address: minutes,
    abi: meetingMinutesABI,
    functionName: 'isPassed',
    args: [ seqOfMotion ],
  })

  return flag;
}

export function getTypeOfMotion(motion: Motion): string {

  let typeOfMotion = motion.votingRule.authority == 1
          ? 'GMM/'
          : 'BMM/' ;

  switch(motion.head.typeOfMotion) {
    case 1 :
      typeOfMotion += 'AddOfficer/';
      break;
    case 2 :
      typeOfMotion += 'RemoveOfficer/';
      break;
    case 3 :
      typeOfMotion += 'Doc/';
      break;
    case 4 :
      typeOfMotion += 'Action/';
      break;
    case 5 :
      typeOfMotion += 'TransferFund/';
      break;
    case 6 :
      typeOfMotion += 'Distribute/';
      break;
    case 7 :
      typeOfMotion += 'DeprecateGK/';
      break;
  }

  return typeOfMotion;
}

export const motionType = [
  'ElectOfficer', 'RemoveOfficer', 'ApproveDocument', 'ApproveAction',
  'TransferFund', 'DistributeAssets', 'DeprecateGK', 'TransferUSD'
];

export const statesOfMotion = [
  'Created', 'Proposed', 'Passed', 'Rejected', 
  'Rejected_NotToBuy', 'Rejected_ToBuy', 'Executed'
];

