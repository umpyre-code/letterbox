import { TextField } from '@material-ui/core'
import { OutlinedTextFieldProps, StandardTextFieldProps } from '@material-ui/core/TextField'
import React from 'react'
import NumberFormat from 'react-number-format'

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void
  onChange: (event: { target: { value: string } }) => void
}

function numberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      allowNegative={false}
      decimalScale={0}
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

interface PaymentInputProps {
  inputClicked?: (event: React.MouseEvent<HTMLDivElement>) => void
}

type AllProps = (StandardTextFieldProps | OutlinedTextFieldProps) & PaymentInputProps

export const PaymentInput: React.FC<AllProps> = props => (
  <TextField
    {...props}
    variant="outlined"
    margin="dense"
    InputProps={{
      inputComponent: numberFormatCustom as any,
      onClick: props.inputClicked
    }}
  />
)
