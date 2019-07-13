import { Avatar, Card, CardHeader } from '@material-ui/core'
import * as React from 'react'
import { ClientProfileHelper } from '../../store/client/types'
import { ClientProfile } from '../../store/models/client'
import Loading from './Loading'

interface Props {
  profile?: ClientProfile
}

export const Profile: React.FC<Props> = ({ profile }) => {
  function getCardHeader() {
    if (profile) {
      const clientProfileHelper = ClientProfileHelper.FROM(profile)
      return (
        <CardHeader
          avatar={
            <Avatar alt={clientProfileHelper.full_name}>{clientProfileHelper.getInitials()}</Avatar>
          }
          title={profile.full_name}
          subheader={profile.client_id}
        />
      )
    } else {
      return <Loading />
    }
  }

  return <Card>{getCardHeader()}</Card>
}
