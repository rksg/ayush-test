import React, { ReactNode } from 'react'

import { Popover } from 'antd'
import { useIntl } from 'react-intl'

import { clientEventDescription, mapCodeToFailureText, mapCodeToReason } from '@acx-ui/analytics/utils'
import { formatter, getIntl }                                            from '@acx-ui/utils'

import { FAILURE, DisplayEvent, SLOW, DISCONNECT } from './config'
import { Details }                                 from './EventDetails'
import * as UI                                     from './styledComponents'

const useConnectionDetail = (event: DisplayEvent) => {
  const intl = getIntl()
  const { $t } = intl
  const { mac, apName, ssid, radio, code, ttc, state } = event

  const eventDetails = [
    { label: $t({ defaultMessage: 'AP MAC:' }), value: $t({ defaultMessage: '{mac}' }, { mac }) },
    { label: $t({ defaultMessage: 'AP Name:' }), value: $t({ defaultMessage: '{apName}' },
      { apName }) },
    { label: $t({ defaultMessage: 'SSID:' }), value: $t({ defaultMessage: '{ssid}' }, { ssid }) },
    { label: $t({ defaultMessage: 'Radio:' }), value: $t({ defaultMessage: '{radio}' },
      { radio: radio ? formatter('radioFormat')(radio) : $t({ defaultMessage: 'Unknown' }) }) }
  ]

  switch (event.category) {
    case FAILURE: {
      const failureType = (code)
        ? mapCodeToFailureText(code, intl)
        : $t({ defaultMessage: 'Unknown' })
      eventDetails.push({
        label: $t({ defaultMessage: 'Failure Type:' }),
        value: $t({ defaultMessage: '{failureType}' }, { failureType })
      })

      const reason = clientEventDescription(event.event, state)
      eventDetails.push({
        label: $t({ defaultMessage: 'Reason:' }),
        value: $t(reason)
      })
      break
    }

    case SLOW: {
      eventDetails.push({
        label: $t({ defaultMessage: 'Time to Connect:' }),
        value: $t({ defaultMessage: '{ttc}' }, { ttc: formatter('durationFormat')(ttc) })
      })
      break
    }

    case DISCONNECT: {
      const reason = mapCodeToReason(event.event, intl)
      eventDetails.push({
        label: $t({ defaultMessage: 'Reason:' }),
        value: $t({ defaultMessage: '{reason}' }, { reason })
      })
      break
    }
  }

  return eventDetails
}

export function ConnectionEventPopover ({ children, event }:
  { children?: React.ReactNode, event: DisplayEvent }) {
  const { $t } = useIntl()
  const [open, setOpen] = React.useState(false)
  const hide = () => { setOpen(false) }
  const rowData = useConnectionDetail(event)
  const failureExtra: ReactNode = (event.category === 'failure')
    ? $t({ defaultMessage: 'Failure Sequence Diagram' })
    : null
  return (
    <UI.PopoverWrapper>
      <Popover
        content={<Details fields={rowData} openHandler={hide} extra={failureExtra}/>}
        trigger='click'
        placement='right'
        getPopupContainer={(triggerNode) => triggerNode}
        visible={open}
        onVisibleChange={setOpen}
        arrowPointAtCenter
      >
        {children}
      </Popover>
    </UI.PopoverWrapper>
  )
}