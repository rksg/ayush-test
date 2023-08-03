import { useEffect, useState } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { showToast }                                                                    from '@acx-ui/components'
import { ApErrorHandlingMessages, CatchErrorResponse, closePokeSocket, initPokeSocket } from '@acx-ui/rc/utils'

let pokeSocket: SocketIOClient.Socket
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
  'WIFI-10130': 'SERIAL_NUMBER_ALREADY_REGISTERED' // TODO: temporary
}

// eslint-disable-next-line max-len
export function useApNeighborSocket (initRequestId: string, handler: () => void) {
  const [ detectionStatus, setDetectionStatus ] = useState<DetectionStatus>(DetectionStatus.IDLE)
  const [ requestId, setRequestId ] = useState(initRequestId)
  const { $t } = useIntl()

  // Handle websocket
  useEffect(() => {
    cleanUp()

    if (!requestId) return

    setDetectionStatus(DetectionStatus.FETCHING)

    pokeSocket = initPokeSocket(requestId, () => {
      setDetectionStatus(DetectionStatus.COMPLETEED)
      handler()
    })
    socketTimeoutId = setTimeout(onSocketTimeout, socketTimeout)

    return cleanUp
  }, [requestId])

  const cleanUp = () => {
    if (pokeSocket) closePokeSocket(pokeSocket)
    if (socketTimeoutId) clearTimeout(socketTimeoutId)
    setDetectionStatus(DetectionStatus.IDLE)
  }

  const handleError = (error: CatchErrorResponse) => {
    const code = error?.data?.errors?.[0]?.code
    const message: MessageDescriptor = code
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
    showError($t({ defaultMessage: 'The AP is not reachable' }))
    setDetectionStatus(DetectionStatus.TIMEOUT)
  }

  return {
    requestId,
    setRequestId,
    detectionStatus,
    handleError
  }
}
