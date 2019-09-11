import * as React from 'react'
import { ReactComponent as SvgLogotype } from './logotype.svg'
import { ReactComponent as SvgLogomark } from './logomark.svg'

export function Logotype() {
  if (window.innerWidth > 500) {
    return (
      <div
        style={{
          position: 'relative',
          height: '60px',
          minWidth: '200px'
        }}
      >
        <SvgLogotype
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
        />
      </div>
    )
  }
  return (
    <div
      style={{
        position: 'relative',
        height: '60px',
        width: '60px'
      }}
    >
      <SvgLogomark
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
