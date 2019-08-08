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
import { ClientCredentials, ClientSearchResult } from '../../../store/models/client'

interface RecipientFieldProps {
  credentials: ClientCredentials
  setRecipients: (value: ClientID[]) => void
  initialValue: string
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
  setRecipients,
  initialValue
}) => {
  const classes = useStyles()
  return (
    <React.Fragment>
      {/* <TextField
        defaultValue={initialValue}
        fullWidth
        id="recipient"
        label="Recipient"
        onChange={event => {
          async function search(prefix: string) {
            const api = new API(credentials)
            const result = await api.searchClient(prefix)
          }
          const value = event.target.value
          if (value && value !== '') {
            search(value)
          }
          setRecipient(event.target.value)
        }}
      /> */}
      <DownshiftMultiple classes={classes} credentials={credentials} />
    </React.Fragment>
  )
}

interface Suggestion {
  client_id: string
  full_name: string
  handle: string
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
  selectedItem: Suggestion
  suggestion: Suggestion
}

function renderSuggestion(suggestionProps: RenderSuggestionProps) {
  const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem.client_id || '').indexOf(suggestion.client_id) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.client_id}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.full_name}
      {suggestion.handle && suggestion.handle.length > 0 && (
        <Typography color="textSecondary" variant="body2">
          &nbsp;/c/{suggestion.handle}
        </Typography>
      )}
    </MenuItem>
  )
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired
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
  } else {
    return Promise.resolve([])
  }
}

interface DownshiftMultipleProps {
  classes: ReturnType<typeof useStyles>
  credentials: ClientCredentials
}

// tslint:disable-next-line: max-func-body-length
function DownshiftMultiple(props: DownshiftMultipleProps) {
  const { classes, credentials } = props
  const [inputValue, setInputValue] = React.useState('')
  const [selectedItem, setSelectedItem] = React.useState<Suggestion[]>([])
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])

  function handleKeyDown(event: React.KeyboardEvent) {
    if (selectedItem.length && !inputValue.length && event.key === 'Backspace') {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1))
    }
  }

  function handleInputChange(event: React.ChangeEvent<{ value: string }>, isOpen: boolean) {
    const input = event.target.value
    setInputValue(input)
    if (isOpen) {
      getSuggestions(credentials, input).then(result => {
        setSuggestions(result)
      })
    } else {
      setSuggestions([])
    }
  }

  function handleChange(item: Suggestion) {
    let newSelectedItem = [...selectedItem]
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item]
    }
    setInputValue('')
    setSelectedItem(newSelectedItem)
  }

  const handleDelete = (item: Suggestion) => () => {
    const newSelectedItem = [...selectedItem]
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1)
    setSelectedItem(newSelectedItem)
  }

  return (
    <Downshift
      id="downshift-multiple"
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
        inputValue: inputValue2,
        selectedItem: selectedItem2,
        highlightedIndex
      }) => {
        const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
          onKeyDown: handleKeyDown,
          placeholder: 'Recipients'
        })
        return (
          <div className={classes.container}>
            {renderInput({
              InputLabelProps: getLabelProps(),
              InputProps: {
                onBlur,
                onChange: event => {
                  handleInputChange(event, isOpen)
                  onChange!(event as React.ChangeEvent<HTMLInputElement>)
                },
                onFocus,
                startAdornment: selectedItem.map(item => (
                  <Chip
                    key={item.client_id}
                    tabIndex={-1}
                    label={item.full_name}
                    className={classes.chip}
                    onDelete={handleDelete(item)}
                  />
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
