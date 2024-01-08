import { useState } from 'react'

import { useIntl }       from 'react-intl'
import { Link }          from 'react-router-dom'
import { CSSProperties } from 'styled-components'


import { UploadDocument } from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'
export interface FulfillmentMessage {
  data?: { incidentId: string },
  text?: { text: string[] },
  payload?: {
    richContent: {
      link?: string,
      type: string,
      icon?: { color: string, type: string },
      text?: string,
      title?: string,
      subtitle?: string,
      event?: {
        parameters: { url?: string },
        name: string,
        languageCode: string
      }
    }[][]
  } }

export type Content = { type: 'bot' | 'user', isRuckusAi?:boolean,
contentList:FulfillmentMessage[] }

export interface ConversationProps {
  content: Content[]
  classList: string
  style: CSSProperties
  isReplying: boolean
  listCallback: CallableFunction
  maxChar?: number
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

const Expandable = (props: { text: string, maxChar: number, isRuckusAi?:boolean }) => {
  const { $t } = useIntl()
  const [expanded, setExpanded] = useState(true)
  const RUCKUS_AI_TEXT = $t({ defaultMessage: 'RUCKUS AI' })
  const readMoreText = $t({ defaultMessage: 'Read more...' })
  const readLessText = $t({ defaultMessage: 'Read less' })
  const RUCKUS_AI_HEADER = props.isRuckusAi ? <>
    <strong><u>{RUCKUS_AI_TEXT}</u></strong><br/><br/></> : null
  if(props.text.length <= props.maxChar) return <UI.Bot>{RUCKUS_AI_HEADER}{props.text}</UI.Bot>
  let formattedText = expanded ? props.text.substring(0, props.maxChar) : props.text
  return <UI.Bot>{RUCKUS_AI_HEADER}{formattedText}{expanded ? '... ' : ''}
    <br/><br/>
    <Button size='small' type='link' onClick={() => {setExpanded(!expanded)}}>
      {expanded? readMoreText : readLessText}</Button></UI.Bot>
}
function Conversation ({
  content,
  classList,
  isReplying,
  style,
  listCallback,
  maxChar=300
}: ConversationProps) {
  return (
    <UI.Wrapper style={style} className={classList}>
      {content.map((list) => (
        list.contentList.map((content) => (
          list.type === 'bot' ? (
            <>{content.text?.text.map((msg) =>{
              const text = msg.startsWith('\n') ? msg.substring(1).trim() : msg.trim()
              return <Expandable text={text} maxChar={maxChar} isRuckusAi={list.isRuckusAi}/>
            })
            }{content.payload?.richContent.map((data) =>(
              data.map((res) => {
                switch(res.type){
                  case 'accordion':
                    return <UI.Collapse>
                      <Panel header={[res.title, <p>{res.subtitle}</p>]} key='1'>
                        <img src={getLink(res.text!)} alt={res.title}></img>
                      </Panel></UI.Collapse>
                  case 'button':
                    if(res.link){
                      return <a href={parseLink(res.link)}
                        target='_blank'
                        rel='noreferrer'><Button type='default'
                          icon={<UI.StyledChatbotLink/>}
                          style={{
                            fontSize: '12px',
                            width: 'max-content',
                            marginTop: '10px'
                          }}>{res.text}</Button></a>
                    }else if(res.event){
                      return <Link to={res.event?.parameters?.url || '#'}>
                        <Button type='default'
                          icon={<UI.StyledChatbotLink/>}
                          style={{
                            fontSize: '12px',
                            width: 'max-content',
                            marginTop: '10px' }}>{res.text}</Button></Link>
                    }else{
                      return <Button type='default'
                        icon={<UploadDocument />}
                        data-testid='button-link'
                        style={{ fontSize: '12px',
                          width: 'max-content',
                          marginTop: '10px' }}>
                        {res.text}</Button>
                    }
                  case 'divider':
                    return null
                  case 'list':
                    return <Button type='default'
                      data-testid='button-link-list'
                      style={{ fontSize: '12px', width: 'max-content', marginTop: '10px' }}
                      onClick={()=>{
                        listCallback({
                          queryInput: {
                            event: res.event
                          }
                        })
                      }}
                    >
                      {res.title}</Button>
                }
                return <UI.Bot>{res.type}</UI.Bot>
              })
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