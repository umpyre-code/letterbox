import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import * as React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    progress: {
      margin: theme.spacing(2)
    }
  })
)

const Loading = () => {
  const classes = useStyles()
  return <CircularProgress className={classes.progress} />
}

export default Loading
