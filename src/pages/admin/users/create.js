import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import useStyles from '../../../utils/styles'

import { useTheme } from '@material-ui/core'

import useMediaQuery from '@material-ui/core/useMediaQuery'

import {UserView} from './view'


export default function AdminUserCreate(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  const theme = useTheme()
  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }

  // const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isDesktop = useMediaQuery('(min-width:1053px)')

  return (
    <UserView
      {...props}
      menuIndex={5}
      isAdd={true}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
