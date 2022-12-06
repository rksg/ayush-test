import React from 'react'

import { Popover } from 'antd'
import { useIntl } from 'react-intl'

import { mapCodeToFailureText } from '@acx-ui/analytics/utils'

import { FAILURE, DisplayEvent } from './config'
import * as UI                   from './styledComponents'

const useConnectionDetail = (event: DisplayEvent) => {
  const intl = useIntl()
  const { $t } = intl
  const isFailure = event.category === FAILURE
  const { mac, apName, ssid, radio, failedMsgId, code } = event
  const data = [
    $t({ defaultMessage: 'AP MAC: {mac}' }, { mac }),
    $t({ defaultMessage: 'AP Name: {apName}' }, { apName }),
    $t({ defaultMessage: 'SSID: {ssid}' }, { ssid }),
    $t({ defaultMessage: 'Radio: {radio} GHz' }, { radio })
  ]

  if (isFailure) {
    const reason = mapCodeToFailureText(code, intl)
    data.push($t({ defaultMessage: 'Failure Type: {reason}' }, { reason }))
    data.push($t({ defaultMessage: 'Reason: {failedMsgId}' }, { failedMsgId }))
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