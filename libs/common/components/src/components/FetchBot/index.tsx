/* eslint-disable no-console */
import {
  useEffect,
  useState
} from 'react'

import { CustomerServiceFilled } from '@ant-design/icons'
import { Button }                from 'antd'

import { get } from '@acx-ui/config'


declare global {
  interface Window {
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
export function FetchBot () {
  const [isLoading,setIsLoading] = useState(true)
  const [isDisabled,setIsDisabled] = useState(true)
  useEffect(() => {
    // configure TDI
    window.tdiConfig = {
    // disable the display of the "Chat now" button to allow your application to implement its own logic
      displayButton: false,
      events: {
        start: function () {
          console.log('Chatbot Starting')
          setIsLoading(true)
        },
        ready: function () {
          console.log('Chatbot Ready')
          setIsLoading(false)
          setIsDisabled(false)
        },
        disabled: function () {
          console.log('Chatbot Disabled')
          setIsDisabled(true)
        },
        chatting: function () {
          setIsDisabled(false)
          console.log('Chatbot Chatting')
        },
        error: function (event: { data: { error: unknown; }; }) {
          setIsDisabled(true)
          // eslint-disable-next-line no-console
          console.error(event.data.error)
        }
      }
    }
  }, [])
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Adding Script...')

    const script = document.createElement('script')

    script.src = get('FETCHBOT_JS_URL')
    script.async = true

    document.body.appendChild(script)

    return () => {
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
        backgroundColor: '#ea7600',
        position: 'fixed',
        right: '30px',
        bottom: '30px',
        zIndex: 999999,
        border: 'none'
      }
    } />
  )
}
