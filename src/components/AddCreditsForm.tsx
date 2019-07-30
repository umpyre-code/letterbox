import React, { Component } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'

class AddCredits extends Component {
  constructor(props) {
    super(props)
    this.submit = this.submit.bind(this)
  }

  public async submit(ev) {
    // User clicked submit
  }

  public render() {
    return (
      <div className="checkout">
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <button onClick={this.submit}>Send</button>
      </div>
    )
  }
}

const AddCreditsForm = injectStripe(AddCredits)

export default AddCreditsForm
