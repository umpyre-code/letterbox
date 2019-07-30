import { Theme } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/styles'
import * as React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    emoji: {
      fontSize: '1.3rem'
    }
  })
)

export const Emoji: React.FC = props => {
  const classes = useStyles()
  return <span className={classes.emoji}>{props.children}</span>
}
