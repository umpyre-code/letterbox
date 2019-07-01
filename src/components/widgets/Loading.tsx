import * as React from 'react'

interface LoadingProps {
  centerOnPage?: boolean
}

const Loading: React.FC<LoadingProps> = ({ centerOnPage }) => {
  let style = {}
  if (centerOnPage) {
    style = {
      left: '50%',
      position: 'absolute',
      top: '50%'
    }
  } else {
    style = {}
  }

  return (
    <div className="lds-heart" style={style}>
      <div></div>
    </div>
  )
}

Loading.defaultProps = {
  centerOnPage: false
}

export default Loading
