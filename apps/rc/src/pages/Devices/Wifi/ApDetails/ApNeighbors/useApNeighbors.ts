import { useEffect, useRef, useState } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'
import { v4 as uuidv4 }               from 'uuid'

import { showToast }                                                                    from '@acx-ui/components'
import { useDetectApNeighborsMutation }                                                 from '@acx-ui/rc/services'
import { ApErrorHandlingMessages, CatchErrorResponse, closePokeSocket, initPokeSocket } from '@acx-ui/rc/utils'
import { getIntl }                                                                      from '@acx-ui/utils'

import { ApNeighborTypes, defaultSocketTimeout } from './constants'
import { errorTypeMapping }                      from './contents'

export function useApNeighbors (type: ApNeighborTypes, serialNumber: string, handler: () => void) {
  const [ isDetecting, setIsDetecting ] = useState(false)
  const { $t } = useIntl()
  const [ detectApNeighbors ] = useDetectApNeighborsMutation()
  const pokeSocketRef = useRef<SocketIOClient.Socket>()
  const pokeSocketTimeoutIdRef = useRef<NodeJS.Timeout>()
  const pokeSocketSubscriptionIdRef = useRef<string>(getSocketSubscriptionId(type, serialNumber))

  useEffect(() => {
    if (isDetecting) {
      setSocketTimeout()
    } else {
      clearSocketTimeout()
    }

    return clearSocketTimeout
  }, [isDetecting])

  useEffect(() => {
    if (!pokeSocketRef.current) {
      pokeSocketRef.current = initPokeSocket(pokeSocketSubscriptionIdRef.current, () => {
        setIsDetecting(false)
        handler()
      })
    }

    return closeSocket
  }, [])

  useEffect(() => {
    doDetect()
  }, [])

  const closeSocket = () => {
    if (pokeSocketRef.current) closePokeSocket(pokeSocketRef.current)
  }

  const setSocketTimeout = () => {
    pokeSocketTimeoutIdRef.current = setTimeout(onSocketTimeout, defaultSocketTimeout)
  }

  const clearSocketTimeout = () => {
    if (pokeSocketTimeoutIdRef.current) clearTimeout(pokeSocketTimeoutIdRef.current)
  }

  const onSocketTimeout = () => {
    showError($t({ defaultMessage: 'The AP is not reachable' }))
    setIsDetecting(false)
  }

  const doDetect = async () => {
    setIsDetecting(true)

    try {
      await detectApNeighbors({
        params: { serialNumber },
        payload: {
          action: type === 'lldp' ? 'DETECT_LLDP_NEIGHBOR': 'DETECT_RF_NEIGHBOR',
          subscriptionId: pokeSocketSubscriptionIdRef.current
        }
      }).unwrap()
    } catch (error) {
      handleError(error as CatchErrorResponse)
      setIsDetecting(false)
    }
  }

  return {
    isDetecting,
    doDetect
  }
}

function getSocketSubscriptionId (type: ApNeighborTypes, serialNumber: string): string {
  return `${serialNumber}-neighbor-${type}-${uuidv4()}`
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
