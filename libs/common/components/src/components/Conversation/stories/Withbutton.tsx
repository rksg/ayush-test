import { BrowserRouter } from 'react-router-dom'

import { Conversation, Content } from '..'


export function Withbutton () {
  const contentUser = 'List zones with higher co-channel interference in 2.4 GHz band'

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
              text: `If you have log files or screen shots to 
              attach to your support case, click to upload`,
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

  const content:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithButton }
  ]

  return <BrowserRouter>
    <Conversation
      content={content}
      classList='conversation'
      isReplying={false}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}></Conversation>
  </BrowserRouter>
}