import { useEffect, useRef, useState } from 'react'

import { message }           from 'antd'
import { MessageDescriptor } from 'react-intl'
import { v4 as uuidv4 }      from 'uuid'

import { showToast }                                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { useDetectApNeighborsMutation }                             from '@acx-ui/rc/services'
import { ApErrorHandlingMessages, closePokeSocket, initPokeSocket } from '@acx-ui/rc/utils'
import { getIntl, CatchErrorResponse }                              from '@acx-ui/utils'

import { ApNeighborStatus, ApNeighborTypes, NewApNeighborTypes, defaultSocketTimeout } from './constants'
import { errorTypeMapping }                                                            from './contents'

export function useApNeighbors (
  type: ApNeighborTypes,
  serialNumber: string,
  handler: () => void,
  venueId?: string
) {
  const [ isDetecting, setIsDetecting ] = useState(false)
  const [ detectApNeighbors ] = useDetectApNeighborsMutation()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const pokeSocketRef = useRef<SocketIOClient.Socket>()
  const pokeSocketTimeoutIdRef = useRef<NodeJS.Timeout>()
  const pokeSocketSubscriptionIdRef = useRef<string>(getSocketSubscriptionId(type, serialNumber))
  const isSystemDrivenDetectRef = useRef<boolean>()

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
        clearErrorToast()
        handler()
      })

      pokeSocketRef.current.on('connectedSocketEvent', () => {
        doDetect(true)
      })
    }

    return closeSocket
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
    handleError('timeout')
    setIsDetecting(false)
  }

  const doDetect = async (isSystemDriven = false) => {
    setIsDetecting(true)
    isSystemDrivenDetectRef.current = isSystemDriven
    const payload = isUseWifiRbacApi ?
      {
        status: ApNeighborStatus.CURRENT,
        type: type === 'lldp' ? NewApNeighborTypes.LLDP_NEIGHBOR : NewApNeighborTypes.RF_NEIGHBOR,
        subscriptionId: pokeSocketSubscriptionIdRef.current
      }:
      {
        action: type === 'lldp' ? 'DETECT_LLDP_NEIGHBOR': 'DETECT_RF_NEIGHBOR',
        subscriptionId: pokeSocketSubscriptionIdRef.current
      }

    try {
      await detectApNeighbors({
        params: { serialNumber, venueId },
        payload,
        enableRbac: isUseWifiRbacApi
      }).unwrap()
    } catch (error) {
      handleError('api', error as CatchErrorResponse)
      setIsDetecting(false)
    }
  }

  const clearErrorToast = () => {
    message.destroy()
  }

  const handleError = (type: 'api' | 'timeout', error?: CatchErrorResponse) => {
    clearErrorToast()

    if (isSystemDrivenDetectRef.current) return

    if (type === 'timeout') {
      handleApNeighborsTimeoutError()
    } else {
      handleApNeighborsApiError(error as CatchErrorResponse)
    }
  }

  return {
    isDetecting,
    doDetect,
    handleApiError: handleError.bind(null, 'api')
  }
}

function getSocketSubscriptionId (type: ApNeighborTypes, serialNumber: string): string {
  return `${serialNumber}-neighbor-${type}-${uuidv4()}`
}

function handleApNeighborsTimeoutError () {
  showError(getIntl().$t({ defaultMessage: 'The AP is not reachable' }))
}

function handleApNeighborsApiError (error: CatchErrorResponse) {
  const { $t } = getIntl()
  const code = error?.data?.errors?.[0]?.code
  const isDefinedCode = code && errorTypeMapping[code]
  const message: MessageDescriptor = isDefinedCode
    ? ApErrorHandlingMessages[errorTypeMapping[code]]
    : ApErrorHandlingMessages.ERROR_OCCURRED

  showError($t(message, { action: $t({ defaultMessage: 'detecting' }) }))
}

function showError (errorMessage: string) {
  showToast({
    type: 'error',
    content: errorMessage
  })
}
