import { Box, makeStyles, Theme } from '@material-ui/core'
import PersonIcon from '@material-ui/icons/Person'
import { createStyles } from '@material-ui/styles'
import * as React from 'react'
import { ClientProfileHelper, getAvatarImgSrc } from '../../../store/client/types'
import { MicroClientProfile } from '../../../store/models/client'

type AvatarSize = 'tiny' | 'small' | 'medium' | 'large'

interface AvatarProps {
  profile?: MicroClientProfile
  size?: AvatarSize
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    imgAvatarBox: {
      '& img, picture': {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'block'
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
      '& svg text': {
        fill: theme.palette.background.default,
        fontFamily: theme.typography.fontFamily
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
    return { width: 32, height: 32 }
  }
  if (size === 'medium') {
    return { width: 200, height: 200 }
  }
  if (size === 'large') {
    return { width: 1000, height: 1000 }
  }
  return { width: 45, height: 45 }
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
  function getInner() {
    if (profile.avatar_version === 0) {
      return (
        <TextAvatarBox size={size}>
          <PersonIcon />
          <svg viewBox="0 0 30 30" style={{ zIndex: 1, width: '100%' }}>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              alignmentBaseline="middle"
            >
              {ClientProfileHelper.FROM(profile).getInitials()}
            </text>
          </svg>
        </TextAvatarBox>
      )
    }
    return (
      <ImageAvatarBox size={size}>
        <picture>
          <source srcSet={getAvatarImgSrc(profile, size, 'webp')} type="image/webp" />
          <source srcSet={getAvatarImgSrc(profile, size, 'jpg')} type="image/jpeg" />
          <img alt={profile.full_name} src={getAvatarImgSrc(profile, size, 'jpg')} />
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
