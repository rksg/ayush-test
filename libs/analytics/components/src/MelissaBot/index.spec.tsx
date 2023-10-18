/* eslint-disable max-len */

import { act, render } from '@acx-ui/test-utils'

import { MelissaBot } from '.'

describe('MelissaBot', () => {
  const route = {
    path: '/:tenantId/:tenantType/:page',
    params: { tenantType: 't', tenantId: 't-id', page: 'dashboard' },
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
  it('should render',()=>{
    const { asFragment } = render(<MelissaBot/>,{ route })
    act(()=>{
      expect(asFragment()).toMatchSnapshot()
    })
  })
})