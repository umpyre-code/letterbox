import * as React from 'react'
import styled from '../../utils/styled'
import 'typeface-space-mono'

export default () => (
  <LoadingWrapper>
    <h1>loading it up 😎</h1>
  </LoadingWrapper>
)

const LoadingWrapper = styled('div')`
  font-family: 'Space Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-weight: 400;
`
