import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import useStyles from '../../../utils/styles'

import { useTheme } from '@material-ui/core'

import useMediaQuery from '@material-ui/core/useMediaQuery'

import {LicenseView} from './view'

export default function(props) {
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
  const isSmall = useMediaQuery('(max-width:600px)')
  return (
    <LicenseView
      {...props}
      menuIndex={5}
      dispatch={dispatch}
      isDesktop={isDesktop}
      isSmall={isSmall}
      isAdd={true}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
