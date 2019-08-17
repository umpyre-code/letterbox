import * as React from 'react'
import { Balance } from '../../../store/models/account'
import { ClientProfile } from '../../../store/models/client'
import Loading from '../Loading'
import { ProfileForm } from './ProfileForm'
import { ProfileView } from './ProfileView'

interface Props {
  balance?: Balance
  editable?: boolean
  fullProfile?: boolean
  menu?: boolean
  profile?: ClientProfile
}

export const Profile: React.FC<Props> = props => {
  const { profile } = props
  const [isEditing, setIsEditing] = React.useState<boolean>(false)

  if (profile) {
    if (isEditing) {
      return <ProfileForm {...props} setIsEditing={setIsEditing} />
    }
    return <ProfileView {...props} setIsEditing={setIsEditing} />
  }
  return <Loading />
}

Profile.defaultProps = {
  balance: undefined,
  editable: false,
  fullProfile: false,
  menu: false,
  profile: undefined
}
