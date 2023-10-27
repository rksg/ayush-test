/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable max-len */

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
              'Here is the summary of client 02:DA:F2:F1:C5:AA from Oct 16 2023 16:58 to Oct 17 2023 16:58:'
            ]
          }
        },
        {
          text: {
            text: [
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
  it('should open the chat window by clicking floating button',async ()=>{
    await act(async ()=>{
      render(<MelissaBot/>,{ route, container })
    })
    await act(async ()=>{
      fireEvent.click(await screen.findByRole('img'))
    })
    expect(document.querySelector('body')?.innerHTML).toMatchSnapshot()
  })
})