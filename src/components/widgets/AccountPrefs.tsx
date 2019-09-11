import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  makeStyles,
  Grid,
  Typography
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

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value as EmailNotificationPrefs
    const api = new API(credentials)
    api
      .putClientPrefs({ ...clientPrefs, email_notifications: value })
      .then(prefs => setClientPrefs(prefs))
  }

  if (!clientPrefs) {
    return <Loading />
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h5">Email Preferences</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Email me when I receive new messages</FormLabel>
          <RadioGroup
            aria-label="email notifications"
            name="email-notifications"
            value={clientPrefs.email_notifications}
            onChange={handleEmailChange}
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
