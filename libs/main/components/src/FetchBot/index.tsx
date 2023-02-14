import {
  useEffect,
  useState
} from 'react'

import { CustomerServiceFilled } from '@ant-design/icons'
import { Button }                from 'antd'

import { get }                               from '@acx-ui/config'
import { CommonUrlsInfo, createHttpRequest } from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'


declare global {
  interface Window {
    generateToken?: (callback:CallableFunction) => void
    tdiConfig: unknown,
    tdi: {
      chat: () => void
    }
  }
}

function initializeChat () {
  if (window.tdi.chat) {
    // eslint-disable-next-line no-console
    console.log('calling chat...')
    window.tdi.chat()
  } else {
    // eslint-disable-next-line no-console
    console.log('Chat not yet ready..')
  }
}

export interface FetchBotProps{
  statusCallback?: (status:string)=>void
  showFloatingButton?:boolean
}
export function FetchBot (props:FetchBotProps) {
  const { statusCallback, showFloatingButton=true } = props
  const [isLoading,setIsLoading] = useState(true)
  const [isDisabled,setIsDisabled] = useState(true)
  const params = useParams()
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Add TDI Config')
    // configure TDI
    window.tdiConfig = {
    // disable the display of the "Chat now" button to allow your application to implement its own logic
      displayButton: false,
      events: {
        start: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Starting')
          statusCallback && statusCallback('start')
          setIsLoading(true)
        },
        ready: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Ready')
          statusCallback && statusCallback('ready')
          setIsLoading(false)
          setIsDisabled(false)
        },
        disabled: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Disabled')
          statusCallback && statusCallback('disabled')
          setIsDisabled(true)
        },
        chatting: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Chatting')
          statusCallback && statusCallback('chatting')
          setIsDisabled(true)
        },
        error: function (event: { data: { error: unknown; }; }) {
          // eslint-disable-next-line no-console
          console.error(event.data.error)
          statusCallback && statusCallback('error')
          setIsDisabled(true)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(()=>{
    // eslint-disable-next-line no-console
    console.log('Attaching generateToken method to window')
    window.generateToken = function (callback){
      const userUrl = createHttpRequest (
        CommonUrlsInfo.getUserProfile,
        { ...params }
      )
      fetch(userUrl.url).then((res)=>{
        res.json().then((userInfo)=>{
          const { externalId: swuId } = userInfo
          const authUrl = createHttpRequest (
            CommonUrlsInfo.fetchBotAuth,
            { ...params }
          )
          fetch(authUrl.url,{
            method: authUrl.method.toUpperCase(),
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ swuId })
          }).then(async (res)=>{
            const { idToken } = await res.json()
            callback(idToken,null,{
              contactId: swuId
            })
          }).catch((error)=>{
            // eslint-disable-next-line no-console
            console.error(error)
            callback('',error.message,{})
          })

        })
      }).catch((error)=>{
        // eslint-disable-next-line no-console
        console.error(error)
        callback('',error.message,{})
      })
    }
    return ()=>{
      // eslint-disable-next-line no-console
      console.log('Detaching generateToken method')
      window.generateToken = undefined
    }
  },[])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Adding Script...')

    const script = document.createElement('script')

    script.src = get('FETCHBOT_JS_URL')
    script.async = true

    document.body.appendChild(script)

    return () => {
      // eslint-disable-next-line no-console
      console.log('Removing the script')
      document.body.removeChild(script)
    }
  }, [])

  return ( <Button
    title='Chat with Support'
    shape='circle'
    size='large'
    disabled={isDisabled}
    loading={isLoading}
    icon={<CustomerServiceFilled style={{ color: 'white' }} />}
    onClick={()=>{initializeChat()}}
    style={
      {
        display: showFloatingButton ? 'block' : 'none',
        backgroundColor: '#ea7600',
        position: 'fixed',
        right: '30px',
        bottom: '30px',
        zIndex: 999999,
        border: 'none',
        height: '55px',
        width: '55px'
      }
    } />
  )
}
