import { createStyles, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { Balance, ClientProfile } from '../../../store/models/client'
import Loading from '../Loading'
import { ProfileForm } from './ProfileForm'
import { ProfileView } from './ProfileView'

const useStyles = makeStyles((theme: Theme) => createStyles({}))

interface Props {
  balance?: Balance
  editable?: boolean
  full?: boolean
  menu?: boolean
  profile?: ClientProfile
}

export const Profile: React.FC<Props> = props => {
  const { editable, full, menu, profile } = props
  const classes = useStyles()
  const [isEditing, setIsEditing] = React.useState<boolean>(false)

  if (profile) {
    if (isEditing) {
      return <ProfileForm {...props} setIsEditing={setIsEditing} />
    } else {
      return <ProfileView {...props} setIsEditing={setIsEditing} />
    }
  } else {
    return <Loading />
  }
}

Profile.defaultProps = {
  balance: undefined,
  editable: false,
  full: false,
  menu: false,
  profile: undefined
}
