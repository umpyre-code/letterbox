import {
  Avatar,
  Button,
  CardHeader,
  createStyles,
  LinearProgress,
  makeStyles,
  Theme,
  Card
} from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import { Field, Form, Formik, FormikProps, FormikValues } from 'formik'
import { TextField } from 'formik-material-ui'
import * as React from 'react'
import * as Yup from 'yup'
import { ClientProfileHelper } from '../../../store/client/types'
import { ClientProfile } from '../../../store/models/client'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    doneIcon: {
      marginLeft: theme.spacing(1)
    }
  })
)

interface Props {
  profile?: ClientProfile
}

const ProfileFormSchema = Yup.object().shape({
  full_name: Yup.string()
    .max(100, 'Keep it under 100 characters')
    .required('How shall we address you?'),
  handle: Yup.string()
    .max(100, 'Keep it under 100 characters')
    .lowercase()
    .trim()
    .matches(
      /^[a-z0-9_.-]*$/,
      "Your handle can't contain special characters; only A to Z, 0 to 9, _, ., and -."
    )
    .nullable()
})

export const ProfileForm: React.FC<Props> = ({ profile }) => {
  const clientProfileHelper = ClientProfileHelper.FROM(profile!)
  const classes = useStyles()

  const handleFormRender = (props: FormikProps<FormikValues>) => {
    const { submitForm, isSubmitting, isValid, isValidating } = props

    return (
      <Form>
        <CardHeader
          avatar={
            <Avatar alt={clientProfileHelper.full_name}>{clientProfileHelper.getInitials()}</Avatar>
          }
          title={<Field type="text" label="Your Name" name="full_name" component={TextField} />}
          subheader={<Field type="text" label="Handle" name="handle" component={TextField} />}
          action={
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting || !isValid}
              onClick={submitForm}
              fullWidth
            >
              Done
              <DoneIcon className={classes.doneIcon} />
            </Button>
          }
        />
        {/* {this.props.client.signUpFormErrors && (
          <Grid item>
            <SnackbarContent
              message={
                <h3>
                  <span style={{ fontSize: '1.5rem', padding: '5px' }}>😳</span>{' '}
                  {this.props.client.signUpFormErrors}
                </h3>
              }
            />
          </Grid>
        )} */}
        {isSubmitting && <LinearProgress />}
      </Form>
    )
  }

  return (
    <Card>
      <Formik
        initialValues={{
          full_name: profile!.full_name!,
          handle: profile!.handle || ''
        }}
        validationSchema={ProfileFormSchema}
        isInitialValid={true}
        onSubmit={(values, actions) => {
          console.log(values)
        }}
        render={handleFormRender}
      />
    </Card>
  )
}
