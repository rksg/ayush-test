import { useEffect, useRef, useState } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { showToast }                                                                  from '@acx-ui/components'
import { ApErrorHandlingMessages, CatchErrorResponse, closeCcdSocket, initCcdSocket } from '@acx-ui/rc/utils'


const socketTimeout = 10000


type ApErrorMessageKey = keyof typeof ApErrorHandlingMessages
const errorTypeMapping: { [code in string]: ApErrorMessageKey } = {
  'WIFI-99999': 'ERROR_OCCURRED' // TODO: temporary
}


export function useCcd (handler: (msg: string) => void) {
  const { $t } = useIntl()
  const [ requestId, setRequestId ] = useState<string>()

  const ccdSocketRef = useRef<SocketIOClient.Socket>()
  const ccdSocketTimeoutIdRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    cleanUp()

    if (requestId) {
      //console.log('Open CCD socket: ', requestId)
      ccdSocketRef.current = initCcdSocket(requestId, (msg: string) => {
        clearSocketTimeout()
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
      //console.log('Close CCD socket')
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
    const code = error?.data?.errors?.[0]?.code
    const isDefinedCode = code && errorTypeMapping[code]
    const message: MessageDescriptor = isDefinedCode
      ? ApErrorHandlingMessages[errorTypeMapping[code]]
      : ApErrorHandlingMessages.ERROR_OCCURRED

    showError($t(message, { action: $t({ defaultMessage: 'detecting' }) }))
  }

  const showError = (errorMessage: string) => {
    showToast({
      type: 'error',
      content: errorMessage
    })
  }

  const onSocketTimeout = () => {
    showError($t({ defaultMessage: 'The socket timeout' }))
  }

  return {
    requestId,
    setRequestId,
    handleError
  }
}