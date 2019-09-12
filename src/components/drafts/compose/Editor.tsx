import { Box } from '@material-ui/core'
import { EditorState } from 'draft-js'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin-es6'
import createPrismPlugin from 'draft-js-prism-plugin-ng'
import PluginEditor from 'draft-js-plugins-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-scala'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-typescript'
import * as React from 'react'
import './Draft.css'
import './normalize.css'
import './prism.css'
import styles from './styles.module.css'

interface Language {
  label: string
  value: string
}

interface RenderProps {
  options: Array<Language>
  onChange: () => void
  selectedValue: string
  selectedLabel: string
}

const renderLanguageSelect: React.FC<RenderProps> = ({
  options,
  onChange,
  selectedValue,
  selectedLabel
}) => (
  <div className={styles.switcherContainer}>
    <div className={styles.switcher}>
      <select className={styles.switcherSelect} value={selectedValue} onChange={onChange}>
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className={styles.switcherLabel}>
        {selectedLabel}
        {String.fromCharCode(9662)}
      </div>
    </div>
  </div>
)

const languages = {
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  java: 'Java',
  js: 'JavaScript',
  json: 'JSON',
  kotlin: 'Kotlin',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  scala: 'Scala',
  sql: 'SQL',
  swift: 'Swift',
  typescript: 'Typescript'
}

const editorPlugins = [
  createPrismPlugin({ prism: Prism }),
  createLinkifyPlugin(),
  createMarkdownPlugin({ renderLanguageSelect, languages })
]

interface Props {
  placeholder: string
  editorState: EditorState
  onChange: (arg0: EditorState) => void
  readOnly?: boolean
}

export const Editor: React.FC<Props> = ({ placeholder, editorState, onChange, readOnly }) => {
  const editor = React.useRef(null)

  function focusEditor() {
    if (
      editor !== null &&
      editor !== undefined &&
      editor.current !== null &&
      editor.current !== undefined
    ) {
      editor.current.focus()
    }
  }

  React.useEffect(() => {
    focusEditor()
  }, [])

  return (
    <Box>
      <PluginEditor
        ref={editor}
        editorState={editorState}
        plugins={editorPlugins}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck
        readOnly={readOnly}
      />
    </Box>
  )
}

Editor.defaultProps = {
  readOnly: false
}
