import { useContext, useState } from 'react';
import {
  ListSubheader,
  alpha,
  Box,
  List,
  styled,
  Button,
  ListItem,
  Collapse
} from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/SidebarContext';

import CheckBoxTwoToneIcon from '@mui/icons-material/CheckBoxTwoTone';
import TableChartTwoToneIcon from '@mui/icons-material/TableChartTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import BallotTwoToneIcon from '@mui/icons-material/BallotTwoTone';
import MmsTwoToneIcon from '@mui/icons-material/MmsTwoTone';
import EmergencyShareIcon from '@mui/icons-material/EmergencyShare';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';

import { RouterUrls } from 'src/common/RouterUrls';

// ---------- STYLES ----------
const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};
  }
  .MuiListSubheader-root {
    text-transform: uppercase;
    font-weight: bold;
    font-size: ${theme.typography.pxToRem(12)};
    color: ${theme.colors.alpha.trueWhite[50]};
    padding: ${theme.spacing(0, 2.5)};
  }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {
      .MuiListItem-root {
        padding: 1px 0;
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};
          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};
            .MuiButton-startIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }
      }
    }
`
);

// ---------- COMPONENT ----------
function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);

  return (
    <MenuWrapper>
      <List component="div">
        <SubMenuWrapper>
          <List component="div">

            {/* PRODUCTS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/"
                startIcon={<CheckBoxTwoToneIcon />}
              >
                Products
              </Button>
            </ListItem>

            {/* COLLECTIONS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.collectionsList}
                startIcon={<DataUsageIcon />}
              >
                Product Collections
              </Button>
            </ListItem>

            {/* SECTIONS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.sectionsList}
                startIcon={<AutoAwesomeMosaicIcon />}
              >
                Informative Sections
              </Button>
            </ListItem>

            {/* DATES */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.datesList}
                startIcon={<EmergencyShareIcon />}
              >
                Dates
              </Button>
            </ListItem>

            {/* CUSTOMERS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.customersList}
                startIcon={<AccountCircleTwoToneIcon />}
              >
                Customers
              </Button>
            </ListItem>

            {/* TRANSACTIONS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.transactionsList}
                startIcon={<MmsTwoToneIcon />}
              >
                Transactions
              </Button>
            </ListItem>

            {/* FAQS */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.faqsList}
                startIcon={<HelpOutlineIcon />}
              >
                FAQs
              </Button>
            </ListItem>

            {/* CONTACT MESSAGES */}
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.contactsList}
                startIcon={<ContactMailIcon />}
              >
                Complaints
              </Button>
            </ListItem>

            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to={RouterUrls.propertiesList}
                startIcon={<TableChartTwoToneIcon />}
              >
                Properties
              </Button>
            </ListItem>

          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );

}

export default SidebarMenu;
