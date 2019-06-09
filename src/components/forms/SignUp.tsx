import * as React from 'react'
import { connect } from 'react-redux'
import { FormikProps } from 'formik'
import { getClientRequest } from '../../store/client/actions'
import { Client } from '../../store/client/types'
import { ApplicationState } from '../../store'
import { CountryCode, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import Button from '@material-ui/core/Button'
import { Formik, Field, Form } from 'formik'
import { LinearProgress, FormGroup, MenuItem, FormControl, InputLabel } from '@material-ui/core'
import { fieldToTextField, TextField, TextFieldProps, Select } from 'formik-material-ui'
import MuiTextField from '@material-ui/core/TextField'

interface Values {
  full_name: string
  email: string
  password: string
  country_code: string
  phone_number: string
}

interface PropsFromState {
  client: Client
}

interface PropsFromDispatch {
  getClientRequest: typeof getClientRequest
}

const PhoneNumberTextField = (props: TextFieldProps) => (
  <MuiTextField
    {...fieldToTextField(props)}
    onChange={event => {
      console.log(event)
      const { value } = event.target
      if (value) {
        const formattedNumber = new AsYouType(props.form.values.country_code).input(value)
        props.form.setFieldValue(props.field.name, formattedNumber)
      } else {
        props.form.setFieldValue(props.field.name, '')
      }
    }}
  />
)

// Combine both state + dispatch props - as well as any props we want to pass - in a union type.
type AllProps = PropsFromDispatch & PropsFromState

class SignUp extends React.Component<AllProps> {
  public getClientRequest(values: Values, props: FormikProps<Values>) {
    console.log(values, props)
    console.log(this.props)
    this.props.getClientRequest()
  }

  public render() {
    const country_codes = country_iso_codes_with_flags
      .map(v => {
        return {
          code: v.code,
          text: v.country + ' ' + v.flag + ' +' + getCountryCallingCode(v.code)
        }
      })
      .sort((a, b) => a.text.localeCompare(b.text))

    return (
      <Formik
        initialValues={{
          email: '',
          password: '',
          full_name: ''
        }}
        validate={values => {
          const errors: Partial<Values> = {}
          if (!values.email) {
            errors.email = 'Required'
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            errors.email = 'Invalid email address'
          }
          return errors
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            setSubmitting(false)
            alert(JSON.stringify(values, null, 2))
          }, 500)
        }}
        render={({ submitForm, isSubmitting, values, setFieldValue }) => (
          <Form>
            <Field name="email" type="email" label="Email" component={TextField} />
            <br />
            <Field type="password" label="Password" name="password" component={TextField} />
            <br />
            <Field type="text" label="Full Name" name="full_name" component={TextField} />
            <br />
            <FormControl>
              <FormGroup>
                <InputLabel htmlFor="country_code">Country Code</InputLabel>
                <Field name="country_code" label="Country Code" component={Select}>
                  {country_codes.map(value => {
                    return (
                      <MenuItem key={value.code} value={value.code}>
                        {value.text}
                      </MenuItem>
                    )
                  })}
                </Field>
                <Field
                  type="text"
                  name="national_number"
                  label="Phone Number"
                  component={PhoneNumberTextField}
                />
              </FormGroup>
            </FormControl>
            <br />
            {isSubmitting && <LinearProgress />}
            <br />
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      />
    )
  }
}

const mapStateToProps = ({ client }: ApplicationState) => ({
  client: client.client
})

const mapDispatchToProps = {
  getClientRequest
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp)

const country_iso_codes_with_flags = [
  { code: 'AD', flag: '🇦🇩', country: 'Andorra' },
  { code: 'AE', flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: 'AF', flag: '🇦🇫', country: 'Afghanistan' },
  { code: 'AG', flag: '🇦🇬', country: 'Antigua and Barbuda' },
  { code: 'AI', flag: '🇦🇮', country: 'Anguilla' },
  { code: 'AL', flag: '🇦🇱', country: 'Albania' },
  { code: 'AM', flag: '🇦🇲', country: 'Armenia' },
  { code: 'AO', flag: '🇦🇴', country: 'Angola' },
  { code: 'AR', flag: '🇦🇷', country: 'Argentina' },
  { code: 'AS', flag: '🇦🇸', country: 'American Samoa' },
  { code: 'AT', flag: '🇦🇹', country: 'Austria' },
  { code: 'AU', flag: '🇦🇺', country: 'Australia' },
  { code: 'AW', flag: '🇦🇼', country: 'Aruba' },
  { code: 'AX', flag: '🇦🇽', country: 'Åland Islands' },
  { code: 'AZ', flag: '🇦🇿', country: 'Azerbaijan' },
  { code: 'BA', flag: '🇧🇦', country: 'Bosnia and Herzegovina' },
  { code: 'BB', flag: '🇧🇧', country: 'Barbados' },
  { code: 'BD', flag: '🇧🇩', country: 'Bangladesh' },
  { code: 'BE', flag: '🇧🇪', country: 'Belgium' },
  { code: 'BF', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: 'BG', flag: '🇧🇬', country: 'Bulgaria' },
  { code: 'BH', flag: '🇧🇭', country: 'Bahrain' },
  { code: 'BI', flag: '🇧🇮', country: 'Burundi' },
  { code: 'BJ', flag: '🇧🇯', country: 'Benin' },
  { code: 'BL', flag: '🇧🇱', country: 'Saint Barthélemy' },
  { code: 'BM', flag: '🇧🇲', country: 'Bermuda' },
  { code: 'BN', flag: '🇧🇳', country: 'Brunei Darussalam' },
  { code: 'BO', flag: '🇧🇴', country: 'Bolivia' },
  { code: 'BQ', flag: '🇧🇶', country: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'BR', flag: '🇧🇷', country: 'Brazil' },
  { code: 'BS', flag: '🇧🇸', country: 'Bahamas' },
  { code: 'BT', flag: '🇧🇹', country: 'Bhutan' },
  { code: 'BW', flag: '🇧🇼', country: 'Botswana' },
  { code: 'BY', flag: '🇧🇾', country: 'Belarus' },
  { code: 'BZ', flag: '🇧🇿', country: 'Belize' },
  { code: 'CA', flag: '🇨🇦', country: 'Canada' },
  { code: 'CC', flag: '🇨🇨', country: 'Cocos (Keeling) Islands' },
  { code: 'CD', flag: '🇨🇩', country: 'Congo' },
  { code: 'CF', flag: '🇨🇫', country: 'Central African Republic' },
  { code: 'CG', flag: '🇨🇬', country: 'Congo' },
  { code: 'CH', flag: '🇨🇭', country: 'Switzerland' },
  { code: 'CI', flag: '🇨🇮', country: "Côte D'Ivoire" },
  { code: 'CK', flag: '🇨🇰', country: 'Cook Islands' },
  { code: 'CL', flag: '🇨🇱', country: 'Chile' },
  { code: 'CM', flag: '🇨🇲', country: 'Cameroon' },
  { code: 'CN', flag: '🇨🇳', country: 'China' },
  { code: 'CO', flag: '🇨🇴', country: 'Colombia' },
  { code: 'CR', flag: '🇨🇷', country: 'Costa Rica' },
  { code: 'CU', flag: '🇨🇺', country: 'Cuba' },
  { code: 'CV', flag: '🇨🇻', country: 'Cape Verde' },
  { code: 'CW', flag: '🇨🇼', country: 'Curaçao' },
  { code: 'CX', flag: '🇨🇽', country: 'Christmas Island' },
  { code: 'CY', flag: '🇨🇾', country: 'Cyprus' },
  { code: 'CZ', flag: '🇨🇿', country: 'Czech Republic' },
  { code: 'DE', flag: '🇩🇪', country: 'Germany' },
  { code: 'DJ', flag: '🇩🇯', country: 'Djibouti' },
  { code: 'DK', flag: '🇩🇰', country: 'Denmark' },
  { code: 'DM', flag: '🇩🇲', country: 'Dominica' },
  { code: 'DO', flag: '🇩🇴', country: 'Dominican Republic' },
  { code: 'DZ', flag: '🇩🇿', country: 'Algeria' },
  { code: 'EC', flag: '🇪🇨', country: 'Ecuador' },
  { code: 'EE', flag: '🇪🇪', country: 'Estonia' },
  { code: 'EG', flag: '🇪🇬', country: 'Egypt' },
  { code: 'EH', flag: '🇪🇭', country: 'Western Sahara' },
  { code: 'ER', flag: '🇪🇷', country: 'Eritrea' },
  { code: 'ES', flag: '🇪🇸', country: 'Spain' },
  { code: 'ET', flag: '🇪🇹', country: 'Ethiopia' },
  { code: 'FI', flag: '🇫🇮', country: 'Finland' },
  { code: 'FJ', flag: '🇫🇯', country: 'Fiji' },
  { code: 'FK', flag: '🇫🇰', country: 'Falkland Islands (Malvinas)' },
  { code: 'FM', flag: '🇫🇲', country: 'Micronesia' },
  { code: 'FO', flag: '🇫🇴', country: 'Faroe Islands' },
  { code: 'FR', flag: '🇫🇷', country: 'France' },
  { code: 'GA', flag: '🇬🇦', country: 'Gabon' },
  { code: 'GB', flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'GD', flag: '🇬🇩', country: 'Grenada' },
  { code: 'GE', flag: '🇬🇪', country: 'Georgia' },
  { code: 'GF', flag: '🇬🇫', country: 'French Guiana' },
  { code: 'GG', flag: '🇬🇬', country: 'Guernsey' },
  { code: 'GH', flag: '🇬🇭', country: 'Ghana' },
  { code: 'GI', flag: '🇬🇮', country: 'Gibraltar' },
  { code: 'GL', flag: '🇬🇱', country: 'Greenland' },
  { code: 'GM', flag: '🇬🇲', country: 'Gambia' },
  { code: 'GN', flag: '🇬🇳', country: 'Guinea' },
  { code: 'GP', flag: '🇬🇵', country: 'Guadeloupe' },
  { code: 'GQ', flag: '🇬🇶', country: 'Equatorial Guinea' },
  { code: 'GR', flag: '🇬🇷', country: 'Greece' },
  { code: 'GT', flag: '🇬🇹', country: 'Guatemala' },
  { code: 'GU', flag: '🇬🇺', country: 'Guam' },
  { code: 'GW', flag: '🇬🇼', country: 'Guinea-Bissau' },
  { code: 'GY', flag: '🇬🇾', country: 'Guyana' },
  { code: 'HK', flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'HN', flag: '🇭🇳', country: 'Honduras' },
  { code: 'HR', flag: '🇭🇷', country: 'Croatia' },
  { code: 'HT', flag: '🇭🇹', country: 'Haiti' },
  { code: 'HU', flag: '🇭🇺', country: 'Hungary' },
  { code: 'ID', flag: '🇮🇩', country: 'Indonesia' },
  { code: 'IE', flag: '🇮🇪', country: 'Ireland' },
  { code: 'IL', flag: '🇮🇱', country: 'Israel' },
  { code: 'IM', flag: '🇮🇲', country: 'Isle of Man' },
  { code: 'IN', flag: '🇮🇳', country: 'India' },
  { code: 'IO', flag: '🇮🇴', country: 'British Indian Ocean Territory' },
  { code: 'IQ', flag: '🇮🇶', country: 'Iraq' },
  { code: 'IR', flag: '🇮🇷', country: 'Iran' },
  { code: 'IS', flag: '🇮🇸', country: 'Iceland' },
  { code: 'IT', flag: '🇮🇹', country: 'Italy' },
  { code: 'JE', flag: '🇯🇪', country: 'Jersey' },
  { code: 'JM', flag: '🇯🇲', country: 'Jamaica' },
  { code: 'JO', flag: '🇯🇴', country: 'Jordan' },
  { code: 'JP', flag: '🇯🇵', country: 'Japan' },
  { code: 'KE', flag: '🇰🇪', country: 'Kenya' },
  { code: 'KG', flag: '🇰🇬', country: 'Kyrgyzstan' },
  { code: 'KH', flag: '🇰🇭', country: 'Cambodia' },
  { code: 'KI', flag: '🇰🇮', country: 'Kiribati' },
  { code: 'KM', flag: '🇰🇲', country: 'Comoros' },
  { code: 'KN', flag: '🇰🇳', country: 'Saint Kitts and Nevis' },
  { code: 'KP', flag: '🇰🇵', country: 'North Korea' },
  { code: 'KR', flag: '🇰🇷', country: 'South Korea' },
  { code: 'KW', flag: '🇰🇼', country: 'Kuwait' },
  { code: 'KY', flag: '🇰🇾', country: 'Cayman Islands' },
  { code: 'KZ', flag: '🇰🇿', country: 'Kazakhstan' },
  { code: 'LA', flag: '🇱🇦', country: "Lao People's Democratic Republic" },
  { code: 'LB', flag: '🇱🇧', country: 'Lebanon' },
  { code: 'LC', flag: '🇱🇨', country: 'Saint Lucia' },
  { code: 'LI', flag: '🇱🇮', country: 'Liechtenstein' },
  { code: 'LK', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: 'LR', flag: '🇱🇷', country: 'Liberia' },
  { code: 'LS', flag: '🇱🇸', country: 'Lesotho' },
  { code: 'LT', flag: '🇱🇹', country: 'Lithuania' },
  { code: 'LU', flag: '🇱🇺', country: 'Luxembourg' },
  { code: 'LV', flag: '🇱🇻', country: 'Latvia' },
  { code: 'LY', flag: '🇱🇾', country: 'Libya' },
  { code: 'MA', flag: '🇲🇦', country: 'Morocco' },
  { code: 'MC', flag: '🇲🇨', country: 'Monaco' },
  { code: 'MD', flag: '🇲🇩', country: 'Moldova' },
  { code: 'ME', flag: '🇲🇪', country: 'Montenegro' },
  { code: 'MF', flag: '🇲🇫', country: 'Saint Martin (French Part)' },
  { code: 'MG', flag: '🇲🇬', country: 'Madagascar' },
  { code: 'MH', flag: '🇲🇭', country: 'Marshall Islands' },
  { code: 'MK', flag: '🇲🇰', country: 'Macedonia' },
  { code: 'ML', flag: '🇲🇱', country: 'Mali' },
  { code: 'MM', flag: '🇲🇲', country: 'Myanmar' },
  { code: 'MN', flag: '🇲🇳', country: 'Mongolia' },
  { code: 'MO', flag: '🇲🇴', country: 'Macao' },
  { code: 'MP', flag: '🇲🇵', country: 'Northern Mariana Islands' },
  { code: 'MQ', flag: '🇲🇶', country: 'Martinique' },
  { code: 'MR', flag: '🇲🇷', country: 'Mauritania' },
  { code: 'MS', flag: '🇲🇸', country: 'Montserrat' },
  { code: 'MT', flag: '🇲🇹', country: 'Malta' },
  { code: 'MU', flag: '🇲🇺', country: 'Mauritius' },
  { code: 'MV', flag: '🇲🇻', country: 'Maldives' },
  { code: 'MW', flag: '🇲🇼', country: 'Malawi' },
  { code: 'MX', flag: '🇲🇽', country: 'Mexico' },
  { code: 'MY', flag: '🇲🇾', country: 'Malaysia' },
  { code: 'MZ', flag: '🇲🇿', country: 'Mozambique' },
  { code: 'NA', flag: '🇳🇦', country: 'Namibia' },
  { code: 'NC', flag: '🇳🇨', country: 'New Caledonia' },
  { code: 'NE', flag: '🇳🇪', country: 'Niger' },
  { code: 'NF', flag: '🇳🇫', country: 'Norfolk Island' },
  { code: 'NG', flag: '🇳🇬', country: 'Nigeria' },
  { code: 'NI', flag: '🇳🇮', country: 'Nicaragua' },
  { code: 'NL', flag: '🇳🇱', country: 'Netherlands' },
  { code: 'NO', flag: '🇳🇴', country: 'Norway' },
  { code: 'NP', flag: '🇳🇵', country: 'Nepal' },
  { code: 'NR', flag: '🇳🇷', country: 'Nauru' },
  { code: 'NU', flag: '🇳🇺', country: 'Niue' },
  { code: 'NZ', flag: '🇳🇿', country: 'New Zealand' },
  { code: 'OM', flag: '🇴🇲', country: 'Oman' },
  { code: 'PA', flag: '🇵🇦', country: 'Panama' },
  { code: 'PE', flag: '🇵🇪', country: 'Peru' },
  { code: 'PF', flag: '🇵🇫', country: 'French Polynesia' },
  { code: 'PG', flag: '🇵🇬', country: 'Papua New Guinea' },
  { code: 'PH', flag: '🇵🇭', country: 'Philippines' },
  { code: 'PK', flag: '🇵🇰', country: 'Pakistan' },
  { code: 'PL', flag: '🇵🇱', country: 'Poland' },
  { code: 'PM', flag: '🇵🇲', country: 'Saint Pierre and Miquelon' },
  { code: 'PR', flag: '🇵🇷', country: 'Puerto Rico' },
  { code: 'PS', flag: '🇵🇸', country: 'Palestinian Territory' },
  { code: 'PT', flag: '🇵🇹', country: 'Portugal' },
  { code: 'PW', flag: '🇵🇼', country: 'Palau' },
  { code: 'PY', flag: '🇵🇾', country: 'Paraguay' },
  { code: 'QA', flag: '🇶🇦', country: 'Qatar' },
  { code: 'RE', flag: '🇷🇪', country: 'Réunion' },
  { code: 'RO', flag: '🇷🇴', country: 'Romania' },
  { code: 'RS', flag: '🇷🇸', country: 'Serbia' },
  { code: 'RU', flag: '🇷🇺', country: 'Russia' },
  { code: 'RW', flag: '🇷🇼', country: 'Rwanda' },
  { code: 'SA', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: 'SB', flag: '🇸🇧', country: 'Solomon Islands' },
  { code: 'SC', flag: '🇸🇨', country: 'Seychelles' },
  { code: 'SD', flag: '🇸🇩', country: 'Sudan' },
  { code: 'SE', flag: '🇸🇪', country: 'Sweden' },
  { code: 'SG', flag: '🇸🇬', country: 'Singapore' },
  { code: 'SH', flag: '🇸🇭', country: 'Saint Helena, Ascension and Tristan Da Cunha' },
  { code: 'SI', flag: '🇸🇮', country: 'Slovenia' },
  { code: 'SJ', flag: '🇸🇯', country: 'Svalbard and Jan Mayen' },
  { code: 'SK', flag: '🇸🇰', country: 'Slovakia' },
  { code: 'SL', flag: '🇸🇱', country: 'Sierra Leone' },
  { code: 'SM', flag: '🇸🇲', country: 'San Marino' },
  { code: 'SN', flag: '🇸🇳', country: 'Senegal' },
  { code: 'SO', flag: '🇸🇴', country: 'Somalia' },
  { code: 'SR', flag: '🇸🇷', country: 'Suriname' },
  { code: 'SS', flag: '🇸🇸', country: 'South Sudan' },
  { code: 'ST', flag: '🇸🇹', country: 'Sao Tome and Principe' },
  { code: 'SV', flag: '🇸🇻', country: 'El Salvador' },
  { code: 'SX', flag: '🇸🇽', country: 'Sint Maarten (Dutch Part)' },
  { code: 'SY', flag: '🇸🇾', country: 'Syrian Arab Republic' },
  { code: 'SZ', flag: '🇸🇿', country: 'Swaziland' },
  { code: 'TC', flag: '🇹🇨', country: 'Turks and Caicos Islands' },
  { code: 'TD', flag: '🇹🇩', country: 'Chad' },
  { code: 'TG', flag: '🇹🇬', country: 'Togo' },
  { code: 'TH', flag: '🇹🇭', country: 'Thailand' },
  { code: 'TJ', flag: '🇹🇯', country: 'Tajikistan' },
  { code: 'TK', flag: '🇹🇰', country: 'Tokelau' },
  { code: 'TL', flag: '🇹🇱', country: 'Timor-Leste' },
  { code: 'TM', flag: '🇹🇲', country: 'Turkmenistan' },
  { code: 'TN', flag: '🇹🇳', country: 'Tunisia' },
  { code: 'TO', flag: '🇹🇴', country: 'Tonga' },
  { code: 'TR', flag: '🇹🇷', country: 'Turkey' },
  { code: 'TT', flag: '🇹🇹', country: 'Trinidad and Tobago' },
  { code: 'TV', flag: '🇹🇻', country: 'Tuvalu' },
  { code: 'TW', flag: '🇹🇼', country: 'Taiwan' },
  { code: 'TZ', flag: '🇹🇿', country: 'Tanzania' },
  { code: 'UA', flag: '🇺🇦', country: 'Ukraine' },
  { code: 'UG', flag: '🇺🇬', country: 'Uganda' },
  { code: 'US', flag: '🇺🇸', country: 'United States' },
  { code: 'UY', flag: '🇺🇾', country: 'Uruguay' },
  { code: 'UZ', flag: '🇺🇿', country: 'Uzbekistan' },
  { code: 'VA', flag: '🇻🇦', country: 'Vatican City' },
  { code: 'VC', flag: '🇻🇨', country: 'Saint Vincent and The Grenadines' },
  { code: 'VE', flag: '🇻🇪', country: 'Venezuela' },
  { code: 'VG', flag: '🇻🇬', country: 'Virgin Islands, British' },
  { code: 'VI', flag: '🇻🇮', country: 'Virgin Islands, U.S.' },
  { code: 'VN', flag: '🇻🇳', country: 'Viet Nam' },
  { code: 'VU', flag: '🇻🇺', country: 'Vanuatu' },
  { code: 'WF', flag: '🇼🇫', country: 'Wallis and Futuna' },
  { code: 'WS', flag: '🇼🇸', country: 'Samoa' },
  { code: 'YE', flag: '🇾🇪', country: 'Yemen' },
  { code: 'YT', flag: '🇾🇹', country: 'Mayotte' },
  { code: 'ZA', flag: '🇿🇦', country: 'South Africa' },
  { code: 'ZM', flag: '🇿🇲', country: 'Zambia' },
  { code: 'ZW', flag: '🇿🇼', country: 'Zimbabwe' }
]
