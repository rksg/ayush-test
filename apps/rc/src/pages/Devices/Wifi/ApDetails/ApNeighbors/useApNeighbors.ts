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
  'WIFI-10496': 'FIRMWARE_IS_NOT_SUPPORTED',
  'WIFI-10497': 'IS_NOT_OPERATIONAL',
  'WIFI-10216': 'IS_NOT_FOUND',
  'WIFI-10498': 'NO_DETECTED_NEIGHBOR_DATA'
}

export function useApNeighbors (initRequestId: string, handler: () => void) {
  const [ detectionStatus, setDetectionStatus ] = useState<DetectionStatus>(DetectionStatus.IDLE)
  const [ requestId, setRequestId ] = useState(initRequestId)
  const { $t } = useIntl()

  useEffect(() => {
    cleanUp()

    if (!requestId) return

    setDetectionStatus(DetectionStatus.FETCHING)

    pokeSocket = initPokeSocket(requestId, () => {
      setDetectionStatus(DetectionStatus.COMPLETEED)
      clearTimeout(socketTimeoutId)
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
