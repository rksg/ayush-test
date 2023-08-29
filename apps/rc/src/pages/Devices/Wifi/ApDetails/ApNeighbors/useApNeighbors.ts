import { useEffect, useRef, useState } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { showToast }                                                                    from '@acx-ui/components'
import { useDetectApNeighborsMutation }                                                 from '@acx-ui/rc/services'
import { ApErrorHandlingMessages, CatchErrorResponse, closePokeSocket, initPokeSocket } from '@acx-ui/rc/utils'
import { getIntl }                                                                      from '@acx-ui/utils'

import { ApNeighborTypes, DetectionStatus, defaultSocketTimeout } from './constants'
import { errorTypeMapping }                                       from './contents'

export function useApNeighbors (type: ApNeighborTypes, serialNumber: string, handler: () => void) {
  const [ detectionStatus, setDetectionStatus ] = useState<DetectionStatus>(DetectionStatus.IDLE)
  const { $t } = useIntl()
  const [ detectApNeighbors ] = useDetectApNeighborsMutation()
  const pokeSocketRef = useRef<SocketIOClient.Socket>()
  const socketTimeoutIdRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    cleanUp()

    pokeSocketRef.current = initPokeSocket(getSocketSubscriptionId(type, serialNumber), () => {
      setDetectionStatus(DetectionStatus.IDLE)
      clearSocketTimeout()
      handler()
    })

    doDetect()

    return cleanUp
  }, [])

  const cleanUp = () => {
    closeSocket()
    clearSocketTimeout()
  }

  const closeSocket = () => {
    if (pokeSocketRef.current) closePokeSocket(pokeSocketRef.current)
  }

  const setSocketTimeout = () => {
    clearSocketTimeout()
    socketTimeoutIdRef.current = setTimeout(onSocketTimeout, defaultSocketTimeout)
  }

  const clearSocketTimeout = () => {
    if (socketTimeoutIdRef.current) clearTimeout(socketTimeoutIdRef.current)
  }

  const onSocketTimeout = () => {
    showError($t({ defaultMessage: 'The AP is not reachable' }))
    setDetectionStatus(DetectionStatus.IDLE)
  }

  const doDetect = async () => {
    setDetectionStatus(DetectionStatus.FETCHING)

    try {
      detectApNeighbors({
        params: { serialNumber },
        payload: { action: type === 'lldp' ? 'DETECT_LLDP_NEIGHBOR': 'DETECT_RF_NEIGHBOR' }
      })

      setSocketTimeout()
    } catch (error) {
      handleError(error as CatchErrorResponse)
      clearSocketTimeout()
      setDetectionStatus(DetectionStatus.IDLE)
    }
  }

  return {
    detectionStatus,
    doDetect
  }
}

function getSocketSubscriptionId (type: ApNeighborTypes, serialNumber: string): string {
  return `${serialNumber}-neighbor-${type}`
}

export const handleError = (error: CatchErrorResponse) => {
  const { $t } = getIntl()
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
