import {
  Box,
  Button,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import _ from 'lodash'
import moment from 'moment'
import * as React from 'react'
import * as Router from 'react-router-dom'
import { API, PUBLIC_URL } from '../../store/api'
import { ClientCredentials, ClientProfile } from '../../store/models/client'
import { CopyIcon } from './CopyIcon'
import { Emoji } from './Emoji'
import Loading from './Loading'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    urlBox: {
      background: theme.palette.grey[100],
      padding: theme.spacing(2),
      borderRadius: 6
    }
  })
)

interface AccountReferralsProps {
  profile?: ClientProfile
  credentials?: ClientCredentials
}

export const AccountReferrals: React.FC<AccountReferralsProps> = ({ profile, credentials }) => {
  const classes = useStyles({})

  const [referrals, setReferrals] = React.useState<ClientProfile[] | undefined>(undefined)

  React.useEffect(() => {
    async function loadReferrals() {
      const api = new API(credentials)
      const result = await api.getReferrals()
      setReferrals(
        _.chain(result)
          .sortBy('joined')
          .reverse()
          .value()
      )
    }
    loadReferrals()
  }, [])

  function getRefLink(): string {
    return `${PUBLIC_URL}/signup/?r=${profile.client_id}`
  }

  if (!referrals) {
    return <Loading />
  }

  function getReferrals() {
    if (referrals && referrals.length === 0) {
      return (
        <Grid item>
          <Typography>
            <em>You don&apos;t have any referrals yet</em> <Emoji ariaLabel="sad face">😟</Emoji>
          </Typography>
        </Grid>
      )
    }
    return (
      <Grid item>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Handle</TableCell>
              <TableCell align="right">Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrals.map(ref => (
              <TableRow key={ref.client_id}>
                <TableCell component="th" scope="row">
                  <Router.Link to={`/u/${ref.client_id}`}>{ref.full_name}</Router.Link>
                </TableCell>
                <TableCell align="right">
                  {ref.handle && <Router.Link to={`/c/${ref.client_id}`}>{ref.handle}</Router.Link>}
                  {!ref.handle && <em>none</em>}
                </TableCell>
                <TableCell align="right">
                  {moment.unix(ref.joined).format('MMMM Do YYYY, h:mm:ss a')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    )
  }

  return (
    <>
      <Typography variant="h5">Referrals</Typography>
      <Divider />
      <br />
      <Typography>
        For each person you invite, we&apos;ll give you a $20 account credit. Share your signup
        reflink to get started:
      </Typography>
      <br />
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Box className={classes.urlBox}>
            <Typography variant="h5">{getRefLink()}</Typography>
          </Box>
        </Grid>
        <Grid item>
          {(navigator as any).share && (
            <Box>
              <Button
                onClick={() => {
                  const nav = navigator as any
                  nav.share({
                    title: 'Sign up for Umpyre',
                    text: 'Join Umpyre today — it rocks!',
                    url: getRefLink()
                  })
                }}
              >
                <ShareIcon />
                Share
              </Button>
            </Box>
          )}
          {!(navigator as any).share && (
            <Box>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(getRefLink())
                }}
              >
                <CopyIcon>copy</CopyIcon>
                Copy
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5">Your referrals</Typography>
          <Divider />
        </Grid>
        {getReferrals()}
      </Grid>
    </>
  )
}
