import { Form, Input, InputNumber } from 'antd'
import { useIntl }                  from 'react-intl'

import { PasswordInput }                   from '@acx-ui/components'
import { useGetLbsServerProfileListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  lbsVenueNameRegExp,
  servicePolicyNameRegExp,
  networkWifiSecretRegExp,
  domainNameRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


const LbsServerProfileSettingForm = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { data } = useGetLbsServerProfileListQuery({
    params,
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  })

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
          name='lbsVenueName'
          label={$t({ defaultMessage: 'LBS <VenueSingular></VenueSingular> Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 16 },
            { validator: (_, value) => lbsVenueNameRegExp(value) }
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
          initialValue={8443}
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
    </>
  )
}
export default LbsServerProfileSettingForm
