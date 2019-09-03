import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Input,
  makeStyles,
  Modal,
  Paper,
  Typography
} from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Emoji } from '../Emoji'

interface Crop {
  aspect: number
  height: number
  unit: string
  width: number
  x: number
  y: number
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  formControl: {
    margin: 0
  },
  modalPaper: {
    left: '50%',
    position: 'absolute',
    width: '80vw',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    transform: 'translate(-50%, 0)'
  }
}))

const formControlStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    '& :hover': {
      backgroundColor: theme.palette.primary.light,
      borderRadius: theme.spacing(1)
    }
  },
  label: {
    padding: theme.spacing(1)
  }
}))

// interface ImageProps {}

export const ImageUpload: React.FC<{}> = props => {
  const classes = useStyles({})
  const formControlClasses = formControlStyles({})

  const [src, setSrc] = React.useState<string | ArrayBuffer>(null)
  const [crop, setCrop] = React.useState<Crop>({
    aspect: 1,
    height: 0,
    unit: '%',
    width: 30,
    x: 0,
    y: 0
  })
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>(null)
  const [fileUrl, setFileUrl] = React.useState<string>(null)
  const [imageRef, setImageRef] = React.useState<HTMLImageElement>(null)

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setSrc(reader.result))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // If you setState the crop in here you should return false.
  function onImageLoaded(image) {
    setImageRef(image)
  }

  function onCropComplete(completedCrop: Crop) {
    makeClientCrop(completedCrop)
  }

  function onCropChange(changedCrop: Crop, percentCrop) {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    setCrop(changedCrop)
  }

  function handleClose() {
    setSrc(null)
  }

  async function makeClientCrop(makeCrop: Crop) {
    if (imageRef && crop.width && crop.height) {
      setCroppedImageUrl(await getCroppedImg(imageRef, makeCrop, 'newFile.jpeg'))
    }
  }

  async function getCroppedImg(image, makeCrop: Crop, fileName: string): Promise<string> {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = makeCrop.width
    canvas.height = makeCrop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      makeCrop.x * scaleX,
      makeCrop.y * scaleY,
      makeCrop.width * scaleX,
      makeCrop.height * scaleY,
      0,
      0,
      makeCrop.width,
      makeCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        window.URL.revokeObjectURL(fileUrl)
        setFileUrl(window.URL.createObjectURL(blob))
        resolve(fileUrl)
      }, 'image/jpeg')
    })
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <FormControlLabel
          classes={formControlClasses}
          label={
            <Typography>
              Change <Emoji ariaLabel="selfie">🤳</Emoji>
            </Typography>
          }
          control={
            <React.Fragment>
              {/* <Button variant="contained">fart</Button> */}
              <Input
                style={{ display: 'none' }}
                inputProps={{
                  accept: 'image/jpeg'
                }}
                aria-describedby="upload-image"
                // className={classes.input}
                type="file"
                onChange={onSelectFile}
              />
            </React.Fragment>
          }
        />
      </FormControl>
      <Modal
        aria-label="Image crop dialogue"
        open={src !== null && src !== undefined}
        onClose={handleClose}
      >
        <Paper className={classes.modalPaper}>
          <Grid container justify="center" alignItems="center" spacing={1}>
            <Grid item>
              <Button color="primary" variant="contained">
                <CloudUploadIcon />
                &nbsp;Save
              </Button>
            </Grid>
            <Grid item>
              <Button color="secondary" variant="contained" onClick={handleClose}>
                <DeleteIcon />
                &nbsp;Discard
              </Button>
            </Grid>
            <Grid item xs={12}>
              <ReactCrop
                style={{
                  left: '50%',
                  transform: 'translate(-50%, 0)'
                }}
                circularCrop
                src={src}
                crop={crop}
                onImageLoaded={onImageLoaded}
                onComplete={onCropComplete}
                onChange={onCropChange}
              />
            </Grid>
            <Grid item>
              {croppedImageUrl && (
                <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
              )}
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    </div>
  )
}
