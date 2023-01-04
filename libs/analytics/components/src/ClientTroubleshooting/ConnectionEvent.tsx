import React, { ReactNode } from 'react'

import { Popover } from 'antd'

import { clientEventDescription, mapCodeToFailureText, mapDisconnectCodeToReason } from '@acx-ui/analytics/utils'
import { formatter, getIntl }                                                      from '@acx-ui/utils'

import { FAILURE, DisplayEvent, SLOW, DISCONNECT } from './config'
import { ConnectionSequenceDiagram }               from './ConnectionSequenceDiagram'
import { Details }                                 from './EventDetails'
import * as UI                                     from './styledComponents'

const useConnectionDetail = (event: DisplayEvent) => {
  const intl = getIntl()
  const { $t } = intl
  const { mac, apName, ssid, radio, code, ttc, state } = event

  const eventDetails = [
    { label: $t({ defaultMessage: 'AP MAC' }), value: mac },
    { label: $t({ defaultMessage: 'AP Name' }), value: apName },
    { label: $t({ defaultMessage: 'SSID' }), value: ssid as string },
    { label: $t({ defaultMessage: 'Radio' }), value: radio
      ? formatter('radioFormat')(radio)
      : $t({ defaultMessage: 'Unknown' })
    }
  ]

  switch (event.category) {
    case FAILURE: {
      const failureType = (code)
        ? mapCodeToFailureText(code, intl)
        : $t({ defaultMessage: 'Unknown' })
      eventDetails.push({
        label: $t({ defaultMessage: 'Failure Type' }),
        value: failureType
      })

      const reason = clientEventDescription(event.event, state)
      eventDetails.push({
        label: $t({ defaultMessage: 'Reason' }),
        value: $t(reason)
      })
      break
    }

    case SLOW: {
      eventDetails.push({
        label: $t({ defaultMessage: 'Time to Connect' }),
        value: formatter('durationFormat')(ttc)
      })
      break
    }

    case DISCONNECT: {
      eventDetails.push({
        label: $t({ defaultMessage: 'Reason' }),
        value: $t({ defaultMessage: '{reason} (reason code {id})' }, {
          reason: $t(mapDisconnectCodeToReason(event.failedMsgId)),
          id: event.failedMsgId
        })
      })
      break
    }
  }

  return eventDetails
}

export function ConnectionEventPopover ({ children, event }:
  { children?: React.ReactNode, event: DisplayEvent }) {
  const [open, setOpen] = React.useState(false)
  const hide = () => { setOpen(false) }
  const rowData = useConnectionDetail(event)
  const failureExtra: ReactNode = (event.category === FAILURE)
    ? <ConnectionSequenceDiagram
      failedMsgId={event.failedMsgId ?? ''}
      messageIds={event.messageIds ?? []}
      apMac={event.mac}
    />
    : null
  return (
    <UI.PopoverWrapper>
      <Popover
        content={<Details fields={rowData} openHandler={hide} extra={failureExtra}/>}
        trigger='click'
        placement='bottom'
        // getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        visible={open}
        onVisibleChange={setOpen}
        arrowPointAtCenter
      >
        {children}
      </Popover>
    </UI.PopoverWrapper>
  )
}