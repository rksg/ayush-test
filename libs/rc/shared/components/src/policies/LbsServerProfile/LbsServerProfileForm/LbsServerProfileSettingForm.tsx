import { Form, Input, InputNumber } from 'antd'
import { useIntl }                  from 'react-intl'

import { PasswordInput }      from '@acx-ui/components'
import {
  checkObjectNotExists,
  lbsServerVenueNameRegExp,
  servicePolicyNameRegExp,
  networkWifiSecretRegExp,
  domainNameRegExp,
  TableResult,
  LbsServerProfileViewModel
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { LbsServerConnectionProtocolInfo } from '../LbsServerConnectionProtocolInfo/LbsServerConnectionProtocolInfo'

// eslint-disable-next-line max-len
const LbsServerProfileSettingForm = ( props: { list : TableResult<LbsServerProfileViewModel, unknown> | undefined } ) => {
  const { $t } = useIntl()
  const params = useParams()

  const data = props.list

  const nameValidator = (value: string) => {
    if (data?.data && value) {
      const list = data.data
        .filter(n => n.id !== params.policyId)
        .map(n => n.name)

      // eslint-disable-next-line max-len
      return checkObjectNotExists(list, value, $t({ defaultMessage: 'Location Based Service Server' }))
    }
    return Promise.resolve()
  }


  return (
    <>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Profile Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => servicePolicyNameRegExp(value) },
          { validator: (_, value) => nameValidator(value) }
        ]}
        validateFirst
        hasFeedback
        initialValue={''}
        children={<Input />}
      />
      <div>
        <Form.Item
          name='lbsServerVenueName'
          // Not support VenueSingular for Hospitality Vertical
          // eslint-disable-next-line custom/enforce-venue-placeholder
          label={$t({ defaultMessage: 'LBS Server Venue Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 16 },
            { validator: (_, value) => lbsServerVenueNameRegExp(value) }
          ]}
          initialValue={''}
          children={<Input />}
        />
        <Form.Item
          name='serverAddress'
          style={{ display: 'inline-block', width: 'calc(80%)' }}
          rules={[
            { required: true },
            { validator: (_, value) => domainNameRegExp(value) }
          ]}
          label={$t({ defaultMessage: 'Server Address' })}
          initialValue={''}
          children={<Input />}
        />
        <Form.Item
          name='serverPort'
          style={{
            display: 'inline-block',
            width: 'calc(14%)',
            float: 'right',
            marginRight: '10px'
          }}
          label={$t({ defaultMessage: 'Port' })}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={8883}
          children={<InputNumber min={1} max={65535} />}
        />
      </div>
      <Form.Item
        name='password'
        label={$t({ defaultMessage: 'Password' })}
        initialValue={''}
        rules={[
          { required: true },
          { min: 8 },
          { max: 64 },
          { validator: (_, value) => networkWifiSecretRegExp(value) }
        ]}
        children={<PasswordInput />}
      />
      <LbsServerConnectionProtocolInfo />
    </>
  )
}
export default LbsServerProfileSettingForm
