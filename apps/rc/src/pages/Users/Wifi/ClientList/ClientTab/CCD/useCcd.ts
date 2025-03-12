/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { showActionModal }               from '@acx-ui/components'
import { closeCcdSocket, initCcdSocket } from '@acx-ui/rc/utils'
import { CatchErrorResponse }            from '@acx-ui/utils'


const socketTimeout = 600000 // 10 mins

interface ErrorMessageType {
  title: { defaultMessage: string },
  message: { defaultMessage: string }
}

const CcdErrorTypeMapping: { [code in string]: ErrorMessageType } = {
  'AP-OPS-10200': {
    title: defineMessage({ defaultMessage: 'Bad Request' }),
    message: defineMessage({
      defaultMessage: 'Your request resulted in an error.'
    })
  },
  'AP-OPS-10201': {
    title: defineMessage({ defaultMessage: 'Bad Request' }),
    message: defineMessage({
      defaultMessage: 'Can not find APs for troubleshooting.'
    })
  },
  'AP-OPS-10301': {
    title: defineMessage({ defaultMessage: 'Session in progress…' }),
    message: defineMessage({
      defaultMessage: 'The Diagnostics session is already in progress initiated by another user. Try Tracing Connectivity later.'
    })
  },
  'AP-OPS-10302': {
    title: defineMessage({ defaultMessage: 'Reach max diagnosis session' }),
    message: defineMessage({
      defaultMessage: 'The Diagnostics session is exceed the Max. number allowed connections. Try Tracing Connectivity later.'
    })
  }
}


export function useCcd (handler: (msg: string) => void, errorCallback?: ()=> void) {
  const { $t } = useIntl()
  const [ requestId, setRequestId ] = useState<string>()

  const ccdSocketRef = useRef<SocketIOClient.Socket>()
  const ccdSocketTimeoutIdRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    cleanUp()

    if (requestId) {
      //console.log('Open CCD socket: ', requestId)
      ccdSocketRef.current = initCcdSocket(requestId, (msg: string) => {
        handler(msg)
      })
      setSocketTimeout()
    }

    return cleanUp
  }, [requestId])

  const cleanUp = () => {
    clearSocketTimeout()
    closeSocket()
  }

  const closeSocket = () => {
    if (ccdSocketRef.current) {
      //console.log('Close CCD socket - ', ccdSocketRef.current)
      closeCcdSocket(ccdSocketRef.current)
      ccdSocketRef.current = undefined
    }
  }

  const setSocketTimeout = () => {
    //console.log('setSocketTimeout')
    ccdSocketTimeoutIdRef.current = setTimeout(onSocketTimeout, socketTimeout)
  }

  const clearSocketTimeout = () => {
    if (ccdSocketTimeoutIdRef.current) {
      //console.log('clearSocketTimeout')
      clearTimeout(ccdSocketTimeoutIdRef.current)
      ccdSocketTimeoutIdRef.current = undefined
    }
  }

  const handleError = (error: CatchErrorResponse) => {
    const ccdError = error?.data?.errors?.[0]
    const code = ccdError?.code
    const isDefinedCcdCode = code && CcdErrorTypeMapping[code]

    if (isDefinedCcdCode) {
      const { title, message } = isDefinedCcdCode
      showErrorModal($t(title), $t(message))
    } else {
      const message = ccdError?.message
      showErrorModal('', message)
    }
    errorCallback?.()
  }

  const showErrorModal = (title: string, message: string) => {
    showActionModal({
      type: 'error',
      title: title,
      content: message
    })
  }

  const onSocketTimeout = () => {
    const title = $t({ defaultMessage: 'Session is expired' })
    const message = $t({
      defaultMessage: 'The Diagnostics session is expired. To start a new session, click Trace Connectivity again.'
    })

    showErrorModal(title, message)
    errorCallback?.()
    setRequestId('')
  }

  return {
    requestId,
    setRequestId,
    handleError
  }
}
