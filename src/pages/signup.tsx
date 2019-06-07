import * as React from 'react'
import styled from '../utils/styled'
import SignUp from '../components/forms/SignUp'
import { Formik, Field, Form, FormikActions } from 'formik'

export default () => (
  <PageContent>
    <SignUp />
  </PageContent>
)

const PageContent = styled('div')``
