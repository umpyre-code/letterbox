import { createStyles, makeStyles } from '@material-ui/styles'
import * as React from 'react'

const useStyles = makeStyles(() =>
  createStyles({
    emoji: {
      fontSize: '1.5rem'
    }
  })
)

interface Props {
  ariaLabel: string
  children: React.ReactNode
}

export const Emoji: React.FC<Props> = props => {
  const classes = useStyles({})
  return (
    <span role="img" className={classes.emoji} aria-label={props.ariaLabel}>
      {props.children}
    </span>
  )
}
