import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  LinearProgress,
  Typography
} from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import { ContentState, convertFromHTML, EditorState } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import { Field, Form, Formik, FormikProps, FormikValues } from 'formik'
import { TextField } from 'formik-material-ui'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Yup from 'yup'
import { API } from '../../../store/api'
import { ApplicationState } from '../../../store/ApplicationState'
import { updateClientProfileRequest } from '../../../store/client/actions'
import { ClientProfileHelper } from '../../../store/client/types'
import { ClientCredentials, ClientProfile } from '../../../store/models/client'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { markdownToHtml } from '../../../util/markdownToHtml'
import { Editor } from '../../drafts/compose/Editor'

interface Props {
  profile?: ClientProfile
  setIsEditing: (arg0: boolean) => void
}

interface PropsFromState {
  credentials: ClientCredentials
}

interface PropsFromDispatch {
  updateClientProfile: typeof updateClientProfileRequest
}

type AllProps = Props & PropsFromState & PropsFromDispatch

function getInitialState(profile?: ClientProfile): EditorState {
  if (profile && profile.profile) {
    const markup = markdownToHtml(profile.profile)
    const blocksFromHTML = convertFromHTML(markup)
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
    )
  }
  return EditorState.createEmpty()
}

function getStateWithMaxLengthEnsured(
  oldState: EditorState,
  newState: EditorState,
  maxLength: number
): EditorState {
  const contentState = newState.getCurrentContent()
  const oldContent = oldState.getCurrentContent()
  if (contentState === oldContent || contentState.getPlainText().length <= maxLength) {
    return newState
  }
  return EditorState.undo(
    EditorState.push(
      oldState,
      ContentState.createFromText(oldContent.getPlainText()),
      'delete-character'
    )
  )
}

async function testHandle(
  value: string,
  credentials: ClientCredentials,
  profile: ClientProfile
): Promise<boolean> {
  if (value === null || value.length === 0) {
    // if the handle is null/empty, that's fine
    return Promise.resolve(true)
  }
  if (profile.handle && value.toLowerCase() === profile.handle.toLowerCase()) {
    // if the handle hasn't changed, that's fine
    return Promise.resolve(true)
  }
  return API.FETCH_CLIENT_BY_HANDLE(credentials, value)
    .then(() => false) // if the request succeeded, the handle isn't available
    .catch(error => error.response && error.response.status === 404)
}

function getSchema(credentials: ClientCredentials, profile: ClientProfile) {
  return Yup.object().shape({
    full_name: Yup.string()
      .max(100, 'Keep it under 100 characters')
      .required('How shall we address you?'),
    handle: Yup.string()
      .nullable()
      .max(100, 'Keep it under 100 characters')
      .trim()
      .matches(
        /^[a-zA-Z0-9_.-]*$/,
        "Your handle can't contain special characters; only A to Z, 0 to 9, _, ., and -."
      )
      .test('is available', "that's not available", async value =>
        testHandle(value, credentials, profile)
      )
  })
}

export const ProfileFormFC: React.FC<AllProps> = ({
  credentials,
  profile,
  setIsEditing,
  updateClientProfile
}) => {
  const [editorState, setEditorState] = React.useState(getInitialState(profile))

  const clientProfileHelper = ClientProfileHelper.FROM(profile)

  const handleFormRender = (props: FormikProps<FormikValues>) => {
    const { submitForm, isSubmitting, isValid, isValidating } = props

    function doneButtonDisabled() {
      return isSubmitting || !isValid
    }

    return (
      <Form>
        <CardHeader
          avatar={
            <Avatar alt={clientProfileHelper.full_name}>{clientProfileHelper.getInitials()}</Avatar>
          }
          title={<Field type="text" label="Your Name" name="full_name" component={TextField} />}
          subheader={<Field type="text" label="your_handle" name="handle" component={TextField} />}
          action={
            <IconButton aria-label="Done" disabled={doneButtonDisabled()} onClick={submitForm}>
              <DoneIcon color="primary" />
            </IconButton>
          }
        />
        <CardContent>
          <Typography component="sub" variant="subtitle1">
            About me
          </Typography>
          <Divider light />
          <Editor
            editorState={editorState}
            onChange={(newEditorState: EditorState) => {
              const updatedEditorState = getStateWithMaxLengthEnsured(
                editorState,
                newEditorState,
                950
              )
              setEditorState(updatedEditorState)
            }}
            placeholder="Tell us about you"
            readOnly={doneButtonDisabled()}
          />
        </CardContent>
        {isSubmitting && <LinearProgress />}
      </Form>
    )
  }

  return (
    <Card>
      <Formik
        initialValues={{
          full_name: profile.full_name,
          handle: profile.handle || ''
        }}
        validationSchema={getSchema(credentials, profile)}
        isInitialValid
        onSubmit={(values, actions) => {
          updateClientProfile(
            {
              ...profile,
              ...values,
              profile: htmlToMarkdown(stateToHTML(editorState.getCurrentContent()))
            },
            { actions, setIsEditing, redirect: true }
          )
        }}
        render={handleFormRender}
      />
    </Card>
  )
}

const mapStateToProps = (appState: ApplicationState) => ({
  credentials: appState.clientState.credentials
})

const mapDispatchToProps = {
  updateClientProfile: updateClientProfileRequest
}

export const ProfileForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileFormFC)
