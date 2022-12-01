import { useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'
import { useIntl }                      from 'react-intl'

import { Alert }                      from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useVenuesListQuery }         from '@acx-ui/rc/services'
import { useParams }                  from '@acx-ui/react-router-dom'

interface EdgeSettingFormProps {
  isEdit?: boolean
}

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export const EdgeSettingForm = (props: EdgeSettingFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const [showOtpMessage, setShowOtpMessage] = useState(false)
  const { venueOptions } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: defaultPayload }, {
    selectFromResult: ({ data }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id }))
      }
    }
  })

  const needOtpMessage = (serialNumber: string) => {
    setShowOtpMessage(serialNumber.startsWith('96'))
  }

  return (
    <>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: 'Venue' })}
        rules={[{
          required: true
        }]}
      >
        <Select options={venueOptions} />
      </Form.Item>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'SmartEdge Name' })}
        rules={[{
          required: true
        }]}
        children={<Input />}
      />
      <Form.Item
        name='serialNumber'
        label={<>
          { $t({ defaultMessage: 'Serial Number' }) }
          <Tooltip
            title={$t({ defaultMessage: 'test' })}
            placement='bottom'
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please enter Serial Number' })
        }]}
        children={
          <Input
            disabled={props.isEdit}
            onChange={({ target: { value } }) => needOtpMessage(value)} />
        }
      />
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        children={<TextArea rows={4} maxLength={64} />}
      />
      <Form.Item
        name='tags'
        label={$t({ defaultMessage: 'Tags' })}
        children={<Input />}
      />
      {showOtpMessage ?
        <Alert message={
          $t({ defaultMessage: `The one-time-password (OTP) will be automatically sent to
          your email address or via SMS for verification when you add a virtual SmartEdge.
          The password will expire in 10 minutes and you must complete the authentication
          process before using it.` })
        }
        type='info'
        showIcon /> :
        null
      }
    </>
  )
}
