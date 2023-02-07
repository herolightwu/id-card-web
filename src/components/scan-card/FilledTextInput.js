import React, { useState } from 'react'

import useStyles from '../../utils/styles'

import { IconButton } from '@material-ui/core'
import { VColor } from '../../utils/constants'

import { Delete } from '@material-ui/icons'

export default function FilledTextInput({ label, type, name, showError, value, placeholder, formFields, removable, editMode, onDelete, disable=false}) {

  const [focused, setFocused] = useState(false)
  const [input, setInput] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)
  const classes = useStyles()

  const loadData = (val,placeholder) =>{
    if (formFields!==undefined){
      formFields(val,placeholder)
    }
  }
  const changeHandle = e => {
    setInput(e.target.value);
    loadData(e.target.value,placeholder)
    if (!e.target.value){
      setIsEmpty(true)
    } else {
      setIsEmpty(false)
    }
    
  }

  return (
    <div      
      style={{
        backgroundColor: VColor.lightGray,
        padding: 5,
        marginBottom: 20,
        position:'relative'
      }}
    >
      <div className={classes.labelText} style={{ marginLeft: 3 }}>
        {label}
      </div>
      <input
        className={classes.mainText}
        type={type}
        // value = {value}
        name={name}
        defaultValue = {value}
        placeholder={placeholder}
        onChange = {changeHandle}
        onFocus={()=>{
            setFocused(true)
        }}
        onBlur={()=>{
            setFocused(false)
        }}
        style={{
          width: '100%',
          borderWidth: 0,
          backgroundColor: VColor.lightGray,
          outline: 'none',
          borderBottomWidth: focused ? 2 : 0,
          borderBottomColor: VColor.blue
        }}
        disabled={disable}
      />
      { (showError&&isEmpty) && <div className={classes.errorText}>{showError}</div>}
      {
        removable && editMode ? (
          <IconButton style={{position:'absolute', right: 0, top: 10}} onClick={onDelete}>
            <Delete/>
          </IconButton>
        ) : null
      }
    </div>
  )
}
