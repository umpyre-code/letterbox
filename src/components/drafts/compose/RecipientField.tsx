import { TextField, Typography } from '@material-ui/core'
import Chip from '@material-ui/core/Chip'
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { TextFieldProps } from '@material-ui/core/TextField'
import Downshift from 'downshift'
import deburr from 'lodash/deburr'
import PropTypes from 'prop-types'
import * as React from 'react'
import { API } from '../../../store/api'
import {
  ClientCredentials,
  ClientID,
  ClientProfile,
  ClientSearchResult
} from '../../../store/models/client'
import { ProfileAvatar } from '../../widgets/profile/ProfileAvatar'
import { ProfileTooltip } from '../../widgets/profile/ProfileTooltip'

interface RecipientFieldProps {
  credentials: ClientCredentials
  setRecipients: (value: ClientID[]) => void
  initialValues: ClientID[]
  disabled: boolean
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      margin: theme.spacing(0.5, 0.25)
    },
    container: {
      flexGrow: 1,
      position: 'relative'
    },
    divider: {
      height: theme.spacing(2)
    },
    inputInput: {
      flexGrow: 1,
      width: 'auto'
    },
    inputRoot: {
      flexWrap: 'wrap'
    },
    paper: {
      left: 0,
      marginTop: theme.spacing(1),
      position: 'absolute',
      right: 0,
      zIndex: 10
    },
    root: {
      flexGrow: 1,
      height: 250
    }
  })
)

export const RecipientField: React.FC<RecipientFieldProps> = ({
  credentials,
  disabled,
  setRecipients,
  initialValues
}) => {
  const classes = useStyles({})
  return (
    <React.Fragment>
      <DownshiftMultiple
        classes={classes}
        disabled={disabled}
        credentials={credentials}
        setRecipients={setRecipients}
        initialValues={initialValues}
      />
    </React.Fragment>
  )
}

RecipientField.defaultProps = {
  disabled: false
}

interface Suggestion {
  client_id: string
  full_name: string
  handle?: string
}

type RenderInputProps = TextFieldProps & {
  classes: ReturnType<typeof useStyles>
  ref?: React.Ref<HTMLDivElement>
}

function renderInput(inputProps: RenderInputProps) {
  const { InputProps, classes, ref, ...other } = inputProps

  return (
    <TextField
      InputProps={{
        classes: {
          input: classes.inputInput,
          root: classes.inputRoot
        },
        inputRef: ref,
        ...InputProps
      }}
      {...other}
    />
  )
}

interface RenderSuggestionProps {
  highlightedIndex: number | null
  index: number
  itemProps: MenuItemProps<'div', { button?: never }>
  selectedItem: ClientProfile
  suggestion: Suggestion
}

function renderSuggestion(suggestionProps: RenderSuggestionProps) {
  const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem.client_id || '').includes(suggestion.client_id)

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.client_id}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
        padding: '4px',
        margin: 0
      }}
    >
      <ProfileAvatar profile={suggestion} size="tiny" />
      <Typography style={{ paddingLeft: '4px', paddingRight: '4px' }}>
        {suggestion.full_name}
      </Typography>
      {suggestion.handle && suggestion.handle.length > 0 && (
        <Typography color="textSecondary" variant="body2">
          {suggestion.handle}
        </Typography>
      )}
    </MenuItem>
  )
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.object,
  suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired
}

async function getProfileFor(
  credentials: ClientCredentials,
  suggestion: Suggestion
): Promise<ClientProfile> {
  const api = new API(credentials)
  return api.fetchClient(suggestion.client_id)
}

async function getSuggestions(
  credentials: ClientCredentials,
  prefix: string
): Promise<Suggestion[]> {
  const inputValue = deburr(prefix.trim()).toLowerCase()
  const inputLength = inputValue.length
  if (inputLength > 0) {
    const api = new API(credentials)
    const searchResults = await api.searchClient(inputValue)
    return Promise.resolve(
      searchResults.map((searchResult: ClientSearchResult) => ({
        ...searchResult,
        label: searchResult.full_name
      }))
    )
  }
  return Promise.resolve([])
}

interface DownshiftMultipleProps {
  classes: ReturnType<typeof useStyles>
  credentials: ClientCredentials
  disabled: boolean
  setRecipients: (value: ClientID[]) => void
  initialValues: ClientID[]
}

