import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Typography from '@material-ui/core/Typography'


export default function LoadFileDlg({
  open = false,
  bLoaded = false,
  onLoadZip,
  onLoadCsv,
  onCancel,
  handleClose
}) {
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const [loaded, setLoaded] = React.useState(false)

  const handleZip = () => {
    onLoadZip()
  }

  const handleCsv = () => {
    onLoadCsv()
  }

  React.useEffect(()=>{
    setLoaded(bLoaded)
  }, [bLoaded])

  const btnStyle = {
    width: 200,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 20,
    minWidth: 120,
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
          <Typography variant="body1">
            Please load the images zip file for batch ordering
          </Typography>
        </div>
        <Button 
          onClick={handleZip} 
          variant='contained'
          color='primary'
          style={btnStyle}>
          Load image zip
        </Button>

        <div>
          <Typography variant="body1">
            Please load the csv file for batch ordering
          </Typography>
        </div>
        <Button
          style={btnStyle}
          disabled={!loaded}  
          onClick={handleCsv} 
          variant='contained'
          color='primary'>
          Load csv
        </Button>
      </DialogContent>
      <DialogActions
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'end',
          padding: '10px 15px',
        }}
      >
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
