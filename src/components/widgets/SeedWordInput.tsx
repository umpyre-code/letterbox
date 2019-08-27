import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Downshift, { GetLabelPropsOptions } from 'downshift'
import _ from 'lodash'
import deburr from 'lodash/deburr'
import PropTypes from 'prop-types'
import * as React from 'react'
import { wordLists } from '../../store/keys/wordLists'

const suggestions = wordLists.english.map((word: string) => ({ label: word }))

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput
        },
        ...InputProps
      }}
      {...other}
    />
  )
}

renderInput.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object.isRequired,
  InputProps: PropTypes.object
}

function renderSuggestion(suggestionProps) {
  const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.label}
    </MenuItem>
  )
}

renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.number]).isRequired,
  index: PropTypes.number.isRequired,
  itemProps: PropTypes.object.isRequired,
  selectedItem: PropTypes.string.isRequired,
  suggestion: PropTypes.shape({
    label: PropTypes.string.isRequired
  }).isRequired
}

function getSuggestions(value, { showEmpty = false } = {}) {
  const inputValue = deburr(value.trim()).toLowerCase()
  const inputLength = inputValue.length
  let count = 0

  return inputLength === 0 && !showEmpty
    ? []
    : suggestions.filter(suggestion => {
        const keep =
          count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue

        if (keep) {
          count += 1
        }

        return keep
      })
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  container: {
    flexGrow: 1,
    position: 'relative',
    margin: theme.spacing(1)
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
  divider: {
    height: theme.spacing(2)
  }
}))

interface SeedWordInputProps {
  label: string
  placeholder?: string
  onChange: (value: string) => void
  selectedItem: string
  focusNextOnChange: boolean
}

export const SeedWordInput: React.FC<SeedWordInputProps> = props => {
  const { label, placeholder, selectedItem } = props
  const classes = useStyles({})
  const inputRef = React.createRef<HTMLInputElement>()

  function focusNextInput(element?: Element): boolean {
    if (!element.isSameNode(inputRef.current) && element.tagName.toLowerCase() === 'input') {
      const input = element as HTMLInputElement
      input.focus()
      return true
    }
    if (element.children) {
      if (_.find(element.children, c => focusNextInput(c))) {
        return true
      }
    }
    if (element.nextElementSibling) {
      if (focusNextInput(element.nextElementSibling)) {
        return true
      }
    }

    return findNextSibling(element.parentElement)
  }

  function findNextSibling(element?: Element): boolean {
    if (element.nextElementSibling) {
      return focusNextInput(element.nextElementSibling)
    }
    return findNextSibling(element.parentElement)
  }

  function handleChange(item: string) {
    props.onChange(item)
    if (props.focusNextOnChange && item.length > 0) {
      findNextSibling(inputRef.current.parentElement)
    }
  }

  return (
    <Downshift selectedItem={selectedItem} onChange={handleChange}>
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        highlightedIndex,
        inputValue,
        isOpen,
        selectedItem: selectedItem2,
        setHighlightedIndex
      }) => {
        const { onBlur, onFocus, onChange, ...inputProps } = getInputProps({
          onKeyDown: (event: React.KeyboardEvent) => {
            if (isOpen) {
              if (event.key === 'Tab') {
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
          },
          placeholder
        })

        return (
          <div className={classes.container}>
            {renderInput({
              fullWidth: true,
              classes,
              label,
              InputLabelProps: getLabelProps({ shrink: true } as GetLabelPropsOptions),
              InputProps: {
                inputRef,
                onBlur,
                onFocus,
                onChange
              },
              inputProps
            })}

            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper className={classes.paper} square>
                  {getSuggestions(inputValue).map((suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion.label }),
                      highlightedIndex,
                      selectedItem2
                    })
                  )}
                </Paper>
              ) : null}
            </div>
          </div>
        )
      }}
    </Downshift>
  )
}
