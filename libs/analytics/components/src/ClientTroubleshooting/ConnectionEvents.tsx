import React from 'react'

import { Popover } from 'antd'
import { useIntl } from 'react-intl'

import { mapCodeToFailureText, mapCodeToReason } from '@acx-ui/analytics/utils'
import { formatter }                             from '@acx-ui/utils'

import { FAILURE, DisplayEvent } from './config'
import * as UI                   from './styledComponents'

const useConnectionDetail = (event: DisplayEvent) => {
  const intl = useIntl()
  const { $t } = intl
  const isFailure = event.category === FAILURE
  const { mac, apName, ssid, radio, code } = event
  const data = [
    $t({ defaultMessage: 'AP MAC: {mac}' }, { mac }),
    $t({ defaultMessage: 'AP Name: {apName}' }, { apName }),
    $t({ defaultMessage: 'SSID: {ssid}' }, { ssid }),
    $t({ defaultMessage: 'Radio: {radio} GHz' }, { radio })
  ]

  const test = [
    { label: $t({ defaultMessage: 'AP MAC:' }), content: $t({ defaultMessage: '{mac}' }, { mac }) },
    { label: $t({ defaultMessage: 'AP Name:' })
      , content: $t({ defaultMessage: '{apName}' }, { apName }) },
    { label: $t({ defaultMessage: 'SSID:' }), content: $t({ defaultMessage: '{ssid}' }, { ssid }) },
    { label: $t({ defaultMessage: 'Radio:' }), content: $t({ defaultMessage: '{radio}' },
      { radio: radio ? formatter('radioFormat')(radio) : $t({ defaultMessage: 'Unknown' }) }) }
  ]

  if (isFailure) {
    const failureType = mapCodeToFailureText(code, intl)
    const reason = mapCodeToReason(code, intl)
    data.push($t({ defaultMessage: 'Failure Type: {failureType}' }, { failureType }))
    data.push($t({ defaultMessage: 'Reason: {reason}' },{ reason }))

    test.push({
      label: $t({ defaultMessage: 'Failure Type:' }),
      content: $t({ defaultMessage: '{failureType}' }, { failureType })
    })

    test.push({
      label: $t({ defaultMessage: 'Reason:' }),
      content: $t({ defaultMessage: '{reason}' }, { reason })
    })
  }

  return Object.values(data).join('\n')
}

export function ConnectionEvents ({ children, event }:
  { children?: React.ReactNode, event: DisplayEvent }) {
  const { $t } = useIntl()
  return (
    <UI.PopoverWrapper>
      <Popover
        title={$t({ defaultMessage: 'Connection Event Details' })} // TODO: update
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