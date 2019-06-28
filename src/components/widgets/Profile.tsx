import { Avatar, Card, CardHeader, IconButton } from '@material-ui/core'
import { classes } from 'istanbul-lib-coverage'
import * as React from 'react'
import { ClientProfile, ClientProfileHelper } from '../../store/client/types'

interface Props {
  clientProfile: ClientProfile
}

export const Profile: React.FC<Props> = ({ clientProfile }) => {
  const clientProfileHelper = ClientProfileHelper.FROM(clientProfile)

  return (
    <Card>
      {' '}
      <CardHeader
        avatar={<Avatar>{clientProfileHelper.getInitials()}</Avatar>}
        title={clientProfile.full_name}
        subheader={clientProfile.client_id}
      />
    </Card>
  )
}
