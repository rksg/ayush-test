import React from 'react'

import { Popover } from 'antd'
import { useIntl } from 'react-intl'

import { clientEventDescription, mapCodeToReason } from '@acx-ui/analytics/utils'
import { formatter }                               from '@acx-ui/utils'

import { FAILURE, DisplayEvent, SLOW, DISCONNECT } from './config'
import Details                                     from './EventDetails'
import * as UI                                     from './styledComponents'

const useConnectionDetail = (event: DisplayEvent) => {
  const intl = useIntl()
  const { $t } = intl
  const isFailure = event.category === FAILURE
  const isSlow = event.category === SLOW
  const isDisconnect = event.category === DISCONNECT
  const { mac, apName, ssid, radio, code, ttc, state } = event

  const eventDetails = [
    { label: $t({ defaultMessage: 'AP MAC:' }), value: $t({ defaultMessage: '{mac}' }, { mac }) },
    { label: $t({ defaultMessage: 'AP Name:' }), value: $t({ defaultMessage: '{apName}' },
      { apName }) },
    { label: $t({ defaultMessage: 'SSID:' }), value: $t({ defaultMessage: '{ssid}' }, { ssid }) },
    { label: $t({ defaultMessage: 'Radio:' }), value: $t({ defaultMessage: '{radio}' },
      { radio: radio ? formatter('radioFormat')(radio) : $t({ defaultMessage: 'Unknown' }) }) }
  ]

  if (isFailure) {
    const failureType = mapCodeToReason(code, intl)
    eventDetails.push({
      label: $t({ defaultMessage: 'Failure Type:' }),
      value: $t({ defaultMessage: '{failureType}' }, { failureType })
    })

    const reason = clientEventDescription(event.failedMsgId, state)
    eventDetails.push({
      label: $t({ defaultMessage: 'Reason:' }),
      value: $t({ defaultMessage: '{reason}' }, { reason: reason.defaultMessage as string })
    })
  }

  if (isSlow) {
    eventDetails.push({
      label: $t({ defaultMessage: 'Time to Connect:' }),
      value: $t({ defaultMessage: '{ttc}' }, { ttc: formatter('durationFormat')(ttc) })
    })
  }

  if (isDisconnect) {
    const reason = mapCodeToReason(code, intl)
    eventDetails.push({
      label: $t({ defaultMessage: 'Reason:' }),
      value: $t({ defaultMessage: '{reason}' }, { reason })
    })
  }

  return eventDetails
}

export function ConnectionEvents ({ children, event }:
  { children?: React.ReactNode, event: DisplayEvent }) {
  const rowData = useConnectionDetail(event)
  return (
    <UI.PopoverWrapper>
      <Popover
        content={<Details fields={rowData} />}
        trigger={['focus', 'click']}
        placement='left'
        getPopupContainer={(triggerNode) => triggerNode}
      >
        {children}
      </Popover>
    </UI.PopoverWrapper>
  )
}