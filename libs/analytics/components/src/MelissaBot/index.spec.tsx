/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-unnecessary-act */

import userEvent from '@testing-library/user-event'

import { act, fireEvent, render, screen } from '@acx-ui/test-utils'

import { MelissaBot } from '.'

describe('MelissaBot', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let container:HTMLDivElement|undefined=undefined
  beforeEach(() => {
  // setup a DOM element as a render target
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
  // cleanup on exiting
    container?.remove()
    container = undefined
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route = {
    path: '/:page',
    params: { page: 'incidents' },
    wrapRoutes: false
  }
  const responseBody = {
    queryResult: {
      fulfillmentMessages: [
        {
          text: {
            text: [
              'There are 24 clients similar to iphone.\nShowing the last active one'
            ]
          }
        },
        {
          text: {
            text: [
              // eslint-disable-next-line max-len
              'Here is the summary of client 02:DA:F2:F1:C5:AA from Oct 16 2023 16:58 to Oct 17 2023 16:58:'
            ]
          }
        },
        {
          text: {
            text: [
              // eslint-disable-next-line max-len
              '  Client IP: 10.111.111.193\n       Hostname: 02:da:f2:f1:c5:aa\n       Username: aaron\n       MAC Address: 02:DA:F2:F1:C5:AA\n       Last AP Name: Aaron_Home_H550_GstBdr\n       Last AP Mac: 80:BC:37:01:1F:E0\n       Last Status: Connected\n       OS: Apple iPhone/iOS 17.0.3\n\n       Average Rate: 96.1Kbps\n       Total Traffic: 962 MB\n       Average Sessions Length: 1m 54s\n       Applications: null\n       APs Connected: 4\n       Sessions: 440\n\n       Average SNR: 39 dB\n       Max SNR: 43 dB\n       Min SNR: 36 dB\n\n       Average RSS: -57 dBm\n       Max RSS: -53 dBm\n       Min RSS: -60 dBm\n    '
            ]
          }
        },
        {
          payload: {
            richContent: [
              [
                {
                  link: '',
                  type: 'button',
                  icon: {
                    color: '#42a5f5',
                    type: 'launch'
                  },
                  text: 'Go to Client Troubleshooting',
                  event: {
                    parameters: {
                      // eslint-disable-next-line max-len
                      url: '/analytics/client/02:DA:F2:F1:C5:AA?date=eyJyYW5nZSI6IkN1c3RvbSIsImVuZERhdGUiOiIyMDIzLTEwLTE3VDExOjI4OjAwLjAwMFoiLCJzdGFydERhdGUiOiIyMDIzLTEwLTE2VDExOjI4OjAwLjAwMFoifQ=='
                    },
                    name: 'url',
                    languageCode: 'en'
                  }
                }
              ]
            ]
          }
        },
        {
          payload: {
            richContent: [
              [
                {
                  link: '',
                  type: 'button',
                  icon: {
                    color: '#42a5f5',
                    type: 'launch'
                  },
                  text: 'Go to Client Report',
                  event: {
                    parameters: {
                      // eslint-disable-next-line max-len
                      url: '/analytics/report/client/02:DA:F2:F1:C5:AA?date=eyJyYW5nZSI6IkN1c3RvbSIsImVuZERhdGUiOiIyMDIzLTEwLTE3VDExOjI4OjAwLjAwMFoiLCJzdGFydERhdGUiOiIyMDIzLTEwLTE2VDExOjI4OjAwLjAwMFoifQ=='
                    },
                    name: 'url',
                    languageCode: 'en'
                  }
                }
              ]
            ]
          }
        }
      ]
    },
    agentId: 'melissa-agent'
  }
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(responseBody)
    })
  )
  it('should render floating button',async ()=>{
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
    act(() => { window.dispatchEvent(new Event('showMelissaBot')) })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:event')
  })
  it('should open the chat window by clicking floating button and then close',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByRole('img'))
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
      fireEvent.click(await screen.findByRole('img'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    await act(async ()=>{
      await userEvent.type(screen.getByRole('textbox'),'What is cloud RRM?{enter}')
    })
    await screen.findByText('What is cloud RRM?')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(11)
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot()
  })
  it('should handle error message from chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByRole('img'))
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
    await screen.findByText('Some Error')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(7)
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
    await screen.findByText('Something went wrong.')
    expect(document.querySelectorAll('.conversation > div')?.length).toBe(9)
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot('after:error2')
  })
  it('should handle file upload from chatbot',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByRole('img'))
    })
    expect(document.querySelector('.ant-drawer-open')).toBeDefined()
    const uploadRes = [
      {
        text: {
          text: [
            'case 01103707 created!'
          ]
        }
      },
      false,
      {
        data: {
          incidentId: '029e0f12-7718-11ee-92ac-d618d1b3d6d9'
        }
      },
      {
        payload: {
          richContent: [
            [
              {
                type: 'button',
                text: 'If you have log files or screen shots to attach to your support case, click to upload',
                link: '',
                icon: {
                  type: 'chevron_right',
                  color: '#42A5F5'
                }
              }
            ]
          ]
        }
      }
    ]
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
      fireEvent.click(await screen.findByTestId('ArrowChevronRight'))
    })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot()
  })
})