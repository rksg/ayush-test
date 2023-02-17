import {
  useEffect,
  useState
} from 'react'


import { CustomerServiceFilled } from '@ant-design/icons'
import { Button }                from 'antd'
import { useIntl }               from 'react-intl'

import { cssStr }                            from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { CommonUrlsInfo, createHttpRequest } from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { getJwtToken }                       from '@acx-ui/utils'


declare global {
  interface Window {
    generateToken?: (callback:CallableFunction) => void
    tdiConfig: {
      displayButton: boolean,
      events: {
        start: (event?:unknown) => void,
        ready: (event?:unknown) => void,
        disabled: (event?:unknown) => void,
        chatting: (event?:unknown) => void,
        error: (event: { data: { error: unknown } }) => void,
      }
    },
    tdi: {
      chat?: () => void
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
    console.log('Chatbot is not yet ready..')
  }
}

export interface FetchBotProps{
  statusCallback?: (status:string)=>void
  showFloatingButton?:boolean
}
export function FetchBot (props:FetchBotProps) {
  const { $t } = useIntl()
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
        chatting: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Chatting')
          statusCallback && statusCallback('chatting')
          setIsLoading(false)
          setIsDisabled(false)
        },
        disabled: function () {
          // eslint-disable-next-line no-console
          console.log('Chatbot Disabled')
          statusCallback && statusCallback('disabled')
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
    window.generateToken = async function (callback){
      const jwtToken = getJwtToken()
      const userUrl = createHttpRequest (
        CommonUrlsInfo.getUserProfile,
        { ...params }
      )
      try {
        const userResp = await fetch(userUrl.url,{
          headers: {
            Authorization: jwtToken ? `Bearer ${jwtToken}` : ''
          }
        })
        const userInfo = await userResp.json()
        statusCallback && statusCallback('user-profile-success')
        const { externalId: swuId } = userInfo
        const authUrl = createHttpRequest (
          CommonUrlsInfo.fetchBotAuth,
          { ...params }
        )
        try {
          const authResp = await fetch(authUrl.url,{
            method: authUrl.method.toUpperCase(),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
            },
            body: JSON.stringify({ swuId })
          })
          const { idToken } = await authResp.json()
          callback(idToken,null,{
            contactId: swuId
          })
          statusCallback && statusCallback('token-success')
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          callback('',error,{})
          statusCallback && statusCallback('token-error')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        callback('',error,{})
        statusCallback && statusCallback('user-profile-error')
      }
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
    title={$t({ defaultMessage: 'Chat with Support' })}
    shape='circle'
    size='large'
    disabled={isDisabled}
    loading={isLoading}
    icon={<CustomerServiceFilled style={{ color: 'white' }} />}
    onClick={()=>{
      initializeChat()}}
    style={
      {
        display: showFloatingButton ? 'block' : 'none',
        backgroundColor: cssStr('--acx-accents-orange-50'),
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
