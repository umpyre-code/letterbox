import {
  Box,
  Button,
  createStyles,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  makeStyles,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Theme,
  Typography,
  WithStyles
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ContactMailIcon from '@material-ui/icons/ContactMail'
import { withStyles } from '@material-ui/styles'
import qs from 'qs'
import * as React from 'react'
import { API_ENDPOINT, PUBLIC_URL } from '../../../store/api'
import { ClientProfile } from '../../../store/models/client'
import { CopyIcon } from '../CopyIcon'

const badgeStyles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'inline-block',
      verticalAlign: 'middle',
      backgroundColor: theme.palette.secondary.light,
      borderRadius: '12px',
      padding: theme.spacing(1),
      minWidth: '90px',
      boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
    }
  })

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // badgeButton: {
    //   backgroundColor: '#ffcccc',
    //   borderRadius: '12px',
    //   cursor: 'pointer',
    //   display: 'inline-block',
    //   padding: theme.spacing(1),
    //   verticalAlign: 'middle',
    //   textTransform: 'none',
    //   textAlign: 'left',
    //   minWidth: '90px'
    // },
    copyBox: {},
    badgeBox: {
      '& pre': {
        whiteSpace: 'pre-wrap'
      },
      backgroundColor: '#eeeeee',
      padding: theme.spacing(0, 1, 0, 1),
      borderRadius: '5px',
      overflow: 'scroll',
      height: '150px',
      maxWidth: '550px',
      margin: theme.spacing(1)
    },
    root: {
      position: 'relative'
    },
    modalPaper: {
      padding: theme.spacing(3),
      boxShadow: theme.shadows[3],
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 70px)',
      position: 'absolute'
    },
    formControl: {},
    group: {
      padding: theme.spacing(1)
    }
  })
)

interface BadgeProps {
  profile?: ClientProfile
}

type BadgeSize = 'small' | 'medium' | 'large'
type BadgeFormat = 'svg' | 'png'
type BadgeCodeFormat = 'html' | 'markdown'
type BadgeStyle = 'light' | 'dark'
interface BadgeDimensions {
  width: number
  height: number
}

interface BadgeOptions {
  name: string
  size: BadgeSize
  imageFormat: BadgeFormat
  codeFormat: BadgeCodeFormat
  fontSize: number
  style: BadgeStyle
}

function getBadgeDimensions(size: BadgeSize): BadgeDimensions {
  let width = 156.5 * 1.35
  let height = 50.4 * 1.35
  if (size === 'small') {
    width *= 0.75
    height *= 0.75
  } else if (size === 'large') {
    width *= 1.25
    height *= 1.25
  }
  return {
    width,
    height
  }
}

function getBadgeImageUrl(profile: ClientProfile, options: BadgeOptions) {
  const dimensions = getBadgeDimensions(options.size)

  if (options.imageFormat === 'png' && options.codeFormat === 'html') {
    // if we're generating HTML, and this is a PNG, double the number of pixels
    const querystring = qs.stringify({
      width: dimensions.width * 2,
      height: dimensions.height * 2,
      name: options.name,
      font_size: options.fontSize,
      style: options.style
    })

    return `${API_ENDPOINT}/badge/${profile.client_id}/badge.${options.imageFormat}?${querystring}`
  }

  const querystring = qs.stringify({
    ...dimensions,
    name: options.name,
    font_size: options.fontSize,
    style: options.style
  })

  return `${API_ENDPOINT}/badge/${profile.client_id}/badge.${options.imageFormat}?${querystring}`
}

interface ImageRadioProps {
  imageSrc: string
  alt: string
  width: number
  height: number
}

const radioStyles = makeStyles(() =>
  createStyles({
    root: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    },
    checked: {
      '& + img': {
        backgroundColor: '#e6ee9c',
        borderColor: '#e6ee9c',
        boxShadow: '0 0 10px #e6ee9c',
        borderRadius: '10px'
      }
    }
  })
)

export const ImageRadio: React.FC<ImageRadioProps> = ({
  width,
  height,
  alt,
  imageSrc,
  ...outerProps
}) => {
  const classes = radioStyles({})
  return (
    <React.Fragment>
      <Radio {...outerProps} classes={classes} />
      <img alt={alt} src={imageSrc} width={width} height={height} />
    </React.Fragment>
  )
}

function renderBadge(profile: ClientProfile, options: BadgeOptions): string {
  const badgeUrl = getBadgeImageUrl(profile, options)
  const profileUrl = `${PUBLIC_URL}/u/${profile.client_id}`
  if (options.codeFormat === 'markdown') {
    return `[![Contact ${options.name} on Umpyre](${badgeUrl})](${profileUrl})`
  }
  if (options.codeFormat === 'html') {
    const dimensions = getBadgeDimensions(options.size)
    return `<a href="${profileUrl}" target="_blank"><img width="${dimensions.width}" height="${dimensions.height}" src="${badgeUrl}" alt="Contact ${options.name} on Umpyre" /></a>`
  }
  return 'something went wrong! D:'
}

