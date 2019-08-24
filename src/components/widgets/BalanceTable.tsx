import {
  createStyles,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Theme
} from '@material-ui/core'
import React from 'react'
import NumberFormat from 'react-number-format'
import { Balance } from '../../store/models/account'

interface Row {
  name: string
  value: number
}

interface BalanceTableProps {
  rows: Row[]
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    lastTableCell: {
      borderTop: '1px solid rgba(224, 224, 224, 1)'
    },
    table: {},
    tableCell: {
      borderBottom: '0'
    }
  })
)

export const BalanceTable: React.FC<BalanceTableProps> = ({ rows }) => {
  const classes = useStyles({})

  function getCellClass(index: number) {
    if (index < rows.length - 1) {
      return classes.tableCell
    }
    return classes.lastTableCell
  }

  return (
    <Paper>
      <Table className={classes.table} size="small">
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row" classes={{ root: getCellClass(index) }}>
                {row.name}
              </TableCell>
              <TableCell align="right" classes={{ root: getCellClass(index) }}>
                <NumberFormat
                  value={row.value}
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
    </Paper>
  )
}

export function makeRow(name: string, value: number): Row {
  return { name, value }
}

export function makeRowsFromBalance(balance: Balance): Row[] {
  const balanceAmount = balance.balance_cents / 100.0
  const promoAmount = balance.promo_cents / 100.0
  const withdrawableAmount = balance.withdrawable_cents / 100.0
  const totalAmount = (balance.balance_cents + balance.promo_cents) / 100.0
  return [
    makeRow('Current', balanceAmount),
    makeRow('Promo', promoAmount),
    makeRow('Withdrawable', withdrawableAmount),
    makeRow('Total', totalAmount)
  ]
}
