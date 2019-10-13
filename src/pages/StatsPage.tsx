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
import { BarChart } from '../components/vx/BarChart'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { Emoji } from '../components/widgets/Emoji'
import Loading from '../components/widgets/Loading'
import { LogotypeLight } from '../components/widgets/LogotypeLight'
import { API } from '../store/api'
import { AmountByDate, Stats } from '../store/models/stats'

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

const LeaderboardLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<Router.LinkProps, 'innerRef' | 'to'>
>((props, ref) => <Router.Link innerRef={ref} to="/leaderboard" {...props} />)

const StatsPage = () => {
  const classes = useStyles({})
  const [stats, setStats] = React.useState<Stats | undefined>(undefined)
  const margin = 35
  const height = 300

  function fillDates(d: AmountByDate[]): AmountByDate[] {
    const toDate = item => new Date(item.year, item.month - 1, item.day)
    const min = _.minBy(d, toDate)
    const max = _.maxBy(d, toDate)
    const daysDiff = Math.floor(
      (toDate(max).getTime() - toDate(min).getTime()) / (3600 * 24 * 1000)
    )
    const values = _.range(daysDiff).map(i => {
      const date = new Date(toDate(min).getTime() + i * 3600 * 24 * 1000)
      return {
        amount_cents: 0,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    })
    const dValues = _.keyBy(d, i => toDate(i).getTime())
    return _.chain(values)
      .keyBy(i => toDate(i).getTime())
      .merge(dValues)
      .values()
      .sortBy(toDate)
      .value()
  }

  function fillStats(s: Stats): Stats {
    return {
      ...s,
      message_read_amount: fillDates(s.message_read_amount),
      message_sent_amount: fillDates(s.message_sent_amount)
    }
  }

  React.useEffect(() => {
    API.GET_STATS().then(s => setStats(fillStats(s)))
  }, [])

  return (
    <>
      <CssBaseline />
      <Box className={classes.rootBox}>
        <br />
        <Router.Link to="/">
          <LogotypeLight responsive={false} />
        </Router.Link>
        <Container className={classes.container}>
          <Container maxWidth="md">
            <Box className={classes.box}>
              <BackToIndexButton />
            </Box>
            <Paper className={classes.paper}>
              <Typography variant="h4" noWrap>
                <Router.Link to="/stats">STATS</Router.Link>
              </Typography>
              {!stats && <Loading />}
              {stats && (
                <>
                  <Box className={classes.box}>
                    <Typography variant="h6">Sent per day</Typography>
                    <BarChart
                      height={height}
                      margin={margin}
                      axisPrefix="$"
                      data={stats.message_sent_amount.map(d => ({
                        ...d,
                        value: Math.abs(d.amount_cents / 100.0)
                      }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="h6">Read per day</Typography>
                    <BarChart
                      height={height}
                      margin={margin}
                      axisPrefix="$"
                      data={stats.message_read_amount.map(d => ({
                        ...d,
                        value: Math.abs(d.amount_cents / 100.0)
                      }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="h6">Total verified clients</Typography>
                    <BarChart
                      height={height}
                      margin={margin}
                      axisPrefix=""
                      data={stats.clients_by_date.map(d => ({ ...d, value: d.count }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography variant="h6">Total paid messages read</Typography>
                    <BarChart
                      height={height}
                      margin={margin}
                      axisPrefix=""
                      data={stats.read_by_date.map(d => ({ ...d, value: d.count }))}
                    />
                  </Box>
                  <Box className={classes.box}>
                    <Typography>
                      <Emoji ariaLabel="clock">⏱</Emoji> last 30 days
                    </Typography>
                  </Box>
                  <Box className={classes.box}>
                    <Button variant="outlined" component={LeaderboardLink}>
                      Check leaderboard
                    </Button>
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

export default StatsPage
