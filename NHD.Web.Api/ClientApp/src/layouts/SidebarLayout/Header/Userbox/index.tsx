import { useRef, useState } from 'react';

import { NavLink } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  lighten,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography
} from '@mui/material';


import { styled } from '@mui/material/styles';


const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);


const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`
);


function HeaderUserbox() {
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser) {
    return null;
  }
  const user = {
    name: storedUser.fullName,
    phoneNumber: storedUser.phoneNumber,
    email: storedUser.email,
    avatar: '/static/images/avatars/admin.png',
  };


  return (
    <>
      <UserBoxButton color="secondary">
        <Avatar variant="rounded" alt={user.name} src={user.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
          </UserBoxText>
        </Hidden>
      </UserBoxButton>
    </>
  );
}

export default HeaderUserbox;