// tslint:disable-next-line: max-func-body-length
function DownshiftMultiple(props: DownshiftMultipleProps) {
  const { classes, credentials, initialValues, setRecipients } = props
  const [inputValue, setInputValue] = React.useState('')
  const [selectedItem, setSelectedItem] = React.useState<ClientProfile[]>([])
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])

  function handleChange(item: Suggestion) {
    let newSelectedItem = [...selectedItem]
    getProfileFor(credentials, item).then(profile => {
      if (!newSelectedItem.includes(profile)) {
        newSelectedItem = [...newSelectedItem, profile]
      }
      setInputValue('')
      setSelectedItem(newSelectedItem)
    })
  }

  React.useEffect(() => {
    async function populateInitialValues() {
      const api = new API(credentials)
      const results = await Promise.all(initialValues.map(clientId => api.fetchClient(clientId)))
      results.forEach(client => {
        if (!selectedItem.find(item => item.client_id === client.client_id)) {
          handleChange(client as Suggestion)
        }
      })
    }
    populateInitialValues()
  }, [props.initialValues])

  React.useEffect(() => {
    setRecipients(selectedItem.map(si => si.client_id))
  }, [selectedItem])

  function handleKeyDown(
    event: React.KeyboardEvent,
    isOpen: boolean,
    highlightedIndex: number,
    setHighlightedIndex: (index: number) => void
  ) {
    if (selectedItem.length !== 0 && inputValue.length === 0 && event.key === 'Backspace') {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1))
    } else if (event.key === 'Tab') {
      if (isOpen) {
        if (highlightedIndex === null) {
          setHighlightedIndex(0)
        } else if (suggestions.length > highlightedIndex + 1) {
          setHighlightedIndex(highlightedIndex + 1)
        } else {
          setHighlightedIndex(0)
        }
        event.preventDefault()
      }
    }
  }

  function handleInputChange(event: React.ChangeEvent<{ value: string }>, isOpen: boolean) {
    const input = event.target.value
    setInputValue(input)
    if (isOpen) {
      getSuggestions(credentials, input)
        .then(result => {
          setSuggestions(result)
          return true
        })
        .catch(() => {})
    } else {
      setSuggestions([])
    }
  }

  const handleDelete = (profile: ClientProfile) => () => {
    const newSelectedItem = [...selectedItem]
    newSelectedItem.splice(newSelectedItem.indexOf(profile), 1)
    setSelectedItem(newSelectedItem)
  }

  return (
    <Downshift
      inputValue={inputValue}
      onChange={handleChange}
      selectedItem={selectedItem}
      itemToString={(item: Suggestion) => {
        return item.full_name
      }}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        isOpen,
        selectedItem: selectedItem2,
        highlightedIndex,
        setHighlightedIndex
      }) => {
        const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
          onKeyDown: (event: React.KeyboardEvent) => {
            handleKeyDown(event, isOpen, highlightedIndex, setHighlightedIndex)
          },
          placeholder: 'Recipients'
        })
        return (
          <div className={classes.container}>
            {renderInput({
              InputLabelProps: getLabelProps(),
              InputProps: {
                disabled: props.disabled,
                onBlur,
                onChange: event => {
                  handleInputChange(event, isOpen)
                  onChange(event as React.ChangeEvent<HTMLInputElement>)
                },
                onFocus,
                startAdornment: selectedItem.map(profile => (
                  <ProfileTooltip profile={profile} key={profile.client_id}>
                    <Chip
                      avatar={<ProfileAvatar profile={profile} size="tiny" />}
                      key={profile.client_id}
                      tabIndex={-1}
                      label={`${profile.full_name} $${profile.ral}`}
                      className={classes.chip}
                      onDelete={handleDelete(profile)}
                    />
                  </ProfileTooltip>
                ))
              },
              classes,
              fullWidth: true,
              inputProps
            })}
            {isOpen ? (
              <Paper className={classes.paper} square>
                {suggestions.map((suggestion, index) =>
                  renderSuggestion({
                    highlightedIndex,
                    index,
                    itemProps: getItemProps({ item: suggestion }),
                    selectedItem: selectedItem2,
                    suggestion
                  })
                )}
              </Paper>
            ) : null}
          </div>
        )
      }}
    </Downshift>
  )
}

DownshiftMultiple.propTypes = {
  classes: PropTypes.object.isRequired
}