export const BadgeDisplay: React.FC<BadgeProps> = ({ profile }) => {
  const classes = useStyles({})
  const [sizeValue, setSizeValue] = React.useState<BadgeSize>('medium')
  const [formatValue, setFormatValue] = React.useState<BadgeCodeFormat>('markdown')
  const [nameValue, setNameValue] = React.useState<string>(profile.full_name)
  const [badgeStyleValue, setBadgeStyle] = React.useState<BadgeStyle>('light')
  const [copied, setCopied] = React.useState<boolean>(false)
  const [fontSizeValue, setFontSizeValue] = React.useState<number>(14)
  const [imageFormat, setImageFormat] = React.useState<BadgeFormat>('svg')
  const badgeOptions = {
    name: nameValue,
    size: sizeValue,
    codeFormat: formatValue,
    fontSize: fontSizeValue,
    imageFormat,
    style: badgeStyleValue
  }
  const badge = renderBadge(profile, badgeOptions)
  return (
    <React.Fragment>
      <Grid item container spacing={1}>
        <Grid item xs={6}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Size</FormLabel>
            <RadioGroup
              aria-label="badge size"
              name="size1"
              className={classes.group}
              value={sizeValue}
              onChange={event => {
                setSizeValue(event.target.value as BadgeSize)
              }}
              row
            >
              <FormControlLabel value="small" control={<Radio />} label="S" />
              <FormControlLabel value="medium" control={<Radio />} label="M" />
              <FormControlLabel value="large" control={<Radio />} label="L" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Format</FormLabel>
            <RadioGroup
              aria-label="badge format"
              name="format1"
              className={classes.group}
              value={formatValue}
              onChange={event => {
                setFormatValue(event.target.value as BadgeCodeFormat)
              }}
              row
            >
              <FormControlLabel value="markdown" control={<Radio />} label="Markdown" />
              <FormControlLabel value="html" control={<Radio />} label="HTML" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item container spacing={1}>
        <Grid item xs={6}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Style</FormLabel>
            <RadioGroup
              aria-label="badge style"
              name="format1"
              className={classes.group}
              value={badgeStyleValue}
              onChange={event => {
                setBadgeStyle(event.target.value as BadgeStyle)
              }}
              row
            >
              <FormControlLabel value="light" control={<Radio />} label="Light" />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset" className={classes.formControl} fullWidth>
            <FormLabel component="legend">Font size</FormLabel>
            <Slider
              style={{ padding: '27px 0 0 0' }}
              value={(fontSizeValue - 10) / 2}
              aria-labelledby="font-size-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={8}
              onChange={(event, value) => {
                setFontSizeValue(Number(value) * 2 + 10)
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" className={classes.formControl} fullWidth>
            <FormLabel component="legend">Display name</FormLabel>
            <TextField
              value={nameValue}
              onChange={event => {
                setNameValue(event.target.value)
              }}
              margin="dense"
              variant="outlined"
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs>
        <Box className={classes.badgeBox}>
          <pre>{badge}</pre>
        </Box>
      </Grid>
      <Grid item>
        <Box className={classes.copyBox}>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(badge)
              setCopied(true)
              setTimeout(() => {
                setCopied(false)
              }, 1000)
            }}
          >
            <CopyIcon>copy</CopyIcon>
            Copy to clipboard <span style={{ visibility: copied ? 'visible' : 'hidden' }}>✔</span>
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Image preview</FormLabel>
        <RadioGroup
          aria-label="badge image format"
          name="imageFormat1"
          className={classes.group}
          value={imageFormat}
          onChange={event => {
            setImageFormat(event.target.value as BadgeFormat)
          }}
          row
        >
          <Grid container justify="center" alignItems="center">
            <Grid item xs={12} sm={6} style={{ height: '115px', minWidth: '268px' }}>
              <FormControlLabel
                value="svg"
                labelPlacement="bottom"
                style={{ margin: 0, display: 'flex' }}
                control={
                  <ImageRadio
                    {...getBadgeDimensions(badgeOptions.size)}
                    alt="SVG Badge"
                    imageSrc={getBadgeImageUrl(profile, { ...badgeOptions, imageFormat: 'svg' })}
                  />
                }
                label="SVG"
              />
            </Grid>
            <Grid item xs={12} sm={6} style={{ height: '115px', minWidth: '268px' }}>
              <FormControlLabel
                value="png"
                labelPlacement="bottom"
                style={{ margin: 0, display: 'flex' }}
                control={
                  <ImageRadio
                    {...getBadgeDimensions(badgeOptions.size)}
                    alt="PNG Badge"
                    imageSrc={getBadgeImageUrl(profile, { ...badgeOptions, imageFormat: 'png' })}
                  />
                }
                label="PNG"
              />
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </React.Fragment>
  )
}

interface MiniBadgeProps extends WithStyles<typeof badgeStyles> {
  onClick?: () => void
  children: React.ReactNode
}

export const MiniBadgeButton = withStyles(badgeStyles)(
  ({ children, classes, onClick }: MiniBadgeProps) => (
    <Button className={classes.root} onClick={onClick}>
      {children}
    </Button>
  )
)

export const MiniBadge = withStyles(badgeStyles)(({ children, classes }: MiniBadgeProps) => (
  <Box className={classes.root}>{children}</Box>
))

MiniBadge.defaultProps = { onClick: undefined }

export const Badge: React.FC<BadgeProps> = props => {
  const classes = useStyles({})
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  return (
    <React.Fragment>
      <MiniBadgeButton
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <Typography>
          Badge
          <ContactMailIcon style={{ padding: 4, verticalAlign: 'top' }}>Get badge</ContactMailIcon>
        </Typography>
      </MiniBadgeButton>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Paper className={classes.modalPaper}>
          <Grid container direction="column" spacing={1}>
            <BadgeDisplay {...props} />
            <Grid container item xs={12} justify="center">
              <Button style={{ display: 'flex' }} onClick={() => setIsOpen(false)}>
                <CloseIcon /> Close
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    </React.Fragment>
  )
}
