/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-unnecessary-act */

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { act, fireEvent, render, screen } from '@acx-ui/test-utils'

import { responseBody, uploadRes } from './__tests__/fixtures'

import { MelissaBot } from '.'
describe('MelissaBot', () => {
  let container:HTMLDivElement|undefined=undefined
  // eslint-disable-next-line max-len
  const ERROR_MSG = 'Oops! We are currently experiencing unexpected technical difficulties. Please try again later.'
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
    expect(container).toMatchSnapshot()
  })
  it('should not render anything if chatbot FF disabled',async ()=>{
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    expect(container).toMatchSnapshot()
  })
  it('should not render floating button for dashboard page',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(container).toMatchSnapshot()
  })
  it('should not render floating button for dashboard page and'+
  ' open chatbot on trigger event',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('before:event')
    act(() => { window.dispatchEvent(new CustomEvent('showMelissaBot',{ detail: {
      isRecurringUser: false,
      summary: ''
    } })) })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:event')
  })
  it('should not render floating button for dashboard page and'+
  ' open chatbot on trigger event with summary',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route: { ...route, params: { page: 'dashboard' } }, container })
    })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('before:event')
    act(() => { window.dispatchEvent(new CustomEvent('showMelissaBot',{ detail: {
      isRecurringUser: true,
      summary: 'summary'
    } })) })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:event')
  })
  it('should open the chat window by clicking floating button and then close',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:open')
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('CloseSymbol'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeNull()
    expect(document.querySelector('.ant-drawer-content-wrapper-hidden')).toBeDefined()
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:close')
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
    await screen.findByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot()
  })
  it('should handle error message from chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByTestId('MelissaIcon'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('before:error')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Some Error' })
      })
    )
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findByText('What is cloud RRM?')
    await screen.findByText(ERROR_MSG)
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(5)
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:error1')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ errorMessage: 'Some different error' })
      })
    )
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is datastudio?{enter}')
    })
    await screen.findByText('What is datastudio?')
    await screen.findAllByText(ERROR_MSG)
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:error2')
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
    await screen.findByText('support')
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