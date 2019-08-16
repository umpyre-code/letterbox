import { createStyles, List, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store/ApplicationState'
import { DraftsState } from '../../store/drafts/types'
import { DraftListItem } from './DraftListItem'

interface PropsFromState {
  draftsState: DraftsState
}

type AllProps = PropsFromState

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      padding: theme.spacing(0)
    },
    root: {
      padding: theme.spacing(0)
    }
  })
)

const DraftListFC: React.FunctionComponent<AllProps> = ({ draftsState }) => {
  const classes = useStyles({})
  const { drafts } = draftsState

  if (drafts.length > 0) {
    return (
      <List className={classes.list}>
        {drafts.map(draft => (
          <DraftListItem draft={draft} key={draft.id!} />
        ))}
      </List>
    )
  }
  return null
}

const mapStateToProps = ({ draftsState }: ApplicationState) => ({
  draftsState
})

export const DraftList = connect(mapStateToProps)(DraftListFC)
