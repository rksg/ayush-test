import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import './type.d'
import * as CodeMirror from 'codemirror'
import * as DiffMatchPatch from 'diff-match-patch'
import * as MergeViewCodeMirror from 'merge-view-codemirror'
import { MergeViewConfiguration } from 'codemirror/addon/merge/merge.js'
import * as UI from './styledComponents'

export function CodeMirrorWidget (props:{data:unknown}) {
  const { $t } = useIntl()
  const { data } = props
  const htmlDecode = (s:any) => {
    var div = document.createElement('div');
    div.innerHTML = s;
    return div.innerText || div.textContent;
  }
  const initUI = () => {
    MergeViewCodeMirror.init(CodeMirror, DiffMatchPatch)
    const target = document.getElementById("codeView") as HTMLElement
    if (target) {
      CodeMirror.MergeView(target, {
        readOnly: true,
        lineNumbers: true,
        value: htmlDecode('newContent') as string, // left
        orig: htmlDecode('right') as string,// right
        mode: "text/html",
        highlightDifferences: true,
        connect: 'align',
        collapseIdentical: false,
        revertButtons: false,
        styleActiveLine: true,
      } as MergeViewConfiguration)
    }
  }

  useEffect(() => {
    if (data) {
      initUI()
    }
  }, [data])
  
  return (
    <UI.Container>
      <div id="codeView"></div>
    </UI.Container>
  )
}
