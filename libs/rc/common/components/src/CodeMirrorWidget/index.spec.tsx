import React from 'react'

import { Provider  }   from '@acx-ui/store'
import { render, act } from '@acx-ui/test-utils'

import { CodeMirrorWidget } from '.'

const mockFromTextArea = jest.fn().mockReturnValue({
  setSize: jest.fn(),
  setOption: jest.fn(),
  setCursor: jest.fn(),
  setValue: jest.fn(),
  refresh: jest.fn(),
  focus: jest.fn(),
  getWrapperElement: () => ({ style: { fontSize: '12px' } })
})
const mockCodeMirrorMergeViewInit = jest.fn()
jest.mock('codemirror', () => ({
  ...jest.requireActual('codemirror'),
  fromTextArea: () => mockFromTextArea,
  MergeView: () => mockCodeMirrorMergeViewInit
}))

describe('CodeMirror Widget', () => {
  it('should render single type correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const data = {
      clis: 'test code'
    }
    const codeMirrorEl = React.createRef()
    render(<Provider>
      <CodeMirrorWidget ref={codeMirrorEl} type='single' data={data} />
    </Provider>,
    { route: { params } })
    expect(mockFromTextArea).toBeCalled()
    const highlightLine = jest.spyOn(codeMirrorEl.current, 'highlightLine')
    const removeHighlightLine = jest.spyOn(codeMirrorEl.current, 'removeHighlightLine')
    const getInstance = jest.spyOn(codeMirrorEl.current, 'getInstance')
    const setValue = jest.spyOn(codeMirrorEl.current, 'setValue')
    const changeFontSize = jest.spyOn(codeMirrorEl.current, 'changeFontSize')
    act(() => {
      codeMirrorEl.current?.highlightLine(1)
      codeMirrorEl.current?.removeHighlightLine()
      codeMirrorEl.current?.getInstance()
      codeMirrorEl.current?.setValue('code')
      codeMirrorEl.current?.changeFontSize(16)
    })
    expect(highlightLine).toBeCalled()
    expect(removeHighlightLine).toBeCalled()
    expect(getInstance).toBeCalled()
    expect(setValue).toBeCalled()
    expect(changeFontSize).toBeCalled()
  })

  it('should render single type custom configOptions correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const data = {
      clis: 'test code',
      configOptions: {
        readOnly: false
      }
    }
    const codeMirrorEl = React.createRef()
    render(<Provider>
      <CodeMirrorWidget ref={codeMirrorEl} type='single' data={data} />
    </Provider>,
    { route: { params } })
    expect(mockFromTextArea).toBeCalled()
  })

  it('should render merge type correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const data = {
      left: 'cli_1',
      right: 'cli_2'
    }
    render(<Provider>
      <CodeMirrorWidget type='merge' containerId='mergeView' data={data} />
    </Provider>,
    { route: { params } })
    const container = document.querySelector('#mergeView > #codeView')
    expect(container).toBeVisible()
  })

  it('should render cli type correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const cliCodeMirrorEl = React.createRef()
    render(<Provider>
      <CodeMirrorWidget
        type='cli'
        containerId='previewContainerId'
        skipDecode={true}
        ref={cliCodeMirrorEl}
        data={{
          clis: 'test cli',
          configOptions: {
            readOnly: true
          }
        }}
      />
    </Provider>,
    { route: { params } })
    expect(mockFromTextArea).toBeCalled()
  })
})

