import {
  useEffect,
  useState
} from 'react'


import { CustomerServiceFilled } from '@ant-design/icons'
import { Button }                from 'antd'
import { useIntl }               from 'react-intl'

import { cssStr }            from '@acx-ui/components'
import { get }               from '@acx-ui/config'
import { CommonUrlsInfo }    from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'
import { UserUrlsInfo }      from '@acx-ui/user'
import { createHttpRequest } from '@acx-ui/utils'


declare global {
  interface Window {
    generateToken?: (callback:CallableFunction) => void
    tdiConfig: {
      displayButton: boolean,
      skin: string,
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
    window.tdi.chat()
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
    // configure TDI
    window.tdiConfig = {
    // disable the display of the "Chat now" button to allow your application to implement its own logic
      displayButton: false,
      skin: 'r1',
      events: {
        start: function () {
          statusCallback && statusCallback('start')
          setIsLoading(true)
        },
        ready: function () {
          statusCallback && statusCallback('ready')
          setIsLoading(false)
          setIsDisabled(false)
        },
        chatting: function () {
          statusCallback && statusCallback('chatting')
          setIsLoading(false)
          setIsDisabled(false)
        },
        disabled: function () {
          statusCallback && statusCallback('disabled')
          setIsDisabled(true)
        },
        error: function () {
          statusCallback && statusCallback('error')
          setIsLoading(false)
          setIsDisabled(true)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(()=>{
    window.generateToken = async function (callback){
      const userProfileReq = createHttpRequest(
        UserUrlsInfo.getUserProfile,
        { ...params }
      )
      try {
        const userResp = await fetch(userProfileReq.url,{
          headers: userProfileReq.headers
        })
        const userInfo = await userResp.json()
        statusCallback && statusCallback('user-profile-success')
        const { externalId: swuId } = userInfo
        const tokenReq = createHttpRequest (
          CommonUrlsInfo.fetchBotAuth,
          { ...params }
        )
        try {
          const authResp = await fetch(tokenReq.url,{
            method: tokenReq.method,
            headers: tokenReq.headers,
            body: JSON.stringify({ swuId })
          })
          const { idToken } = await authResp.json()
          callback(idToken,null,{
            contactId: swuId
          })
          statusCallback && statusCallback('token-success')
        } catch (error) {
          callback('',error,{})
          statusCallback && statusCallback('token-error')
        }
      } catch (error) {
        callback('',error,{})
        statusCallback && statusCallback('user-profile-error')
      }
    }
    return ()=>{
      window.generateToken = undefined
    }
  },[])

  useEffect(() => {
    const script = document.createElement('script')
    script.setAttribute('nonce', 'fetchbot-inline-script')

    script.src = get('FETCHBOT_JS_URL')
    script.async = true

    document.body.appendChild(script)

    return () => {
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
