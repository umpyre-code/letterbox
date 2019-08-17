import {
  Box,
  Container,
  createStyles,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { BackButton } from '../components/widgets/BackButton'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      margin: theme.spacing(1),
      padding: theme.spacing(1)
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) }
  })
)

const AboutPage = () => {
  const classes = useStyles({})
  return (
    <Container maxWidth="sm" className={classes.container}>
      <Box className={classes.box}>
        <BackButton />
      </Box>
      <Paper className={classes.paper}>
        <Box className={classes.box}>
          <Typography variant="h3">About Umpyre</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography>Umpyre is a better way to communicate online.</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="h5">What’s Umpyre?</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            Umpyre is a messaging platform with payments. You can send a message to anyone and
            attach a payment to that message. Anyone can receive messages from anyone, and those
            messages are ranked according to their value. Messages which aren’t read within 30 days
            are deleted, and the payment is refunded minus any fees.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="h5">What makes Umpyre different?</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            We believe that advertising business models are harmful for everyone because it
            incentivizes bad behaviour. Umpyre has a simple, sustainable business model: when you
            send a message with a payment, we earn a small fee. When you read a message, you earn a
            small fee. Thus, we benefit when our clients benefit. It’s a win-win for everyone; our
            incentives are aligned.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            We don’t dictate how you use our platform, we don’t police content, and your messages
            are always private. In fact, we couldn’t read your messages if we wanted to.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="h5">How do you use my data?</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            We only use aggregate (i.e., non-identifiable) metrics for improving our platform, and
            we don’t store any privately identifiable information unless we absolutely must. For
            example, in order to send payouts we may collect taxpayer information for certain users
            to comply with local regulations. We also collect your email and phone number for login
            verification.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            The body of your messages is always end-to-end encrypted, and we never store metadata
            about your messages on our servers for more than 30 days. We may keep some server side
            logs for the purpose of improving our product, but we don’t store them for long periods
            and we don’t include any personally identifiable information in those logs.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            We retain payment information (adding credits or receiving payouts) for your records as
            well as regulatory compliance.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            We will never share your data with third parties or advertisers.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="h5">Why are there fees?</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            In order to make Umpyre sustainable, we need a business model that works for everyone.
            We only make money when you use our product and get value out of it. Thus, our
            incentives are aligned. This is a huge shift from other online platforms.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            It’s our belief that a problem with many online businesses is that their users are not
            their customers. Many companies have a model where their customers are advertisers, and
            their users are the product being offered to advertisers. By offering a clear, simple
            business model, we can provide a better product, without compromising privacy.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="body1">
            Umpyre is still an early stage startup, and we’re experimenting with different ways to
            make the product useful and sustainable. Our goal is to create a beautiful product that
            brings joy and creates value for everyone, everywhere.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default AboutPage
