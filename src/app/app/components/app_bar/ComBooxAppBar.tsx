
import { ReactNode, useEffect, useState } from 'react';

import { 
  Box, 
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  Drawer,
  styled,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Stack,
} from '@mui/material';

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

const drawerWidth = 180;

import { 
  AssuredWorkload, 
  ListAlt, 
  ContentCopyOutlined, 
  CollectionsBookmarkOutlined,
  LibraryBooksOutlined,
  BadgeOutlined,
  PaymentsOutlined,
  HomeOutlined,
  Diversity1Outlined,
  QuizOutlined,
  ChevronLeft,
  LocalGasStationOutlined,
  CurrencyExchangeOutlined,
  ReduceCapacityOutlined,
  RedeemOutlined,
  WaterfallChart,
}  from '@mui/icons-material';

import MenuIcon from '@mui/icons-material/Menu';
import { GetTimestamp } from './components/GetTimestamp';
import { CompSymbol } from './components/CompSymbol';
import { LogIn } from './components/LogIn';
import { ErrMsg } from './components/ErrMsg';
import Link from 'next/link';
import { DocsSetting } from '../docs_setting/DocsSetting';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

type ComBooxAppBarType = {
  children: React.ReactNode
}

export function ComBooxAppBar({ children }: ComBooxAppBarType) {
    
  const { compInfo } = useComBooxContext();

  const [typeOfEntity, setTypeOfEntity] = useState(0);

  useEffect(()=>{
    if (compInfo?.typeOfEntity) {
      setTypeOfEntity(compInfo.typeOfEntity);      
    }
  }, [compInfo?.typeOfEntity]);

  const [isDAO, setIsDAO] = useState(false);

  useEffect(()=>{
    if (compInfo && compInfo.regNum) {
      setIsDAO(compInfo.regNum == 8);
    }
  }, [compInfo, compInfo?.regNum]);

  const [appBarOpen, setAppBarOpen] = useState(false);

  const handleDrawerOpen = () => {
    setAppBarOpen(true);
  }
  const handleDrawerClose = () => {
    setAppBarOpen(false);
  }

  const theme = useTheme();

  interface ItemOfList {
    href: string,
    label: string,
    tip: string,
    icon: ReactNode,
    divider: boolean,
  }


  const [ items, setItems ] = useState<ItemOfList[]>();

  useEffect(()=>{
    const defaultItems:ItemOfList[] = [
      {href: '/app', label: 'RegCenter', tip: 'Registration Center', icon: <AssuredWorkload />, divider: false},
      {href: '/app/fuel_tank', label: 'GasStation', tip: 'Gas Station', icon: <LocalGasStationOutlined />, divider: true},
    ];

    setItems(() => {
      let arr = [...defaultItems,
        {href: isDAO ? '/app/compV1' : '/app/comp', label: 'Home', tip: 'Homepage of Target Company', icon: <HomeOutlined />, divider: true},
        {href: isDAO ? '/app/compV1/roc' : '/app/comp/roc', label: 'ROC', tip: 'Register of Constitution', icon: <ListAlt />, divider: false},
        {href: isDAO ? '/app/compV1/roa' : '/app/comp/roa', label: 'ROA', tip:'Rigister of Agreements', icon: <ContentCopyOutlined />, divider: true},
        {href: isDAO ? '/app/compV1/rod' : '/app/comp/rod', label: 'ROD', tip:'Register of Directors', icon: <BadgeOutlined />, divider: false},  
        {href: isDAO ? '/app/compV1/bmm' : '/app/comp/bmm', label: 'BMM', tip:'Board Meeting Minutes', icon: <LibraryBooksOutlined />, divider: true},  
        {href: isDAO ? '/app/compV1/rom' : '/app/comp/rom', label: 'ROM', tip:'Register of Members', icon: <Diversity1Outlined />, divider: false},  
        {href: isDAO ? '/app/compV1/gmm' : '/app/comp/gmm', label: 'GMM', tip:'General Meeting Minutes', icon: <LibraryBooksOutlined />, divider: true},  
        {href: isDAO ? '/app/compV1/ros' : '/app/comp/ros', label: 'ROS', tip:'Register of Shares', icon: <PaymentsOutlined />, divider: false},
        {href: isDAO ? '/app/compV1/roo' : '/app/comp/roo', label: 'ROO', tip:'Register of Options', icon: <QuizOutlined />, divider: false},
        {href: isDAO ? '/app/compV1/rop' : '/app/comp/rop', label: 'ROP', tip:'Register of Pledges', icon: <CollectionsBookmarkOutlined />, divider: true},
        {href: isDAO ? '/app/compV1' : '/app/comp/ror', label: 'ROR', tip:'Register of Redemptions', icon: <RedeemOutlined />, divider: false},
        {href: isDAO ? '/app/compV1' : '/app/comp/wtf', label: 'WTF', tip:'Distribution Waterfalls', icon: <WaterfallChart />, divider: true},
        {href: isDAO ? '/app/compV1/roi' : '/app/comp/roi', label: 'ROI', tip:'Register of Investors', icon: <ReduceCapacityOutlined />, divider: false},
        {href: isDAO ? '/app/compV1/loo' : '/app/comp/loo', label: 'LOO', tip:'List of Orders', icon: <CurrencyExchangeOutlined />, divider: true},
      ];
      return arr;
    });
  }, [compInfo, compInfo?.regNum, isDAO]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={ appBarOpen }>
        <Toolbar >
          <Box sx={{ width:'100%' }} >

            <Stack direction="row" sx={{ alignItems:'center', justifyContent:'center', alignContent:'space-between' }} >

              <Stack direction='row' sx={{ alignItems:'center', justifyContent:'center'}} >
                
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={ handleDrawerOpen }
                  edge="start"
                  sx={{ mr: 2, ...(appBarOpen && { display: 'none' }) }}
                >
                  <MenuIcon />
                </IconButton>
              
                <DocsSetting />

                <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml:2}}>
                  ComBoox
                </Typography>

                <GetTimestamp />


              </Stack>

              <CompSymbol />

              <LogIn />

            </Stack>

          </Box>

        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={ appBarOpen }
      >

        <DrawerHeader sx={{ height: 72 }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>

        <Divider />

        <List>

          {items && (

            items.map((v, i)=>{
              if (typeOfEntity == 0 && i > 1) return null;
              if (typeOfEntity != 2 && typeOfEntity != 4 && i == 10) return null; 
              if (typeOfEntity != 3 && typeOfEntity != 4 && typeOfEntity != 6 &&
                  typeOfEntity != 8 && typeOfEntity != 9 && i == 15) return null;
              if (typeOfEntity < 7  && i == 12) return null;

              return (<div key={i}>
                <ListItem disablePadding >
                  <Tooltip title={v.tip} placement='right' arrow >
                    <ListItemButton 
                      LinkComponent={ Link }
                      href={v.href}
                    >
                      <ListItemIcon>
                        {v.icon}
                      </ListItemIcon>
                      <ListItemText primary={v.label} />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                {v.divider && (
                  <Divider flexItem />
                )}
              </div>)
            })

          )}

        </List>

      </Drawer>

      <Main open={ appBarOpen } >
        <DrawerHeader />
        { children }
        <ErrMsg />
      </Main>

    </Box>
  );
}