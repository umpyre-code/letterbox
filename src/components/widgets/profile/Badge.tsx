import {
  Box,
  Button,
  createStyles,
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  makeStyles,
  Paper,
  Popper,
  Radio,
  RadioGroup,
  Theme,
  Typography,
  TextField
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ContactMailIcon from '@material-ui/icons/ContactMail'
import qs from 'qs'
import * as React from 'react'
import { API_ENDPOINT, PUBLIC_URL } from '../../../store/api'
import { ClientProfile } from '../../../store/models/client'
import { CopyIcon } from '../CopyIcon'
import { Emoji } from '../Emoji'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    badgeButton: {
      backgroundColor: '#ccccff',
      borderRadius: '5px',
      cursor: 'pointer',
      display: 'inline-block',
      padding: theme.spacing(1),
      verticalAlign: 'middle',
      textTransform: 'none'
    },
    copyBox: {},
    badgeBox: {
      backgroundColor: '#eeeeee',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      borderRadius: '5px',
      maxWidth: '500px',
      overflow: 'auto'
    },
    root: {
      position: 'relative'
    },
    popperPaper: {
      padding: theme.spacing(1)
    },
    formControl: {},
    group: {}
  })
)

interface BadgeProps {
  profile?: ClientProfile
}

function getBadgeSvgUrl(profile: ClientProfile, name: string, size: string) {
  let width = 200
  let height = 80
  if (size === 'small') {
    width = Math.round(width * 0.7)
    height = Math.round(height * 0.7)
  } else if (size === 'large') {
    width = Math.round(width * 1.3)
    height = Math.round(height * 1.3)
  }

  const querystring = qs.stringify({
    width,
    height,
    name
  })

  return `${API_ENDPOINT}/badge/${profile.client_id}/badge.svg?${querystring}`
}

function renderBadge(profile: ClientProfile, name: string, size: string, format: string): string {
  const svgUrl = getBadgeSvgUrl(profile, name, size)
  const profileUrl = `${PUBLIC_URL}/u/${profile.client_id}`
  if (format === 'markdown') {
    return `[![Contact ${name}](${svgUrl})](${profileUrl})`
  }
  if (format === 'html') {
    return `<a href="${profileUrl}"><img src="${svgUrl}" alt="Contact ${name}" /></a>`
  }
  return 'something went wrong! D:'
}

export const BadgeDisplay: React.FC<BadgeProps> = ({ profile }) => {
  const classes = useStyles({})
  const [sizeValue, setSizeValue] = React.useState<string>('medium')
  const [formatValue, setFormatValue] = React.useState<string>('markdown')
  const [nameValue, setNameValue] = React.useState<string>(profile.full_name)
  const [copied, setCopied] = React.useState<boolean>(false)
  const badge = renderBadge(profile, nameValue, sizeValue, formatValue)
  return (
    <React.Fragment>
      <Grid item container>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Size</FormLabel>
          <RadioGroup
            aria-label="badge size"
            name="size1"
            className={classes.group}
            value={sizeValue}
            onChange={event => {
              setSizeValue(event.target.value)
            }}
            row
          >
            <FormControlLabel value="small" control={<Radio />} label="Small" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="large" control={<Radio />} label="Large" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item container>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Format</FormLabel>
          <RadioGroup
            aria-label="badge format"
            name="format1"
            className={classes.group}
            value={formatValue}
            onChange={event => {
              setFormatValue(event.target.value)
            }}
            row
          >
            <FormControlLabel value="markdown" control={<Radio />} label="Markdown" />
            <FormControlLabel value="html" control={<Radio />} label="HTML" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item container>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Display name</FormLabel>
          <TextField
            value={nameValue}
            onChange={event => {
              setNameValue(event.target.value)
            }}
          />
        </FormControl>
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
            Copy to clipboard
            {copied && (
              <React.Fragment>
                &nbsp;<Emoji ariaLabel="copied">✔️</Emoji>
              </React.Fragment>
            )}
          </Button>
        </Box>
      </Grid>
      <Grid item>
        <Box className={classes.badgeBox}>
          <pre>{badge}</pre>
        </Box>
      </Grid>
      <Grid item xs>
        <Typography variant="subtitle1">Preview</Typography>
        <img alt="Badge" src={getBadgeSvgUrl(profile, nameValue, sizeValue)} />
      </Grid>
    </React.Fragment>
  )
}

export const Badge: React.FC<BadgeProps> = props => {
  const classes = useStyles({})
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>(null)
  return (
    <React.Fragment>
      <Button
        className={classes.badgeButton}
        onClick={event => {
          setAnchorEl(event.currentTarget)
          setIsOpen(!isOpen)
        }}
      >
        <Typography>
          Badge
          <ContactMailIcon style={{ padding: 4, verticalAlign: 'top' }}>Get badge</ContactMailIcon>
        </Typography>
      </Button>
      <Popper id="badge-popper" open={isOpen} anchorEl={anchorEl} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={100}>
            <Paper className={classes.popperPaper}>
              <Grid container direction="column" spacing={1}>
                <BadgeDisplay {...props} />
                <Grid item xs={12}>
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                    }}
                  >
                    <CloseIcon /> Close
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  )
}
