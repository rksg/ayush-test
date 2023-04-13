import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions
} from '@acx-ui/components'
import {
  MigrateState
} from '@acx-ui/rc/utils'

// import * as UI from '../styledComponents'

interface GuestDetailsDrawerProps {
  currentGuest: MigrateState,
  triggerClose: () => void
}

export const defaultGuestPayload = {
  searchString: '',
  searchTargetFields: [
    'name',
    'mobilePhoneNumber',
    'emailAddress'],
  fields: [
    'creationDate',
    'name',
    'passDurationHours',
    'id',
    'networkId',
    'maxNumberOfClients',
    'notes',
    'clients',
    'guestStatus',
    'emailAddress',
    'mobilePhoneNumber',
    'guestType',
    'ssid',
    'socialLogin',
    'expiryDate',
    'cog'
  ]
}


export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props

  return (<>
    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Bak File' })}
        children={currentGuest.name} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Start Time' })}
        children={currentGuest.startTime} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'End Time' })}
        children={currentGuest.endTime} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'State' })}
        children={currentGuest.state} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={''} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Unsupported model' })}
        // eslint-disable-next-line max-len
        children={'7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17'} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Duplicated in tenant' })}
        // eslint-disable-next-line max-len
        children={'7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17 7B:2D:F2:24:F4:17'} />
    </Descriptions>

  </>)
}
