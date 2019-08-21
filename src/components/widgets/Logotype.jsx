import * as React from 'react'
import { ReactComponent as Logo } from './logotype.svg'

export function Logotype() {
  return (
    <div
      style={{
        position: 'relative',
        height: '60px'
      }}
    >
      <Logo style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} />
    </div>
  )
}
