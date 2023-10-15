import * as UI from './styledComponents'

export type content = { type: 'bot' | 'user',
contentList:{ data?: { incidentId: string },
text?: { text: string[] }, payload?: { richContent: { link: string, type: string,
  icon: { color: string, type: string }, text: string,
 event?: { parameters: { url: string }, name: string, languageCode: string } }[][] } }[] }[]
export interface ConversationProps {
  content: content
  classList: string
  style: { height: number, width: number }
}

function Conversation ({
  content,
  classList,
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
                <UI.Bot><a href={res.event?.parameters.url}>{res.text}</a></UI.Bot>
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
    </UI.Wrapper>
  )
}

export { Conversation }