/* eslint-disable max-len */
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import './type.d'
import * as CodeMirror            from 'codemirror'
import { MergeViewConfiguration } from 'codemirror/addon/merge/merge.js'
import * as DiffMatchPatch        from 'diff-match-patch'
import _                          from 'lodash'
import * as MergeViewCodeMirror   from 'merge-view-codemirror'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/mode/overlay'

import * as UI from './styledComponents'

interface CodeMirrorData {
  clis: string
  configOptions?: CodeMirror.EditorConfiguration
}

interface MergeData {
  left: string
  right: string
}

interface CodeMirrorWidgetProps {
  data: CodeMirrorData | MergeData
  type: 'single' | 'merge' | 'cli'
  size?: {
    height?: string
    width?: string
  }
  containerId?: string
}

CodeMirror.defineMode('cliMode', function () {
  return {
    token: function (stream) {
      if (stream.match(/^\${[^{}]*}/)) {
        return 'variable'
      } else if (stream.match(/<([^>]*)>/)) {
        return 'attribute'
      } else {
        stream.next()
        return null
      }
    }
  }
})

export const CodeMirrorWidget = forwardRef((props: CodeMirrorWidgetProps, ref) => {
  const { type, data, size, containerId } = props
  const [readOnlyCodeMirror, setReadOnlyCodeMirror] = useState(null as unknown as CodeMirror.EditorFromTextArea)
  const codeViewContainerId = containerId ?? 'codeViewContainer'
  const height = size?.height || '450px'
  const width = size?.width || '100%'

  const htmlDecode = (code: string) => {
    let div = document.createElement('div')
    div.innerHTML = code
    return div.innerText || div.textContent
  }

  const initSingleView = (data: CodeMirrorData) => {
    const target = document.querySelector(`#${codeViewContainerId} > #codeView`) as HTMLTextAreaElement
    const code = htmlDecode(data.clis)
    const configOptions = data.configOptions
    if (target) {
      target['value'] = code as string
      const tmpReadOnlyCodeMirror = CodeMirror.fromTextArea(
        target
        , configOptions ? configOptions : {
          readOnly: true,
          lineNumbers: true,
          lineWrapping: true
        }
      )
      setReadOnlyCodeMirror(tmpReadOnlyCodeMirror)
    }
  }

  useImperativeHandle(ref, () => ({
    highlightLine (line: number) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption('styleActiveLine', true)
        readOnlyCodeMirror.setCursor(line)
      }
    },
    removeHighlightLine () {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption('styleActiveLine', false)
      }
    },
    getInstance () {
      return readOnlyCodeMirror
    },
    setValue (value: string) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setValue(value)
        setTimeout(function () {
          readOnlyCodeMirror.refresh()
          readOnlyCodeMirror.focus()
        }, 100)
      }
    },
    changeFontSize (size: string) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.getWrapperElement().style.fontSize = size + 'px'
      }
    }
  }))

  const initNode = () => {
    const container = document.getElementById(codeViewContainerId)
    while (container?.firstChild) {
      container.removeChild(container?.firstChild)
    }
    const codeNode = document.createElement('div')
    codeNode.id = 'codeView'
    container?.appendChild(codeNode)
  }

  useEffect(() => {
    if (type === 'cli') {
      initNode()
      initSingleView(data as CodeMirrorData)
    }
  }, [])

  useEffect(() => {
    if (type === 'single' && _.get(data, 'clis')) {
      initNode()
      initSingleView(data as CodeMirrorData)
    } else if (type === 'merge') {
      initNode()
      initMergeView(data as MergeData)
    }
  }, [data])

  useEffect(() => {
    if (readOnlyCodeMirror) {
      readOnlyCodeMirror.setSize(width, height)
    }
  }, [readOnlyCodeMirror])

  const initMergeView = (data: MergeData) => {
    MergeViewCodeMirror.init(CodeMirror, DiffMatchPatch)
    const target = document.getElementById('codeView') as HTMLElement
    if (target) {
      CodeMirror.MergeView(target, {
        readOnly: true,
        lineNumbers: true,
        value: htmlDecode(data.left) as string,
        orig: htmlDecode(data.right) as string,
        mode: 'text/html',
        highlightDifferences: true,
        connect: 'align',
        collapseIdentical: false,
        revertButtons: false
      } as MergeViewConfiguration)
    }
  }

  return (
    <UI.Container>
      <div id={codeViewContainerId}></div>
    </UI.Container>
  )
})