import {
  Button,
  Container,
  createStyles,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Theme,
  Typography
} from '@material-ui/core'
import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import { CardElement, injectStripe } from 'react-stripe-elements'
import { Balance } from '../store/models/client'
import './stripe.css'

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void
  onChange: (event: { target: { value: string } }) => void
}

function numberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value
          }
        })
      }}
      thousandSeparator
      prefix="$"
    />
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    contentContainer: { padding: theme.spacing(4, 0, 0, 0) },
    customAmount: {
      margin: 0
    },
    customAmountLabel: {
      display: 'none'
    },
    customTextField: {},
    gridContainer: { padding: theme.spacing(3, 0, 3, 0) },
    lastTableCell: {
      borderTop: '1px solid rgba(224, 224, 224, 1)'
    },
    table: {},
    tableCell: {
      borderBottom: '0'
    }
  })
)

interface RadioButtonsProps {
  setCreditAmount: (arg0: number) => void
}

const RadioButtons: React.FC<RadioButtonsProps> = ({ setCreditAmount }) => {
  const [radioValue, setRadioValue] = React.useState('20')
  const [customAmountValue, setCustomAmountValue] = React.useState(0)
  const classes = useStyles()
  const customAmountRef = React.createRef()

  function handleRadioChange(event: React.ChangeEvent<unknown>) {
    const value = (event.target as HTMLInputElement).value
    setRadioValue(value)
    if (value !== 'custom') {
      setCreditAmount(parseInt(value, 10))
    }
  }

  function customAmountChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setRadioValue('custom')
    const value = parseInt((event.target as HTMLInputElement).value, 10)
    if (!isNaN(value)) {
      setCreditAmount(value)
      setCustomAmountValue(value)
    } else {
      setCreditAmount(0)
      setCustomAmountValue(0)
    }
  }

  function customRadioClicked() {
    customAmountRef.current.focus()
  }

  function customAmountInputClicked(event: React.ChangeEvent<HTMLDivElement>) {
    setRadioValue('custom')
    setCreditAmount(customAmountValue)
  }

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Credit amount</FormLabel>
      <RadioGroup
        aria-label="addCreditsAmount"
        name="addCreditsAmount"
        onChange={handleRadioChange}
        value={radioValue}
      >
        <Grid container justify="center" alignItems="center">
          <Grid item>
            <FormControlLabel value="20" label="$20" control={<Radio />} />
          </Grid>
          <Grid item>
            <FormControlLabel value="50" label="$50" control={<Radio />} />
          </Grid>
          <Grid item>
            <FormControlLabel value="100" label="$100" control={<Radio />} />
          </Grid>
          <Grid item>
            <FormControlLabel
              value="custom"
              label=""
              control={<Radio />}
              classes={{ label: classes.customAmountLabel }}
              className={classes.customAmount}
              onClick={customRadioClicked}
            />
          </Grid>
          <Grid item>
            <TextField
              inputRef={customAmountRef}
              label="Custom amount"
              inputProps={{ 'aria-label': 'custom' }}
              onChange={customAmountChanged}
              className={classes.customTextField}
              variant="outlined"
              margin="dense"
              style={{ width: 150 }}
              InputProps={{
                inputComponent: numberFormatCustom as any,
                onClick: customAmountInputClicked
              }}
            />
          </Grid>
        </Grid>
      </RadioGroup>
    </FormControl>
  )
}
interface CardSectionProps {
  chargeAmount: number
  stripe?: any
}

class CardSection extends Component<CardSectionProps> {
  constructor(props: CardSectionProps) {
    super(props)
    this.submit = this.submit.bind(this)
    this.onCardElementChanged = this.onCardElementChanged.bind(this)
    this.buttonDisabled = this.buttonDisabled.bind(this)

    this.state = { error: undefined }
  }

  public async submit(ev) {
    const { token } = await this.props.stripe.createToken({ name: 'Name' })
  }

  public onCardElementChanged(changes: any) {
    const { error } = changes
    this.setState({ ...this.state, error })
  }

  public buttonDisabled(): boolean {
    return this.props.chargeAmount < 1 || this.state.error !== undefined
  }

  public render() {
    return (
      <Grid container justify="center" alignItems="flex-end">
        <Grid item xs>
          <FormLabel>
            Credit or debit card
            <CardElement onChange={this.onCardElementChanged} />
          </FormLabel>
        </Grid>
        <Grid item>
          <Button
            disabled={this.buttonDisabled()}
            variant="contained"
            color="primary"
            onClick={this.submit}
            style={{ height: '40px', margin: '0px 0px 0px 6px', padding: '6px 12px' }}
          >
            <NumberFormat
              value={this.props.chargeAmount}
              thousandSeparator
              decimalScale={2}
              fixedDecimalScale={true}
              prefix="Charge $"
              displayType="text"
            />
          </Button>
        </Grid>
        {this.state.error && (
          <Grid xs={12}>
            <Typography>{this.state.error.message}</Typography>
          </Grid>
        )}
      </Grid>
    )
  }
}
const CardSectionForm = injectStripe(CardSection)

interface AddCreditsFormProps {
  balance: Balance
}

function calculateStripeFee(amount: number) {
  const amountCents = amount * 100
  const fixedFee = 30
  const percentFee = 0.029
  return Math.round((amountCents + fixedFee) / (1 - percentFee))
}

interface Row {
  name: string
  value: number
}

interface BalanceTableProps {
  rows: Row[]
}

const BalanceTable: React.FC<BalanceTableProps> = ({ rows }) => {
  const classes = useStyles()
  function getCellClass(index) {
    if (index < rows.length - 1) {
      return classes.tableCell
    } else {
      return classes.lastTableCell
    }
  }
  return (
    <Paper>
      <Table className={classes.table} size="small">
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
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
                  fixedDecimalScale={true}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

function makeRow(name: string, value: number): Row {
  return { name, value }
}

const AddCreditsForm: React.FC<AddCreditsFormProps> = ({ balance }) => {
  const [creditAmount, setCreditAmount] = React.useState(20)
  const classes = useStyles()

  const balanceAmount = balance.balance_cents / 100.0
  const promoAmount = balance.promo_cents / 100.0
  const totalAmount = (balance.balance_cents + balance.promo_cents) / 100.0
  const newBalance = creditAmount + (balance.balance_cents + balance.promo_cents) / 100.0
  const stripeFee = calculateStripeFee(creditAmount) / 100 - creditAmount
  const chargeAmount = stripeFee + creditAmount
  const currentRows = [
    makeRow('Current', balanceAmount),
    makeRow('Promo', promoAmount),
    makeRow('Total', totalAmount)
  ]
  const updatedRows = [
    makeRow('Additional credits', creditAmount),
    makeRow('Card fee', stripeFee),
    makeRow('Charge total', chargeAmount),
    makeRow('Balance after charge', newBalance)
  ]

  return (
    <React.Fragment>
      <Container className={classes.contentContainer}>
        <Typography variant="h6">Current balance</Typography>
      </Container>
      <BalanceTable rows={currentRows} />
      <Container className={classes.contentContainer}>
        <Typography variant="h6">Payment</Typography>
      </Container>
      <RadioButtons setCreditAmount={setCreditAmount} />
      <BalanceTable rows={updatedRows} />
      <Container className={classes.contentContainer}>
        <CardSectionForm chargeAmount={chargeAmount} />
      </Container>
    </React.Fragment>
  )
}

export default AddCreditsForm
