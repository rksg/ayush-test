import { forwardRef, MutableRefObject, useEffect, useImperativeHandle, useState } from 'react'
import './type.d'
import * as CodeMirror from 'codemirror'
// import * as DiffMatchPatch from 'diff-match-patch' TODO: Backup feature
// import * as MergeViewCodeMirror from 'merge-view-codemirror'
// import { MergeViewConfiguration } from 'codemirror/addon/merge/merge.js' 
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/mode/overlay';
import * as UI from './styledComponents'

interface CodeMirrorWidgetProps {
  data:any
  type:string 
  size?: {
    height?:string
    width?:string
  }
}

export const CodeMirrorWidget = forwardRef((props:CodeMirrorWidgetProps, ref) => {
  const { type, data, size } = props
  const [readOnlyCodeMirror, setReadOnlyCodeMirror] = useState(null as any)
  const height = size?.height || '450px'
  const width = size?.width || '100%' 
  
  const htmlDecode = (s:any) => {
    var div = document.createElement('div');
    div.innerHTML = s;
    return div.innerText || div.textContent;
  }

  const initSingleView = (data: any) => {
    const target = document.getElementById("codeView") as HTMLTextAreaElement
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

    highlightLine(line:number) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption("styleActiveLine", true);
        readOnlyCodeMirror.setCursor(line);
      }
    },
    removeHighlightLine(line:number) {
      if (readOnlyCodeMirror) {
        readOnlyCodeMirror.setOption("styleActiveLine", false);
      }
    }

  }))

  useEffect(() => {
    if (type === 'single' && data.clis) {
      console.log(data.clis)
      const container = document.getElementById("codeViewContainer")
      while (container?.firstChild) {
        container.removeChild(container?.firstChild);
      }
      const codeNode = document.createElement("div")
      codeNode.id = 'codeView'
      container?.appendChild(codeNode)
      initSingleView(data)
    }
  }, [data])

  useEffect(() => {
    if (readOnlyCodeMirror) {
      readOnlyCodeMirror.setSize(width, height)
    }
  }, [readOnlyCodeMirror])

  // const initMergeView = () => { TODO: Backup feature
  //   MergeViewCodeMirror.init(CodeMirror, DiffMatchPatch)
  //   const target = document.getElementById("codeView") as HTMLElement
  //   if (target) {
  //     CodeMirror.MergeView(target, {
  //       readOnly: true,
  //       lineNumbers: true,
  //       value: htmlDecode('newContent') as string, // left
  //       orig: htmlDecode('right') as string,// right
  //       mode: "text/html",
  //       highlightDifferences: true,
  //       connect: 'align',
  //       collapseIdentical: false,
  //       revertButtons: false,
  //     } as MergeViewConfiguration)
  //   }
  // }
  
  return (
    <UI.Container>
      <div id="codeViewContainer"></div>
    </UI.Container>
  )
})
