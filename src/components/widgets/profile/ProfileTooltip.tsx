import { Tooltip, withStyles } from '@material-ui/core'
import * as React from 'react'
import { ClientProfile } from '../../../store/models/client'
import { ProfileView } from './ProfileView'

const ProfileTooltipStyled = withStyles(theme => ({
  tooltip: {
    maxWidth: '90vw',
    margin: 0,
    padding: 0,
    boxShadow: theme.shadows[4],
    color: 'rgba(0, 0, 0, 0.87)',
    border: '0px'
  }
}))(Tooltip)

interface ProfileTooltipProps {
  profile: ClientProfile
  children: React.ReactElement
}

export const ProfileTooltip: React.FunctionComponent<ProfileTooltipProps> = ({
  children,
  profile
}) => (
  <ProfileTooltipStyled
    interactive
    title={<ProfileView setIsEditing={() => {}} fullProfile={true} profile={profile} tooltip />}
    enterDelay={750}
    leaveDelay={200}
  >
    {children}
  </ProfileTooltipStyled>
)
