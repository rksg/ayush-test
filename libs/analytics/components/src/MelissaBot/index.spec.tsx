/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-unnecessary-act */

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { act, fireEvent, render, screen } from '@acx-ui/test-utils'

import { gptResponseBody, responseBody, uploadRes } from './__tests__/fixtures'

import { MelissaBot } from '.'
describe('MelissaBot', () => {
  const sessionTimeoutInSecs=2
  let container:HTMLDivElement|undefined=undefined
  // eslint-disable-next-line max-len
  const ERROR_MSG = 'Oops! We are currently experiencing unexpected technical difficulties. Please try again later.'
  const originalFetch = global.fetch
  const replaceTextareaStyles = (str:string|undefined) => {
    if(str){
      str = str.replaceAll(' overflow-x: hidden;','')
      str = str.replaceAll(' overflow-y: hidden;','')
      str = str.replaceAll(' resize: none;','')
    }
    return str
  }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    // setup a DOM element as a render target
    container = document.createElement('div')
    document.body.appendChild(container)
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(responseBody)
      })
    )
  })

  afterEach(() => {
  // cleanup on exiting
    container?.remove()
    container = undefined
    jest.clearAllMocks()
    global.fetch = originalFetch
  })
  const route = {
    path: '/:page',
    params: { page: 'incidents' },
    wrapRoutes: false
  }
  it('should render floating button',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML)).toMatchSnapshot()
  })
  it('should not render floating button for dashboard page',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML)).toMatchSnapshot()
  })
  it('should not render floating button for dashboard page and'+
  ' open chatbot on trigger event',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('before:event')
    act(() => { window.dispatchEvent(new CustomEvent('showMelissaBot',{ detail: {
      isRecurringUser: false,
      summary: ''
    } })) })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:event')
  })
  it('should not render floating button for dashboard page and'+
  ' open chatbot on trigger event with summary',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('before:event')
    act(() => { window.dispatchEvent(new CustomEvent('showMelissaBot',{ detail: {
      isRecurringUser: true,
      summary: 'summary'
    } })) })
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:event')
  })
  it('should open the chat window by clicking floating button and then close',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:open')
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('CloseSymbol'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeNull()
    expect(document.querySelector('.ant-drawer-content-wrapper-hidden')).toBeDefined()
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:close')
  })
  it('should chat with chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findAllByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML)).toMatchSnapshot()
  })
  it('should chat with chatbot in general mode',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findAllByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('data-mode')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(gptResponseBody)
      })
    )
    await act(async ()=>{
      fireEvent.click(await screen.findByLabelText('General'))
    })
    await act(async ()=>{
      const textbox=screen.getByRole('textbox')
      userEvent.clear(textbox)
      await userEvent.type(textbox,'How does wifi works?{enter}')
    })
    await screen.findAllByText('How does wifi works?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(10)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('general-mode')
    await act(async ()=>{
      fireEvent.click(await screen.findByLabelText('My Network'))
    })
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(11)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('switch-back-to-my-network-mode')
  })
  it('should chat with chatbot in general mode and handle DF session timeout',async ()=>{
    await act(async ()=>{
      render(<MelissaBot sessionTimeoutInSecs={sessionTimeoutInSecs}/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findAllByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('data-mode')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(gptResponseBody)
      })
    )
    await act(async ()=>{
      fireEvent.click(await screen.findByLabelText('General'))
    })
    await act(async ()=>{
      const textbox=screen.getByRole('textbox')
      userEvent.clear(textbox)
      await userEvent.type(textbox,'How does wifi works?{enter}')
    })
    await screen.findAllByText('How does wifi works?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(10)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('general-mode')
    await new Promise((r) => setTimeout(r, (sessionTimeoutInSecs + 2) * 1000))
    await screen.findByText('Session Timed out.')
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after-session-timeout')
  })
  it('should chat with chatbot in my network mode and handle DF session timeout',async ()=>{
    await act(async ()=>{
      render(<MelissaBot sessionTimeoutInSecs={sessionTimeoutInSecs}/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findAllByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('data-mode')
    await new Promise((r) => setTimeout(r, (sessionTimeoutInSecs + 2) * 1000))
    const timeoutText=screen.queryByText('Session Timed out.')
    expect(timeoutText).not.toBeInTheDocument()
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after-session-timeout')
  })
  it('should handle error message from chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('before:error')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Some Error' })
      })
    )
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findAllByText('What is cloud RRM?')
    await screen.findByText(ERROR_MSG)
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(5)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:error1')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ errorMessage: 'Some different error' })
      })
    )
    await act(async ()=>{
      const textbox=screen.getByRole('textbox')
      await userEvent.clear(textbox)
      await userEvent.type(textbox,'What is datastudio?{enter}')
    })
    await screen.findAllByText('What is datastudio?')
    await screen.findAllByText(ERROR_MSG)
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(replaceTextareaStyles(document.querySelector('body')?.innerHTML))
      .toMatchSnapshot('after:error2')
  })
  it('should handle file upload from chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve( { queryResult: { fulfillmentMessages: uploadRes } })
      })
    )
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'support{enter}')
    })
    await screen.findAllByText('support')
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('button-link'))
    })
    await act(async ()=>{
      const textFile = new File(['someTextFile'], 'text.txt', { type: 'text/plain' })
      fireEvent.change(await screen.findByTestId('uploader'), { target: { files: [textFile] } })
    })
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Some Error.'))
    )
    await act(async ()=>{
      const textFile = new File(['someTextFile'], 'text.txt', { type: 'text/plain' })
      fireEvent.change(await screen.findByTestId('uploader'), { target: { files: [textFile] } })
    })
  })
})
