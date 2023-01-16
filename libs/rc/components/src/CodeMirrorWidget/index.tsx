/* eslint-disable max-len */
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import './type.d'
import * as CodeMirror from 'codemirror'

import * as UI from './styledComponents'
import * as DiffMatchPatch from 'diff-match-patch'
import * as MergeViewCodeMirror from 'merge-view-codemirror'
import { MergeView, MergeViewConfiguration } from 'codemirror/addon/merge/merge.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/mode/overlay'
import _ from 'lodash'


interface CodeMirrorData {
  clis: string
  configOptions?: CodeMirror.EditorConfiguration
}

interface MergeData {
  left: string
  right: string
}

interface CodeMirrorWidgetProps {
  data:CodeMirrorData | MergeData
  type:string
  size?: {
    height?:string
    width?:string
  }
}

export const CodeMirrorWidget = forwardRef((props:CodeMirrorWidgetProps, ref) => {
  const { type, data, size } = props
  const [readOnlyCodeMirror, setReadOnlyCodeMirror] = useState(null as unknown as CodeMirror.EditorFromTextArea)
  const [mergeView, setMergeView] = useState(null as unknown as MergeView)
  const height = size?.height || '450px'
  const width = size?.width || '100%'

  const htmlDecode = (code: string) => {
    let div = document.createElement('div')
    div.innerHTML = code
    return div.innerText || div.textContent
  }

  const initSingleView = (data: CodeMirrorData) => {
    const target = document.getElementById('codeView') as HTMLTextAreaElement
    const code = htmlDecode(data.clis)
    const configOptions = data.configOptions
    if (target) {
      target['value'] = code as string
      const tmpReadOnlyCodeMirror = CodeMirror.fromTextArea(
        target
        , configOptions ? configOptions :{
          readOnly: true,
          lineNumbers: true,
          lineWrapping: true
        }
      )
      setReadOnlyCodeMirror(tmpReadOnlyCodeMirror)
    }
  }

  useImperativeHandle(ref, () => ({
    highlightLine (line:number) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption('styleActiveLine', true)
        readOnlyCodeMirror.setCursor(line)
      }
    },
    removeHighlightLine () {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption('styleActiveLine', false)
      }
    }
  }))

  const initNode = () => {
    const container = document.getElementById('codeViewContainer')
    while (container?.firstChild) {
      container.removeChild(container?.firstChild)
    }
    const codeNode = document.createElement('div')
    codeNode.id = 'codeView'
    container?.appendChild(codeNode)
  }

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

  // useEffect(() => {
  //   if (mergeView) {
  //     resizeMergeViewHeight(mergeView)
  //   }
  // }, [mergeView])

  const initMergeView = (data: MergeData) => { 
    MergeViewCodeMirror.init(CodeMirror, DiffMatchPatch)
    const target = document.getElementById("codeView") as HTMLElement
    if (target) {
      const view = CodeMirror.MergeView(target, {
        readOnly: true,
        lineNumbers: true,
        value: htmlDecode(data.left) as string,
        orig: htmlDecode(data.right) as string,
        mode: "text/html",
        highlightDifferences: true,
        connect: 'align',
        collapseIdentical: false,
        revertButtons: false,
      } as MergeViewConfiguration)
      setMergeView(view)
      // resizeMergeViewHeight(view)
    } 
  }
  const resizeMergeViewHeight = (mergeView:any) => {
    if (mergeView.leftOriginal()) {
      mergeView.leftOriginal()?.setSize(null, height);
    }
    if (mergeView.rightOriginal()) {
      mergeView.rightOriginal()?.setSize(null, height);
    }
    mergeView.editor().setSize(null, height);
    mergeView.wrap.style.height = height + "px";
  }

  return (
    <UI.Container>
      <div id='codeViewContainer'></div>
    </UI.Container>
  )
})
