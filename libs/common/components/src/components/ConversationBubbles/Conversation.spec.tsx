import { render, screen } from '@testing-library/react'

import { Conversation, content } from '.'

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

const contentData:content[] =
  [ { type: 'user', isReplying: false, contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', isReplying: false, contentList: fulfillmentMessages }
  ]
const contentLink:content[] =
  [ { type: 'user', isReplying: false, contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', isReplying: false, contentList: fulfillmentMessagesWithLink }
  ]
const contentButton:content[] =
  [ { type: 'user', isReplying: false, contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', isReplying: false, contentList: fulfillmentMessagesWithButton }
  ]
describe('Conversation component', () => {
  it('should render Conversation component with text', () => {
    render(<Conversation content={contentData}
      classList='conversation'
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}
    />)
    expect(screen.getByText('List zones with higher co-channel interference in 2.4 GHz band')
    ).toBeVisible()
  })
  it('should render Conversation component with link', () => {
    render(<Conversation content={contentLink}
      classList='conversation'
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    expect(screen.getByText('Go to Switch Report')).toBeVisible()
  })
  it('should render Conversation component with button', () => {
    render(<Conversation content={contentButton}
      classList='conversation'
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}/>)
    expect(screen.getByText('If you have log files, click to upload')).toBeVisible()
  })
})
