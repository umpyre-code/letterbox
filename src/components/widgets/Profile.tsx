import { Avatar, Card, CardHeader } from '@material-ui/core'
import * as React from 'react'
import { ClientProfile, ClientProfileHelper } from '../../store/client/types'
import Loading from './Loading'

interface Props {
  clientProfile?: ClientProfile
}

export const Profile: React.FC<Props> = ({ clientProfile }) => {
  function getCardHeader() {
    if (clientProfile) {
      const clientProfileHelper = ClientProfileHelper.FROM(clientProfile)
      return (
        <CardHeader
          avatar={<Avatar>{clientProfileHelper.getInitials()}</Avatar>}
          title={clientProfile.full_name}
          subheader={clientProfile.client_id}
        />
      )
    } else {
      return <Loading />
    }
  }

  return <Card>{getCardHeader()}</Card>
}
