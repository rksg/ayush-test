import { rest } from 'msw'

import { Urls }           from '@acx-ui/rbac'
import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { FetchBot } from './index'

const tenantId = 'a27e3eb0bd164e01ae731da8d976d3b1'
const params = { tenantId }

describe('FetchBot',()=>{
  it('should render without button visible',()=>{
    const { asFragment } = render(<FetchBot showFloatingButton={false}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger the chat onClick of the floating button and events',async ()=>{
    const mockChatFn = jest.fn()
    const mockStausFn = jest.fn()
    window.tdi = {
      chat: undefined
    }
    const { asFragment } = render(<FetchBot statusCallback={mockStausFn}/>)
    expect(asFragment()).toMatchSnapshot('init')
    act(()=>{
      window.tdiConfig.events.start()
    })
    expect(mockStausFn).toBeCalledWith('start')
    expect(asFragment()).toMatchSnapshot('after-start')
    act(()=>{
      window.tdiConfig.events.ready()
    })
    expect(mockStausFn).toBeCalledWith('ready')
    expect(asFragment()).toMatchSnapshot('after-ready')
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockChatFn).toBeCalledTimes(0)
    window.tdi = {
      chat: mockChatFn
    }
    fireEvent.click(button)
    expect(mockChatFn).toBeCalledTimes(1)
    act(()=>{
      window.tdiConfig.events.chatting()
    })
    expect(mockStausFn).toBeCalledWith('chatting')
    expect(asFragment()).toMatchSnapshot('after-chatting')
    act(()=>{
      window.tdiConfig.events.disabled()
    })
    expect(mockStausFn).toBeCalledWith('disabled')
    expect(asFragment()).toMatchSnapshot('after-disabled')
    act(()=>{
      window.tdiConfig.events.error({
        data: { error: 'some-error' }
      })
    })
    expect(mockStausFn).toBeCalledWith('error')
    expect(asFragment()).toMatchSnapshot('after-error')
  })
  it('should return proper auth-token while calling generateToken method', async ()=>{
    mockServer.use(
      rest.get(
        Urls.getUserProfile.url,
        (_, res, ctx) => res(ctx.json({ externalId: 'external-user-id' }))
      ),
      rest.post(
        CommonUrlsInfo.fetchBotAuth.url,
        (_, res, ctx) => res(ctx.json({ idToken: 'fetchbot-token' }))
      )
    )
    const mockStausFn = jest.fn()
    const mockTokenCallback = jest.fn()
    render(<Provider>
      <FetchBot statusCallback={mockStausFn}/>
    </Provider>, { route: { params } })
    window.generateToken && window.generateToken((token:string,error:string,details:unknown)=>{
      mockTokenCallback({
        token,
        error,
        details
      })
    })
    await waitFor(()=>{
      expect(mockStausFn).toBeCalledWith('user-profile-success')
    })
    await waitFor(()=>{
      expect(mockStausFn).toBeCalledWith('token-success')
    })
    expect(mockTokenCallback).toBeCalledWith({
      token: 'fetchbot-token',
      error: null,
      details: { contactId: 'external-user-id' }
    })
  })
  it('should throw error while calling user profile api', async ()=>{
    mockServer.use(
      rest.get(
        Urls.getUserProfile.url,
        (_, res) => res.networkError('Failed to connect')
      )
    )
    const mockStausFn = jest.fn()
    const mockTokenCallback = jest.fn()
    render(<Provider>
      <FetchBot statusCallback={mockStausFn}/>
    </Provider>, { route: { params } })
    window.generateToken && window.generateToken((token:string,error:Error,details:unknown)=>{
      mockTokenCallback({
        token,
        error: error.message,
        details
      })
    })
    await waitFor(()=>{
      expect(mockStausFn).toBeCalledWith('user-profile-error')
    })
    expect(mockTokenCallback).toBeCalledWith({
      token: '',
      error: 'Network request failed',
      details: {}
    })
  })
  it('should throw error while calling generateToken method', async ()=>{
    mockServer.use(
      rest.get(
        Urls.getUserProfile.url,
        (_, res, ctx) => res(ctx.json({ externalId: 'external-user-id' }))
      ),
      rest.post(
        CommonUrlsInfo.fetchBotAuth.url,
        (_, res) => res.networkError('Failed to connect')
      )
    )
    const mockStausFn = jest.fn()
    const mockTokenCallback = jest.fn()
    render(<Provider>
      <FetchBot statusCallback={mockStausFn}/>
    </Provider>, { route: { params } })
    window.generateToken && window.generateToken((token:string,error:Error,details:unknown)=>{
      mockTokenCallback({
        token,
        error: error.message,
        details
      })
    })
    await waitFor(()=>{
      expect(mockStausFn).toBeCalledWith('token-error')
    })
    expect(mockTokenCallback).toBeCalledWith({
      token: '',
      error: 'Network request failed',
      details: {}
    })
  })
})
