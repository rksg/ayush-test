import { CSSProperties } from 'styled-components'

import * as UI from './styledComponents'

export type content = { type: 'bot' | 'user',
contentList:{ data?: { incidentId: string },
text?: { text: string[] }, payload?: { richContent: { link?: string, type: string,
  icon?: { color: string, type: string }, text: string, title?: string, subtitle?: string,
 event?: { parameters: { url: string }, name: string, languageCode: string } }[][] } }[] }
export interface ConversationProps {
  content: content[]
  classList: string
  style: CSSProperties
  isReplying: boolean
}
const { Panel } = UI.Collapse

function getLink (text: string): string {
  let doc = new DOMParser().parseFromString(text, 'text/html')
  return doc.body.firstElementChild!.getAttribute('href')!
}

function Conversation ({
  content,
  classList,
  isReplying,
  style
  // ...props
}: ConversationProps) {
  return (
    <UI.Wrapper style={style} className={classList}>
      {content.map((list) => (
        list.contentList.map((content) => (
          list.type === 'bot' ? (
            <>{content.text?.text.map((msg) =>(
              <UI.Bot>{msg}</UI.Bot>
            ))
            }{content.payload?.richContent.map((data) =>(
              data.map((res) => (
                res.type === 'accordion' ? <UI.Collapse>
                  <Panel header={[res.title, <p>{res.subtitle}</p>]} key='1'>
                    <img src={getLink(res.text)} alt={res.title}></img>
                  </Panel></UI.Collapse> :
                  <UI.Bot><a href={'#'}>{res.text}</a></UI.Bot>
              ))
            ))}
            </>
          ) : (
            content.text?.text.map((msg) =>(
              <UI.User>{msg}</UI.User>
            ))
          )
        ))
      ))}
      {isReplying ? <UI.Bot><UI.ChatTyping/></UI.Bot> : null }
    </UI.Wrapper>
  )
}

export { Conversation }