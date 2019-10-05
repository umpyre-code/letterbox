import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  makeStyles,
  Grid,
  Typography,
  Divider,
  FormGroup,
  Switch
} from '@material-ui/core'
import * as React from 'react'
import {
  ClientCredentials,
  ClientProfile,
  EmailNotificationPrefs,
  ClientPrefs
} from '../../store/models/client'
import { API } from '../../store/api'
import Loading from './Loading'

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1)
  }
}))

interface AccountPrefsProps {
  profile?: ClientProfile
  credentials?: ClientCredentials
}

export const AccountPrefs: React.FC<AccountPrefsProps> = ({ profile, credentials }) => {
  const classes = useStyles({})
  const [clientPrefs, setClientPrefs] = React.useState<ClientPrefs | undefined>(undefined)

  React.useEffect(() => {
    async function loadPrefs() {
      const api = new API(credentials)
      const prefs = await api.getClientPrefs()
      setClientPrefs(prefs)
    }
    loadPrefs()
  }, [])

  function updatePrefs(updatedPrefs: ClientPrefs) {
    const api = new API(credentials)
    api.putClientPrefs(updatedPrefs).then(prefs => setClientPrefs(prefs))
  }

  if (!clientPrefs) {
    return <Loading />
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h5">Preferences</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={clientPrefs.include_in_leaderboard}
                onChange={event =>
                  updatePrefs({ ...clientPrefs, include_in_leaderboard: event.target.checked })
                }
                value="include_in_leaderboard"
              />
            }
            label="Include me in the leaderboard"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Email me when I receive new messages</FormLabel>
          <RadioGroup
            aria-label="email notifications"
            name="email-notifications"
            value={clientPrefs.email_notifications}
            onChange={event => {
              const value = event.target.value as EmailNotificationPrefs
              updatePrefs({ ...clientPrefs, email_notifications: value })
            }}
            row
          >
            <FormControlLabel value="never" control={<Radio />} label="Never" />
            <FormControlLabel value="ral" control={<Radio />} label="At or above my RAL" />
            <FormControlLabel value="always" control={<Radio />} label="Always" />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  )
}
