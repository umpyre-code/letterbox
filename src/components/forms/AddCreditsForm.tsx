import {
  Container,
  createStyles,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
  Theme,
  Typography
} from '@material-ui/core'
import React from 'react'
import { Balance } from '../../store/models/account'
import { BalanceTable, makeRow, makeRowsFromBalance } from '../widgets/BalanceTable'
import { PaymentInput } from '../widgets/PaymentInput'
import { CardSectionForm } from './CardSectionForm'

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
    gridContainer: { padding: theme.spacing(3, 0, 3, 0) }
  })
)

interface RadioButtonsProps {
  setCreditAmount: (arg0: number) => void
  initialAmount?: number
}

const RadioButtons: React.FC<RadioButtonsProps> = ({ initialAmount, setCreditAmount }) => {
  const [radioValue, setRadioValue] = React.useState(initialAmount > 0 ? 'custom' : '20')
  const [customAmountValue, setCustomAmountValue] = React.useState(
    initialAmount > 0 ? initialAmount : 0
  )
  const classes = useStyles({})
  const customAmountRef = React.createRef<HTMLInputElement>()

  function handleRadioChange(event: React.ChangeEvent<unknown>) {
    const { value } = event.target as HTMLInputElement
    setRadioValue(value)
    if (value !== 'custom') {
      setCreditAmount(parseInt(value, 10))
    } else {
      setCreditAmount(customAmountValue)
    }
  }

  function customAmountChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setRadioValue('custom')
    const value = parseInt((event.target as HTMLInputElement).value, 10)
    if (!Number.isNaN(value)) {
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

  function customAmountInputClicked() {
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
            <PaymentInput
              inputRef={customAmountRef}
              label="Custom amount"
              inputProps={{ 'aria-label': 'custom' }}
              onChange={customAmountChanged}
              className={classes.customTextField}
              defaultValue={initialAmount > 0 ? initialAmount : undefined}
              variant="outlined"
              margin="dense"
              style={{ width: 150 }}
              inputClicked={customAmountInputClicked}
            />
          </Grid>
        </Grid>
      </RadioGroup>
    </FormControl>
  )
}

interface AddCreditsFormProps {
  balance: Balance
  amountCents?: number
}

function calculateStripeFee(amount: number) {
  const amountCents = amount * 100
  const fixedFee = 30
  const percentFee = 0.029
  return Math.round((amountCents + fixedFee) / (1 - percentFee))
}

const AddCreditsForm: React.FC<AddCreditsFormProps> = ({ amountCents, balance }) => {
  const [creditAmount, setCreditAmount] = React.useState(amountCents > 0 ? amountCents / 100 : 20)
  const classes = useStyles({})

  const newBalance = creditAmount + (balance.balance_cents + balance.promo_cents) / 100
  const stripeFee = calculateStripeFee(creditAmount) / 100 - creditAmount
  const chargeAmount = stripeFee + creditAmount
  const currentRows = makeRowsFromBalance(balance)
  const updatedRows = [
    makeRow('Additional credits', creditAmount),
    makeRow('Card fee', stripeFee),
    makeRow('Balance after charge', newBalance),
    makeRow('Charge total', chargeAmount)
  ]

  return (
    <>
      <Container className={classes.contentContainer}>
        <Typography variant="h6">Current balance</Typography>
      </Container>
      <BalanceTable rows={currentRows} />
      <Container className={classes.contentContainer}>
        <Typography variant="h6">Payment</Typography>
      </Container>
      <RadioButtons setCreditAmount={setCreditAmount} initialAmount={amountCents / 100} />
      <BalanceTable rows={updatedRows} />
      <Container className={classes.contentContainer}>
        <CardSectionForm chargeAmount={chargeAmount} />
      </Container>
    </>
  )
}

export default AddCreditsForm
