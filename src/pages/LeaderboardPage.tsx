import {
  Box,
  Button,
  Container,
  createStyles,
  CssBaseline,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import _ from 'lodash'
import * as React from 'react'
import * as Router from 'react-router-dom'
import { HorizontalBarChart } from '../components/vx/HorizontalBarChart'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { Emoji } from '../components/widgets/Emoji'
import Loading from '../components/widgets/Loading'
import { API } from '../store/api'
import { AmountByClient, Stats } from '../store/models/stats'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootBox: {
      backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
      minHeight: '100vh'
    },
    box: {
      margin: 0,
      padding: theme.spacing(1)
    },
    container: {
      width: '100%',
      padding: theme.spacing(1)
    },
    paper: { padding: theme.spacing(2) }
  })
)

const StatsLink = React.forwardRef<HTMLAnchorElement, Omit<Router.LinkProps, 'innerRef' | 'to'>>(
  (props, ref) => <Router.Link innerRef={ref} to="/stats" {...props} />
)

async function fetchProfiles(data: AmountByClient[]): Promise<AmountByClient[]> {
  return Promise.all(
    data.map(async d => {
      try {
        const profile = await API.FETCH_CLIENT_PUBLIC(d.client_id)
        return { ...d, profile }
      } catch (error) {
        console.error(error)
      }
      return d
    })
  )
}

const LeaderboardPage = () => {
  const classes = useStyles({})
  const [stats, setStats] = React.useState<Stats | undefined>(undefined)
  const margin = 35
  const height = 320

  React.useEffect(() => {
    async function fetchStats() {
      const s = await API.GET_STATS()
      const wellRead = await fetchProfiles(s.most_well_read)
      const generous = await fetchProfiles(s.most_generous)
      const clientsByRal = await fetchProfiles(s.clients_by_ral)
      setStats({
        ...s,
        most_well_read: _.filter(wellRead, 'profile'),
        most_generous: _.filter(generous, 'profile'),
        clients_by_ral: _.filter(clientsByRal, 'profile')
      })
    }
    fetchStats()
  }, [])
  return (
    <>
      <CssBaseline />
      <Box className={classes.rootBox}>
        <Container className={classes.container}>
          <Container maxWidth="md">
            <Box className={classes.box}>
              <BackToIndexButton />
            </Box>
            <Paper className={classes.paper}>
              <Box className={classes.box}>
                <Typography variant="h4" noWrap>
                  <Router.Link to="/leaderboard">LEADERBOARD</Router.Link>
                </Typography>
              </Box>

              {!stats && <Loading />}
              {stats && (
                <>
                  <Box className={classes.box}>
                    <Typography variant="h6">Most valued</Typography>
                    <HorizontalBarChart
                      height={height}
                      margin={margin}
                      axisPrefix="$"
                      data={stats.clients_by_ral.slice(0, 5).map((d, index) => ({
                        ...d,
                        index,
                        amount_cents: Math.abs(d.amount_cents)
                      }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="h6">Most well read</Typography>
                    <HorizontalBarChart
                      height={height}
                      margin={margin}
                      axisPrefix="$"
                      data={stats.most_well_read.slice(0, 5).map((d, index) => ({
                        ...d,
                        index,
                        amount_cents: Math.abs(d.amount_cents)
                      }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="h6">Most generous</Typography>
                    <HorizontalBarChart
                      height={height}
                      margin={margin}
                      axisPrefix="$"
                      data={stats.most_generous.slice(0, 5).map((d, index) => ({
                        ...d,
                        index,
                        amount_cents: Math.abs(d.amount_cents)
                      }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography>
                      <Emoji ariaLabel="clock">⏱</Emoji> last 30 days
                    </Typography>
                  </Box>
                  <Box className={classes.box}>
                    <Button component={StatsLink}>Check stats</Button>
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="body2">
                      <Router.Link to="/account">
                        <em>You can opt out of the leaderboard by changing your preferences.</em>
                      </Router.Link>
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Container>
        </Container>
      </Box>
    </>
  )
}

export default LeaderboardPage
