import { useEffect, useState } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { showToast }                                                                  from '@acx-ui/components'
import { ApErrorHandlingMessages, CatchErrorResponse, closeCcdSocket, initCcdSocket } from '@acx-ui/rc/utils'

let ccdSocket: SocketIOClient.Socket
let socketTimeoutId: NodeJS.Timeout
const socketTimeout = 10000

export enum DetectionStatus {
  IDLE,
  FETCHING,
  TIMEOUT,
  COMPLETEED
}

type ApErrorMessageKey = keyof typeof ApErrorHandlingMessages
const errorTypeMapping: { [code in string]: ApErrorMessageKey } = {
  'WIFI-99999': 'ERROR_OCCURRED' // TODO: temporary
}


export function useCcd (initRequestId: string, handler: (msg: string) => void) {
  const [ detectionStatus, setDetectionStatus ] = useState<DetectionStatus>(DetectionStatus.IDLE)
  const [ requestId, setRequestId ] = useState(initRequestId)
  const { $t } = useIntl()

  useEffect(() => {
    cleanUp()

    if (!requestId) return

    setDetectionStatus(DetectionStatus.FETCHING)
    //console.log('Open CCD socket')
    ccdSocket = initCcdSocket(requestId, (msg: string) => {
      setDetectionStatus(DetectionStatus.COMPLETEED)
      clearTimeout(socketTimeoutId)
      handler(msg)
    })
    socketTimeoutId = setTimeout(onSocketTimeout, socketTimeout)

    return cleanUp
  }, [requestId])

  const cleanUp = () => {
    if (ccdSocket) closeCcdSocket(ccdSocket)
    if (socketTimeoutId) clearTimeout(socketTimeoutId)
    setDetectionStatus(DetectionStatus.IDLE)
    //console.log('Close CCD socket')
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
    setDetectionStatus(DetectionStatus.TIMEOUT)
  }

  return {
    requestId,
    setRequestId,
    detectionStatus,
    handleError
  }
}