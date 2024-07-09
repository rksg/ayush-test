import { BrowserRouter } from 'react-router-dom'

import { Conversation, Content } from '..'


export function Basic () {
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

  const content:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessages }
  ]

  return <BrowserRouter>
    <Conversation
      content={content}
      classList='conversation'
      isReplying={false}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}></Conversation>
  </BrowserRouter>
}