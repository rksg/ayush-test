import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { fulfillmentMessagesWithAccordion } from './stories/Accordion'

import { Conversation, Content } from '.'

const contentUser = 'List zones with higher co-channel interference in 2.4 GHz band'
const fulfillmentMessages = [
  {
    text: {
      text: [
        `What do you want the "Subject" of this support case to say?\nFor example: 
        " Report Data Missing" or "Asset not updating"`
      ]
    },
    message: 'text'
  },
  {
    text: {
      text: [
        '\nResponse from Gen AI'
      ]
    },
    message: 'text'
  }
]

const fulfillmentMessagesWithLink = [
  {
    text: {
      text: [
        `There are 99 switchs having a name similar to "icx".
        \n            Showing C0:C5:20:82:3D:86 found in `
      ]
    }
  },
  {
    text: {
      text: [
        `Switch Name: Access-AP-New
        \n  MAC Address: C0:C5:20:82:3D:86
        \n  Switch IP: 10.157.7.55
        \n  Switch Serial: FNG4348S01Z
        \n  Switch Status: ONLINE
        \n  Up Time: 0\n  Connected wired devices: 0
        \n  CPU utilization: 0%\n  Memory utilization: 0%\n  PoE utilization: 0%`
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
            text: 'Go to Switch Report',
            event: {
              parameters: {
                url: `/analytics/report/switch/C0:C5:20:82:3D:86?date=
                eyJyYW5nZSI6IkN1c3RvbSIsImVuZERhdGUiOiIyMDIzLTEwLTEwVDA4OjQ5OjEzL
                jMyNFoiLCJzdGFydERhdGUiOiIyMDIzLTEwLTA5VDA4OjQ5OjEzLjMyNFoifQ==`
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
            // eslint-disable-next-line max-len
            link: '<origin>https://slack.com/oauth/v2/authorize?scope=app_mentions%3Aread%2Ccalls%3Aread%2Ccalls%3Awrite%2Cchannels%3Ahistory%2Cchannels%3Aread%2Cchat%3Awrite%2Cgroups%3Ahistory%2Cim%3Ahistory%2Cim%3Aread%2Cim%3Awrite%2Cincoming-webhook%2Cmpim%3Ahistory%2Cmpim%3Aread%2Cteam%3Aread%2Cusers%3Aread%2Cusers%3Aread.email&state=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0YWxsT3B0aW9ucyI6eyJzY29wZXMiOlsiYXBwX21lbnRpb25zOnJlYWQiLCJjYWxsczpyZWFkIiwiY2FsbHM6d3JpdGUiLCJjaGFubmVsczpoaXN0b3J5IiwiY2hhbm5lbHM6cmVhZCIsImNoYXQ6d3JpdGUiLCJncm91cHM6aGlzdG9yeSIsImltOmhpc3RvcnkiLCJpbTpyZWFkIiwiaW06d3JpdGUiLCJpbmNvbWluZy13ZWJob29rIiwibXBpbTpoaXN0b3J5IiwibXBpbTpyZWFkIiwidGVhbTpyZWFkIiwidXNlcnM6cmVhZCIsInVzZXJzOnJlYWQuZW1haWwiXX0sIm5vdyI6IjIwMjMtMTAtMTlUMDY6NDU6NDMuMzg5WiIsImlhdCI6MTY5NzY5Nzk0M30.Gs2MsMlw2Jw3vLERcbkQZcjIBRp2d5bmW0r2qvP3pm0&client_id=2621849627333.2623441836566',
            type: 'button',
            icon: {
              color: '#42a5f5',
              type: 'launch'
            },
            text: 'Add to Slack'
          }
        ]
      ]
    }
  }
]

const fulfillmentMessagesWithButton = [
  {
    text: {
      text: [
        'case 01103627 created!'
      ]
    }
  },
  {
    data: {
      incidentId: 'e5a7a270-673f-11ee-918c-12551eae31ca'
    }
  },
  {
    payload: {
      richContent: [
        [
          {
            type: 'button',
            text: 'If you have log files, click to upload',
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

const fulfillmentMessagesWithList = [
  {
    text: {
      text: [
        'I found 1 clients in the network for the period of Nov 02 2023 09:41 to Nov 03 2023 09:41'
      ]
    }
  },
  {
    payload: {
      richContent: [
        [
          {
            event: {
              parameters: {},
              languageCode: 'en',
              name: 'OS'
            },
            title: 'Click here to view clients by OS type',
            type: 'list'
          },
          {
            event: {
              parameters: {},
              languageCode: 'en',
              name: 'Band'
            },
            title: 'Click here to view clients by band',
            type: 'list'
          },
          {
            event: {
              parameters: {},
              languageCode: 'en',
              name: 'Auth'
            },
            title: 'Click here to view clients by Auth method',
            type: 'list'
          }
        ]
      ]
    }
  }
]

const contentData:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessages }
  ]
const contentDataFromRuckusAi:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', isRuckusAi: true, contentList: fulfillmentMessages }
  ]
const contentLink:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithLink }
  ]
const contentButton:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithButton }
  ]
const contentAccordion:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithAccordion }
  ]
const contentList:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithList }
  ]
describe('Conversation component', () => {
  it('should render Conversation component with text', () => {
    render(<Conversation content={contentData}
      classList='conversation'
      isReplying={false}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}
    />)
    expect(screen.getByText('List zones with higher co-channel interference in 2.4 GHz band')
    ).toBeVisible()
  })
  it('should render Conversation component with text form RuckusAI', () => {
    render(<Conversation content={contentDataFromRuckusAi}
      classList='conversation'
      isReplying={false}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}
    />)
    expect(screen.getAllByText('RUCKUS AI').length).toBe(2)
  })
  it('should render Conversation component with link', () => {
    render(<BrowserRouter><Conversation content={contentLink}
      classList='conversation'
      isReplying={false}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/></BrowserRouter>)
    expect(screen.getByText('Go to Switch Report')).toBeVisible()
  })
  it('should render Conversation component with button', () => {
    render(<Conversation content={contentButton}
      classList='conversation'
      isReplying={false}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    expect(screen.getByText('If you have log files, click to upload')).toBeVisible()
  })
  it('should render Conversation component with Accordion', () => {
    render(<Conversation content={contentAccordion}
      classList='conversation'
      isReplying={false}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    expect(screen.getByText('Chart For Top Applications by Traffic')).toBeVisible()
  })
  it('should render Conversation component with typing', () => {
    render(<Conversation content={contentData}
      classList='conversation'
      isReplying={true}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    expect(screen.getByText('List zones with higher co-channel interference in 2.4 GHz band'))
      .toBeVisible()
  })
  it('should render Conversation component with List', async () => {
    render(<Conversation content={contentList}
      classList='conversation'
      isReplying={true}
      listCallback={jest.fn()}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    await screen.findByText('Click here to view clients by OS type')
    fireEvent.click(screen.getByText('Click here to view clients by OS type'))
    expect(screen.getByText('Click here to view clients by OS type'))
      .toBeVisible()
  })
})
