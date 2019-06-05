import * as React from 'react'
import styled from '../utils/styled'

export default () => (
  <PageContent>
    <h1>Welcome!</h1>
    <p>
      Welcome to the Redux 4 + TypeScript 2.9 example! This example site shows you the ideal project
      structure, recommended libraries, as well as design pattern on writing type-safe React + Redux
      app with TypeScript.
    </p>
    <p>
      This project is intended as a supplement to{' '}
      <a
        href="https://resir014.xyz/posts/2018/07/06/redux-4-plus-typescript/"
        target="blank"
        rel="noopener noreferrer"
      >
        this post
      </a>
      . To demonstrate it, I created a website which pulls data from the{' '}
      <a href="https://docs.opendota.com" target="blank" rel="noopener noreferrer">
        OpenDota API
      </a>
      , and display information like professional teams, heroes, as well as top players by hero.
      This will also demonstrate how to structure your stores for each feature/module in a
      Redux-enabled app.
    </p>
    <p>Enjoy your stay!</p>
  </PageContent>
)

const PageContent = styled('article')`
  margin: 0 auto;
  line-height: 1.6;

  h1,
  h2,
  h3,
  h4 {
    margin-bottom: 0.5rem;
    line-height: 1.25;
  }
`
