import { useState } from 'react'

import { Link }          from 'react-router-dom'
import { CSSProperties } from 'styled-components'

import { ArrowChevronRight } from '@acx-ui/icons'

import { Button } from '../Button'

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

function parseLink (link: string): string {
  const MELISSA_URL_ORIGIN = window.location.origin
  return link.replace('<origin>',MELISSA_URL_ORIGIN)
}

const Expandable = (props: { text: string, maxChar: number }) => {
  let [expanded, setExpanded] = useState(true)
  if(props.text.length <= props.maxChar) return <UI.Bot>{props.text}</UI.Bot>
  let formattedText = expanded ? props.text.substring(0, props.maxChar) : props.text
  return <UI.Bot>{formattedText }
    <Button size='small' type='link' onClick={() => {setExpanded(!expanded)}}>
      {expanded? 'read more' : 'read less'}</Button></UI.Bot>
}
// eslint-disable-next-line max-len
// const link = '/ai/users/wifi/clients/0E:85:58:98:2E:97/details/troubleshooting?period=%7B%22range%22%3A%22Custom%22%2C%22endDate%22%3A%222023-10-19T11%3A20%3A09.337Z%22%2C%22startDate%22%3A%222023-10-18T11%3A20%3A09.337Z%22%7D'
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
              <Expandable text={msg} maxChar={300} />
            ))
            }{content.payload?.richContent.map((data) =>(
              data.map((res) => (
                res.type === 'accordion' ? <UI.Collapse>
                  <Panel header={[res.title, <p>{res.subtitle}</p>]} key='1'>
                    <img src={getLink(res.text)} alt={res.title}></img>
                  </Panel></UI.Collapse> :
                  (res.link ? <UI.Bot><a href={parseLink(res.link)}
                    target='_blank'
                    rel='noreferrer'>{res.text}</a></UI.Bot> :
                    res.event ?
                      <UI.Bot>
                        <Link to={res.event?.parameters?.url || '#'}>{res.text}</Link>
                        {/* <Link to={link || '#'}>{res.text}</Link> */}
                      </UI.Bot> :
                      <UI.Button size='small' type='primary' icon={<ArrowChevronRight />}>
                        {res.text}</UI.Button>

                  )
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