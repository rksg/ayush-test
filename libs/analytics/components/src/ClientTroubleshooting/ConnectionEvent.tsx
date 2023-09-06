import React, { ReactNode } from 'react'

import { Popover, PopoverProps } from 'antd'

import {
  clientEventDescription,
  mapCodeToFailureText,
  mapDisconnectCode,
  mapDisconnectCodeToReason
}                    from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { FAILURE, DisplayEvent, SLOW, DISCONNECT } from './config'
import { ConnectionSequenceDiagram }               from './ConnectionSequenceDiagram'
import { DownloadPcap }                            from './DownloadPcap'
import { Details }                                 from './EventDetails'
import * as UI                                     from './styledComponents'

export const getConnectionDetails = (event: DisplayEvent) => {
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
        value: ((typeof reason === 'string' || reason instanceof String) ? reason :
          $t(reason)) as string
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
        label: $t({ defaultMessage: 'Disconnect Type' }),
        value: $t(mapDisconnectCode(event.event))
      })
      eventDetails.push({
        label: $t({ defaultMessage: 'Reason' }),
        // eslint-disable-next-line max-len
        value: $t({ defaultMessage: '{reason} {id, select, null {} other {(reason code {id})}}' }, {
          reason: $t(mapDisconnectCodeToReason(event.event, event.failedMsgId)),
          id: event.failedMsgId
        })
      })
      break
    }
  }

  return eventDetails
}

export const getFailureExtra = (event: DisplayEvent) => {
  return (event.category === FAILURE)
    ? <ConnectionSequenceDiagram
      failedMsgId={event.failedMsgId ?? ''}
      messageIds={event.messageIds ?? []}
      apMac={event.mac} />
    : null
}

const getActions = (event: DisplayEvent) => {
  return (typeof event.pcapFilename === 'string')
    ? <DownloadPcap pcapFilename={event.pcapFilename} />
    : null
}

type ConnectionEventPopoverProps = Omit<PopoverProps, 'content'> & {
  children?: React.ReactNode,
  event: DisplayEvent
}

export function ConnectionEventPopover ({ children, event, ...rest }: ConnectionEventPopoverProps) {
  const [open, setOpen] = React.useState(rest.visible ?? false)
  const hide = () => {
    setOpen(false)
    rest.onVisibleChange && rest.onVisibleChange(false)
  }
  const rowData = getConnectionDetails(event)
  const failureExtra: ReactNode = getFailureExtra(event)
  const actions: ReactNode = getActions(event)
  const visibleHandle = (val: boolean) => {
    rest.onVisibleChange && rest.onVisibleChange(val)
    setOpen(val)
  }
  return (
    <UI.PopoverWrapper>
      <Popover
        {...rest}
        content={<Details
          fields={rowData}
          openHandler={hide}
          extra={failureExtra}
          actions={actions}
        />}
        trigger='click'
        visible={open}
        onVisibleChange={visibleHandle}
      >
        {children}
      </Popover>
    </UI.PopoverWrapper>
  )
}
