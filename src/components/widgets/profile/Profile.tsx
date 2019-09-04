import * as React from 'react'
import { Balance } from '../../../store/models/account'
import { ClientProfile, ClientCredentials } from '../../../store/models/client'
import Loading from '../Loading'
import { ProfileForm } from './ProfileForm'
import { ProfileView } from './ProfileView'

interface Props {
  avatarChanged?: () => void
  balance?: Balance
  credentials?: ClientCredentials
  editable?: boolean
  fullProfile?: boolean
  menu?: boolean
  profile?: ClientProfile
}

export const Profile: React.FC<Props> = props => {
  const { avatarChanged, profile } = props
  const [isEditing, setIsEditing] = React.useState<boolean>(false)

  if (profile) {
    if (isEditing) {
      return <ProfileForm {...props} setIsEditing={setIsEditing} />
    }
    return <ProfileView {...props} setIsEditing={setIsEditing} avatarChanged={avatarChanged} />
  }
  return <Loading />
}

Profile.defaultProps = {
  balance: undefined,
  credentials: undefined,
  editable: false,
  fullProfile: false,
  menu: false,
  profile: undefined
}
