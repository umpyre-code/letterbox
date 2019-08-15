import { createStyles, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { ClientProfile } from '../../../store/models/client'
import Loading from '../Loading'
import { ProfileForm } from './ProfileForm'
import { ProfileView } from './ProfileView'
import { Balance } from '../../../store/models/account'

const useStyles = makeStyles((theme: Theme) => createStyles({}))

interface Props {
  balance?: Balance
  editable?: boolean
  fullProfile?: boolean
  menu?: boolean
  profile?: ClientProfile
}

export const Profile: React.FC<Props> = props => {
  const { editable, fullProfile, menu, profile } = props
  const classes = useStyles({})
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
  fullProfile: false,
  menu: false,
  profile: undefined
}
