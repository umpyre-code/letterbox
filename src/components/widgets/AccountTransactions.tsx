import {
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
  Typography,
  Button
} from '@material-ui/core'
import _ from 'lodash'
import moment from 'moment'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { API } from '../../store/api'
import { Transaction } from '../../store/models/account'
import { ClientCredentials, ClientProfile } from '../../store/models/client'
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

interface AccountTransactionsProps {
  profile?: ClientProfile
  credentials?: ClientCredentials
}

export const AccountTransactions: React.FC<AccountTransactionsProps> = ({
  profile,
  credentials
}) => {
  const classes = useStyles({})

  const [transactions, setTransactions] = React.useState<Transaction[] | undefined>(undefined)

  React.useEffect(() => {
    async function loadReferrals() {
      const api = new API(credentials)
      const result = await api.getTransactions(15)
      setTransactions(
        _.chain(result)
          .sortBy(tx => tx.created_at.seconds)
          .reverse()
          .value()
      )
    }
    loadReferrals()
  }, [])

  if (!transactions) {
    return <Loading />
  }

  async function downloadTransactions() {
    const api = new API(credentials)
    const result = await api.getTransactions(0)
    const txList = _.map(result, tx => ({
      ...tx,
      created_at: moment(
        new Date(tx.created_at.seconds * 1000 + tx.created_at.nanos / 1e6)
      ).format()
    }))
    const csvContent = 'data:text/csv;charset=utf-8,'
      .concat(
        _.keys(txList[0])
          .join(',')
          .concat('\n')
      )
      .concat(txList.map(tx => _.values(tx).join(',')).join('\n'))

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'umpyre_transactions.csv')
    document.body.appendChild(link)
    link.click()
  }

  function getTransactions() {
    if (transactions && transactions.length === 0) {
      return (
        <Grid item>
          <Typography>
            <em>You don&apos;t have any transactions yet</em> <Emoji ariaLabel="sad face">😟</Emoji>
          </Typography>
        </Grid>
      )
    }
    return (
      <Grid item>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">Reason</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.created_at.seconds * 1000 + tx.created_at.nanos / 1e6}>
                <TableCell component="th" scope="row">
                  {moment(
                    new Date(tx.created_at.seconds * 1000 + tx.created_at.nanos / 1e6)
                  ).format('MMMM Do YYYY, h:mm:ss a')}
                </TableCell>
                <TableCell align="right">{tx.tx_type}</TableCell>
                <TableCell align="right">{tx.tx_reason}</TableCell>
                <TableCell align="right">
                  <NumberFormat
                    value={tx.amount_cents / 100.0}
                    thousandSeparator
                    prefix="$"
                    displayType="text"
                    decimalScale={2}
                    fixedDecimalScale
                  />
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
      <Typography variant="h5">Recent transactions</Typography>
      <Divider />
      <br />
      <Grid container spacing={2}>
        {getTransactions()}
        {transactions && transactions.length > 0 && (
          <Grid item xs={12}>
            <Button variant="outlined" onClick={() => downloadTransactions()}>
              Download full transactions history (CSV)
            </Button>
          </Grid>
        )}
      </Grid>
    </>
  )
}
