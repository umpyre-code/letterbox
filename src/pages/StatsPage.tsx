import {
  Box,
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
import { BarChart } from '../components/vx/BarChart'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import Loading from '../components/widgets/Loading'
import { API } from '../store/api'
import { AmountByDate, Stats } from '../store/models/stats'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      margin: theme.spacing(1),
      padding: theme.spacing(1)
    },
    container: {
      width: '100%',
      padding: theme.spacing(5),
      backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`
    },
    paper: { padding: theme.spacing(2) }
  })
)

const AboutPage = () => {
  const classes = useStyles({})
  const [stats, setStats] = React.useState<Stats | undefined>(undefined)

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
      <Container className={classes.container}>
        <Container maxWidth="md">
          <Box className={classes.box}>
            <BackToIndexButton />
          </Box>
          <Paper className={classes.paper}>
            <Box className={classes.box}>
              <Typography variant="h1">STATS</Typography>
            </Box>
            {!stats && <Loading />}
            {stats && (
              <>
                <Box className={classes.box}>
                  <Typography variant="h6">Sent per day</Typography>
                  <BarChart height={300} margin={25} data={stats.message_sent_amount} />
                </Box>
                <Box className={classes.box}>
                  <Typography variant="h6">Read per day</Typography>
                  <BarChart height={300} margin={25} data={stats.message_read_amount} />
                </Box>
              </>
            )}
          </Paper>
        </Container>
      </Container>
    </>
  )
}

export default AboutPage
