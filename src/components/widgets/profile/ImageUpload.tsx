import {
  Button,
  Fade,
  FormControl,
  FormControlLabel,
  Grid,
  Input,
  makeStyles,
  Modal,
  Paper,
  Typography,
  LinearProgress
} from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { ClientCredentials, ClientProfile } from '../../../store/models/client'
import { Emoji } from '../Emoji'
import { API } from '../../../store/api'

interface Crop {
  aspect: number
  height: number
  unit: string
  width: number
  x: number
  y: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

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

interface ErrorProps {
  error?: string
}

const ErrorMessage: React.FC<ErrorProps> = ({ error }) => (
  <Fade in={error !== undefined} timeout={250}>
    <div
      style={{
        backgroundColor: 'rgba(245, 68, 68, 1)',
        textAlign: 'center',
        borderRadius: '5px',
        padding: '5px'
      }}
    >
      <Typography>{error}</Typography>
    </div>
  </Fade>
)

interface ImageProps {
  profile?: ClientProfile
  credentials?: ClientCredentials
}

export const ImageUpload: React.FC<ImageProps> = ({ profile, credentials }) => {
  const classes = useStyles({})
  const formControlClasses = formControlStyles({})

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined)
  const [src, setSrc] = React.useState<string | ArrayBuffer | undefined>(undefined)
  const [crop, setCrop] = React.useState<Crop>({
    aspect: 1,
    height: 0,
    unit: '%',
    width: 20,
    x: 0,
    y: 0
  })
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | undefined>(undefined)
  const [blob, setBlob] = React.useState<Blob | undefined>(undefined)
  const [uploadErrorMessage, setUploadErrorMessage] = React.useState<string | undefined>(undefined)
  const [uploading, setUploading] = React.useState<boolean>(false)

  async function uploadBlob() {
    setUploading(true)
    const api = new API(credentials)
    api
      .uploadAvatar(profile.client_id, blob)
      .then(res => {
        handleClose()
        setUploading(false)
      })
      .catch(error => {
        setUploadErrorMessage(error.message)
        setTimeout(() => setUploadErrorMessage(undefined), 5000)
        setUploading(false)
      })
  }

  function flashError(message: string) {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(undefined), 5000)
  }

  function onSelectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length === 1) {
      if (target.files[0].size < MAX_FILE_SIZE) {
        const reader = new FileReader()
        reader.addEventListener('load', () => setSrc(reader.result))
        reader.readAsDataURL(target.files[0])
      } else {
        flashError('File is too large! (10MiB max)')
      }
    }
  }

  function onImageLoaded(image) {
    setImageRef(image)
  }

  function onCropComplete(completedCrop: Crop) {
    makeClientCrop(completedCrop)
  }

  function onCropChange(changedCrop: Crop) {
    setCrop(changedCrop)
  }

  function handleClose() {
    setSrc(null)
  }

  async function makeClientCrop(makeCrop: Crop) {
    if (imageRef && crop.width && crop.height) {
      getCroppedImg(imageRef, makeCrop)
    }
  }

  async function getCroppedImg(image, makeCrop: Crop): Promise<string> {
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

    return new Promise(() => {
      canvas.toBlob(updatedBlob => {
        if (!updatedBlob) {
          return
        }
        setBlob(updatedBlob)
      }, 'image/jpeg')
    })
  }

  return (
    <div className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          <FormControl className={classes.formControl}>
            <FormControlLabel
              classes={formControlClasses}
              label={
                <Typography>
                  Upload <Emoji ariaLabel="selfie">️🤳</Emoji>
                </Typography>
              }
              control={
                <React.Fragment>
                  <Input
                    style={{ display: 'none' }}
                    inputProps={{
                      accept: 'image/jpeg'
                    }}
                    aria-describedby="upload-image"
                    type="file"
                    onChange={onSelectFile}
                  />
                </React.Fragment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item>
          <ErrorMessage error={errorMessage} />
        </Grid>
      </Grid>
      <Modal
        aria-label="Image crop dialogue"
        open={src !== null && src !== undefined}
        onClose={handleClose}
      >
        <Paper className={classes.modalPaper}>
          <Grid container justify="center" alignItems="center" spacing={1}>
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                onClick={uploadBlob}
                disabled={uploading || blob === undefined || uploadErrorMessage !== undefined}
              >
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
                disabled={uploading}
              />
            </Grid>
            <Grid item>
              <ErrorMessage error={uploadErrorMessage} />
            </Grid>
            <Grid item xs={12}>
              {uploading && <LinearProgress />}
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    </div>
  )
}
