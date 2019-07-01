import { createStyles, ListItem, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { Draft } from '../../store/drafts/types'
import Loading from '../widgets/Loading'

interface Props {
  draft: Draft
}

type AllProps = Props

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inline: {
      display: 'inline'
    },
    listItem: {
      padding: theme.spacing(1, 0)
    }
  })
)

const LazyComposeForm = React.lazy(() => import('./compose/ComposeForm'))

export const DraftListItem: React.FunctionComponent<AllProps> = ({ draft }) => {
  const classes = useStyles()

  return (
    <ListItem className={classes.listItem}>
      <React.Suspense fallback={<Loading />}>
        <LazyComposeForm draft={draft} />
      </React.Suspense>
    </ListItem>
  )
}
