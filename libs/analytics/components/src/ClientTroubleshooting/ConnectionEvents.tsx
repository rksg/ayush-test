import React from 'react'

import { Popover } from 'antd'
import { useIntl } from 'react-intl'

import { FAILURE, DisplayEvent } from './config'
import * as UI                   from './styledComponents'

type ConnectionDetailsType = {
  mac: string,
  apName: string,
  ssid: string,
  radio: string,
  failureType?: string,
  reason?: string,
}

const useConnectionDetail = (event: DisplayEvent) => {
  const { $t } = useIntl()
  const isFailure = event.category === FAILURE
  const { mac, apName, state, radio, failedMsgId, code } = event
  const data: ConnectionDetailsType = {
    mac: $t({ defaultMessage: 'AP MAC: {mac}' }, { mac }),
    apName: $t({ defaultMessage: 'AP Name: {apName}' }, { apName }),
    ssid: $t({ defaultMessage: 'SSID: {state}' }, { state }),
    radio: $t({ defaultMessage: 'Radio: {radio} GHz' }, { radio })
  }

  if (isFailure) {
    data.failureType = $t({ defaultMessage: 'Failure Type: {failedMsgId}' }, { failedMsgId })
    data.reason = $t({ defaultMessage: 'Reason: {code}' }, { code })
  }

  return Object.values(data).join('\n')
}

export function ConnectionEvents ({ children, event }:
  { children?: React.ReactNode, event: DisplayEvent }) {
  const { $t } = useIntl()
  return (
    <UI.PopoverWrapper>
      <Popover
        title={$t({ defaultMessage: 'Connection Event Details' })}
        content={useConnectionDetail(event)}
        trigger={['focus', 'click']}
        placement='left'
        getPopupContainer={(triggerNode) => triggerNode}
      >
        {children}
      </Popover>
    </UI.PopoverWrapper>
  )
}