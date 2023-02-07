import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import barLogo from '../../assets/images/bar-logo.png'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  title: {},
}))

export default function Login() {
  const classes = useStyles()

  return (
    <div className="logo-div">
      
      <img 
        alt="" 
        src={barLogo}
      />
      
    </div>
  )
}
