import { createStyles, makeStyles, Theme, Avatar, Box } from '@material-ui/core'
import * as React from 'react'
import { API_ENDPOINT } from '../../../store/api'
import { ClientProfile } from '../../../store/models/client'
import { ClientProfileHelper } from '../../../store/client/types'

type AvatarSize = 'tiny' | 'small' | 'medium' | 'large'

interface AvatarProps {
  profile?: ClientProfile
  size?: AvatarSize
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatarBox: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.pxToRem(20),
      borderRadius: '50%',
      overflow: 'hidden',
      userSelect: 'none',
      // color: theme.palette.background.default,
      // backgroundColor: theme.palette.grey[400],
      '& img, picture': {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        textAlign: 'center'
      }
    }
  })
)

export const ProfileAvatar: React.FC<AvatarProps> = ({ profile, size }) => {
  const classes = useStyles({})

  function getAvatarImgSrc(format: string) {
    return `${API_ENDPOINT}/img/avatar/${profile.client_id}/${size}.${format}?v=${profile.avatar_version}`
  }

  function getWidth() {
    if (size === 'tiny') {
      return 32
    }
    if (size === 'small') {
      return 45
    }
    if (size === 'medium') {
      return 200
    }
    if (size === 'large') {
      return 1000
    }
    return 45
  }

  function getHeight() {
    return getWidth()
  }

  function getInner() {
    if (profile.avatar_version === 0) {
      return ClientProfileHelper.FROM(profile).getInitials()
    }
    return (
      <picture>
        <source srcSet={getAvatarImgSrc('webp')} type="image/webp" />
        <source srcSet={getAvatarImgSrc('jpg')} type="image/jpeg" />
        <img alt={profile.full_name} src={getAvatarImgSrc('jpg')} />
      </picture>
    )
  }

  if (profile) {
    return (
      <React.Fragment>
        <Box className={classes.avatarBox} style={{ width: getWidth(), height: getHeight() }}>
          {getInner()}
        </Box>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <Box className={classes.avatarBox} style={{ width: getWidth(), height: getHeight() }}>
        ??
      </Box>
    </React.Fragment>
  )
}

ProfileAvatar.defaultProps = {
  size: 'small'
}
