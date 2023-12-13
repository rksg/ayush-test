import { useContext } from 'react'

import { Form, InputNumber } from 'antd'
import { useIntl }           from 'react-intl'

import { Tooltip }              from '@acx-ui/components'
import { GuestNetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext     from '../../NetworkFormContext'
import { UserConnectionForm } from '../UserConnectionForm'

export function UserConnectionTab () {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)

  const guestNetworkType = data?.guestPortal?.guestNetworkType
  const isShowMaxDevices = guestNetworkType === GuestNetworkTypeEnum.HostApproval
    || guestNetworkType === GuestNetworkTypeEnum.SelfSignIn


  const UserConnectionComponent = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <UserConnectionForm />
      </div>
    )
  }

  return (<>
    {isShowMaxDevices &&
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr' }}>
        <Form.Item
          name={['guestPortal','maxDevices']}
          label={<>
            {$t({ defaultMessage: 'Max number of devices per credentials' })}
            <Tooltip.Question title={$t({
              // eslint-disable-next-line max-len
              defaultMessage: 'The maximal number of devices that the guest can connect using the credentials he is provided with'
            })}
            placement='bottom' />
          </>}
          initialValue={1}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please enter a number from 1 to 10' })
          }, {
            type: 'number', max: 10, min: 1,
            message: $t({ defaultMessage: 'Please enter a number from 1 to 10' })
          }]}
          style={{ marginBottom: '15px' }}
          children={<InputNumber min={1} max={10} style={{ width: '80px' }} />}
        />
      </div>
    }
    <UserConnectionComponent/>
  </>)
}