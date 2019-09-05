import { Box, makeStyles, Theme } from '@material-ui/core'
import PersonIcon from '@material-ui/icons/Person'
import { createStyles } from '@material-ui/styles'
import * as React from 'react'
import { API_ENDPOINT } from '../../../store/api'
import { ClientProfileHelper } from '../../../store/client/types'
import { ClientProfile } from '../../../store/models/client'

type AvatarSize = 'tiny' | 'small' | 'medium' | 'large'

interface AvatarProps {
  profile?: ClientProfile
  size?: AvatarSize
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    imgAvatarBox: {
      '& img, picture': {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        textAlign: 'center'
      },
      alignItems: 'center',
      borderRadius: '50%',
      display: 'flex',
      flexShrink: 0,
      fontFamily: theme.typography.fontFamily,
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      userSelect: 'none',
      [theme.breakpoints.down('sm')]: {
        maxWidth: 150,
        maxHeight: 150
      },
      [theme.breakpoints.down('xs')]: {
        maxWidth: 80,
        maxHeight: 80
      }
    },
    textAvatarBox: {
      alignItems: 'center',
      backgroundColor: theme.palette.grey[400],
      borderRadius: '50%',
      color: theme.palette.background.default,
      display: 'flex',
      flexShrink: 0,
      fontFamily: theme.typography.fontFamily,
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      userSelect: 'none',
      '& svg': {
        position: 'absolute',
        width: '150%',
        height: '150%',
        color: theme.palette.grey[500]
      },
      [theme.breakpoints.down('sm')]: {
        maxWidth: 120,
        maxHeight: 120
      },
      [theme.breakpoints.down('xs')]: {
        maxWidth: 50,
        maxHeight: 50
      }
    }
  })
)

function getStyles(size: AvatarSize) {
  if (size === 'tiny') {
    return { width: 32, height: 32, fontSize: '1rem' }
  }
  if (size === 'medium') {
    return { width: 200, height: 200, fontSize: '4rem' }
  }
  if (size === 'large') {
    return { width: 1000, height: 1000, fontSize: '6rem' }
  }
  return { width: 45, height: 45, fontSize: '1.2rem' }
}

interface BoxProps {
  size: AvatarSize
}

const ImageAvatarBox: React.FC<BoxProps> = ({ children, size }) => {
  const classes = useStyles({})
  return (
    <Box className={classes.imgAvatarBox} style={getStyles(size)}>
      {children}
    </Box>
  )
}

const TextAvatarBox: React.FC<BoxProps> = ({ children, size }) => {
  const classes = useStyles({})
  return (
    <Box className={classes.textAvatarBox} style={getStyles(size)}>
      {children}
    </Box>
  )
}

export const ProfileAvatar: React.FC<AvatarProps> = ({ profile, size }) => {
  function getAvatarImgSrc(format: string) {
    return `${API_ENDPOINT}/img/avatar/${profile.client_id}/${size}.${format}?v=${profile.avatar_version}`
  }

  function getInner() {
    if (profile.avatar_version === 0) {
      return (
        <TextAvatarBox size={size}>
          <PersonIcon />
          <div style={{ zIndex: 1 }}>{ClientProfileHelper.FROM(profile).getInitials()}</div>
        </TextAvatarBox>
      )
    }
    return (
      <ImageAvatarBox size={size}>
        <picture>
          <source srcSet={getAvatarImgSrc('webp')} type="image/webp" />
          <source srcSet={getAvatarImgSrc('jpg')} type="image/jpeg" />
          <img alt={profile.full_name} src={getAvatarImgSrc('jpg')} />
        </picture>
      </ImageAvatarBox>
    )
  }

  if (profile) {
    return getInner()
  }
  return <TextAvatarBox size={size}>??</TextAvatarBox>
}

ProfileAvatar.defaultProps = {
  size: 'small'
}
