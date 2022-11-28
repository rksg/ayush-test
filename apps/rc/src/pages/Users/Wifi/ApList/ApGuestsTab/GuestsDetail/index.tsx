import { Divider, Form } from 'antd'
import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'

import { Guest, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                  from '@acx-ui/react-router-dom'

import { renderExpires, renderGuestType } from '../GuestsTable'

interface GuestDetailsDrawerProps {
  currentGuest: Guest,
}

export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props
  const hasGuestManagerRole = false   // from userProfile()

  const allowedNetwork = function (currentGuest: Guest) {
    if (currentGuest.networkId && !hasGuestManagerRole) {
      return (
        <TenantLink to={`/networks/${currentGuest.networkId}/network-details/aps`}>
          {currentGuest.ssid}</TenantLink>
      )
    } else if (currentGuest.networkId && hasGuestManagerRole) {
      return currentGuest.ssid
    } else {
      return 'None'
    }
  }

  return (<Form
    labelCol={{ span: 10 }}
    labelAlign='left'
    style={{ paddingLeft: '14px' }}
  >

    <Form.Item
      label={$t({ defaultMessage: 'Guest Type:' })}
      children={renderGuestType(currentGuest.guestType)} />

    <Form.Item
      label={$t({ defaultMessage: 'Guest Name:' })}
      children={currentGuest.name} />

    <Form.Item
      label={$t({ defaultMessage: 'Mobile Phone:' })}
      children={transformDisplayText(currentGuest.mobilePhoneNumber)} />

    <Form.Item
      label={$t({ defaultMessage: 'Email:' })}
      children={transformDisplayText(currentGuest.emailAddress)} />

    <Form.Item
      label={$t({ defaultMessage: 'Notes:' })}
      children={transformDisplayText(currentGuest.notes)} />

    <Divider />

    <Form.Item
      label={$t({ defaultMessage: 'Allowed Network:' })}
      children={allowedNetwork(currentGuest)} />

    <Form.Item
      label={$t({ defaultMessage: 'Guest Created:' })}
      children={moment(currentGuest.expiryDate).format('DD/MM/YYYY HH:mm')} />

    <Form.Item
      label={$t({ defaultMessage: 'Access Expires:' })}
      children={renderExpires(currentGuest)} />

    <Form.Item
      label={$t({ defaultMessage: 'Max. Number of Clients:' })}
      children={currentGuest.maxNumberOfClients || '0'} />

  </Form>
  )
}

