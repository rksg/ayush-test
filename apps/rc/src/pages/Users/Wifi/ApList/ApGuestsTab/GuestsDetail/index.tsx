import { Divider, Form } from 'antd'
import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'

import { cssStr }        from '@acx-ui/components'
import {
  Guest,
  GuestStatusEnum,
  transformDisplayText
} from '@acx-ui/rc/utils'

import {
  renderAllowedNetwork,
  renderExpires,
  renderGuestType
} from '../GuestsTable'

interface GuestDetailsDrawerProps {
  currentGuest: Guest,
}

export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props

  const renderStatus = function (row: Guest) {
    if (row.maxNumberOfClients !== -1 ||
      row.guestStatus.indexOf(GuestStatusEnum.NOT_APPLICABLE) === -1) {
      if (row.guestStatus === GuestStatusEnum.EXPIRED) {
        return <span style={{ color: cssStr('--acx-semantics-red-50') }}>{row.guestStatus}</span>
      } else if (row.guestStatus.indexOf(GuestStatusEnum.ONLINE)!== -1) {
        return <span style={{ color: cssStr('--acx-semantics-green-50') }}>{row.guestStatus}</span>
      }
    }
    return row.guestStatus
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
      children={renderAllowedNetwork(currentGuest)} />

    <Form.Item
      label={$t({ defaultMessage: 'Guest Created:' })}
      children={moment(currentGuest.expiryDate).format('DD/MM/YYYY HH:mm')} />

    <Form.Item
      label={$t({ defaultMessage: 'Access Expires:' })}
      children={renderExpires(currentGuest)} />

    <Form.Item
      label={$t({ defaultMessage: 'Max. Number of Clients:' })}
      children={currentGuest.maxNumberOfClients || '0'} />

    <Divider />

    <Form.Item
      label={$t({ defaultMessage: 'Status:' })}
      children={renderStatus(currentGuest)} />

  </Form>
  )
}


