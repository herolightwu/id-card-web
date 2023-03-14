import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import { TextField } from '@material-ui/core'

import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FilledTextInput from '../scan-card/FilledTextInput'
import Utils from '../../utils/utils'
import Constants from '../../utils/constants'

var xxpos = 88, yypos = 160

export default function AddFieldDlg({

  open = false,
  onCancel,
  onAdd,
  handleClose,
}) {
 
  const [label, setLabel] = React.useState("")
  const [value, setValue] = React.useState("text")
  const [dispSide, setDispSide] = React.useState(Constants.displaySide.none)
  const [txtColor, setTxtColor] = React.useState('black')
  const [txtSize, setTxtSize] = React.useState(14)
  const [showError, setShowError] = React.useState("")
  
  React.useEffect(()=>{
    xxpos = 88
    yypos = 160
  }, [open])

  const handleAdd = () => {
    if(!label)
    {
      return 
    }
    if (onAdd) {
      onAdd(label, value, dispSide, xxpos, yypos, txtColor, txtSize)
    }
  }

  const handleChangeType = event => {
    setValue(event.target.value)
  }
  
  const changePosition = (val,placeholder) => {
    // console.log("change: ", val, placeholder)
    if (placeholder == 'x_pos'){
      if (val >= 0 && val < Constants.cardSize.width ) {
        xxpos = val
        setShowError("")
      } else {
        setShowError("0~" + Constants.cardSize.width)
      }
    } else if (placeholder == 'y_pos'){
      if (val >= 0 && val < Constants.cardSize.height ) {
        yypos = val
        setShowError("")
      } else {
        setShowError("0~" + Constants.cardSize.height)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent style={{ minWidth: 400, paddingTop: 20 }}>
        <div>
          <Typography variant="body1">Add a field</Typography>
        </div>
        <TextField
          required
          id="filled-required"
          label="Label"
          type="text"
          variant="filled"
          value={label}
          onChange={e => {
            setLabel(e.target.value)
          }}
          fullWidth
        />
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="fields"
            name="fields"
            value={value}
            onChange={handleChangeType}
          >
            <FormControlLabel value="text" control={<Radio color="primary"/>} label="Text" />
            <FormControlLabel
              value="number"
              control={<Radio  color="primary"/>}
              label="Number"
            />
            <FormControlLabel value="email" control={<Radio color="primary" />} label="Email" />
            <FormControlLabel
              value="phone"
              control={<Radio color="primary" />}
              label="Phone Number"
            />
          </RadioGroup>
        </FormControl>

        <hr style={{
            background: 'gray',
            color: 'gray',
            borderColor: 'gray',
            height: '1px',
          }}/>
        
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'start', marginTop:'-15px'}}>
            <Typography style={{width: '140px', marginRight: '20px', marginTop:'8px'}}>Display on the card</Typography>
            <FormControlLabel                
              label="Front"
              control={
                <Checkbox
                  checked={dispSide == Constants.displaySide.front}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setDispSide(checked? Constants.displaySide.front : Constants.displaySide.none)
                    // console.log("front side : ", checked)
                  }}
                  name="front"
                  color="primary"
                />
              }
            />
            <FormControlLabel                
              label="Back"
              control={
                <Checkbox
                  checked={dispSide == Constants.displaySide.back}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setDispSide(checked? Constants.displaySide.back : Constants.displaySide.none)
                    // console.log("back side : ", checked)
                  }}
                  name="back"
                  color="primary"
                />
              }
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'start', height: '50px', marginTop:'-10px'}}>
            <Typography style={{marginRight: '10px', marginTop:'8px'}}>X</Typography>
            <div style={{width: '70px', marginRight: '25px'}}>
              <FilledTextInput
                key={Utils.getKey()}
                label=''
                type='number'
                value ={xxpos}
                placeholder='x_pos'
                editMode={true} 
                formFields={(changePosition.bind(this))}
                showError={showError}
              />
            </div>              
            <div style={{
                width: '50%',
                display: 'flex',
                flexDirection: 'row', 
                justifyContent: 'start',
              }}>
                  <InputLabel id="select-fsize" style={{paddingTop: 10, width:'50%'}}>Font Size </InputLabel>
                  <Select 
                    style={{width:'50%', height: '40px'}}
                    labelId="select-fsize"
                    id="select-fsize"
                    value={txtSize}
                    onChange={e => { 
                      setTxtSize(e.target.value)                     
                      // console.log("Font Size : ", e.target.value)
                    }}>
                    <MenuItem value={'10'} key={'10'}>10</MenuItem>
                    <MenuItem value={'11'} key={'11'}>11</MenuItem>
                    <MenuItem value={'12'} key={'12'}>12</MenuItem>
                    <MenuItem value={'13'} key={'13'}>13</MenuItem>
                    <MenuItem value={'14'} key={'14'}>14</MenuItem>
                    <MenuItem value={'15'} key={'15'}>15</MenuItem>
                    <MenuItem value={'16'} key={'16'}>16</MenuItem>
                    <MenuItem value={'17'} key={'17'}>17</MenuItem>
                    <MenuItem value={'18'} key={'18'}>18</MenuItem>
                  </Select>                  
              </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'start'}}>
            <Typography style={{marginRight: '10px', marginTop:'8px'}}>Y</Typography>
            <div style={{width: '70px', marginRight: '25px'}}>
              <FilledTextInput
                key={Utils.getKey()}
                label=''
                type='number'
                value ={yypos}
                placeholder='y_pos'
                editMode={true} 
                formFields={changePosition.bind(this)}
                showError={showError}
              />
            </div>              
            <div style={{
                width: '50%',
                display: 'flex',
                flexDirection: 'row', 
                justifyContent: 'start',
              }}>
                  <InputLabel id="select-color" style={{paddingTop: 10, width:'50%'}}>Color </InputLabel>
                  <Select 
                    style={{width:'50%', height: '40px'}}
                    labelId="select-color"
                    id="select-color"
                    value={txtColor}
                    onChange={e => {
                      setTxtColor(e.target.value)                 
                      // console.log("Color : ", e.target.value)
                    }}>
                    <MenuItem value={'black'} key={'1'}>Black</MenuItem>
                    <MenuItem value={'red'} key={'2'}>Red</MenuItem>
                    <MenuItem value={'white'} key={'3'}>White</MenuItem>
                    <MenuItem value={'gray'} key={'4'}>Gray</MenuItem>
                    <MenuItem value={'green'} key={'5'}>Green</MenuItem>
                  </Select>                  
              </div>
          </div>
      </DialogContent>
      <DialogActions
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: '10px 15px',
        }}
      >
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary" autoFocus disabled={!label}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
