import { useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import TextArea                from 'antd/lib/input/TextArea'
import { useIntl }             from 'react-intl'

import { Alert, Loader, Tooltip, useStepFormContext } from '@acx-ui/components'
import { useVenuesListQuery }                         from '@acx-ui/rc/services'
import { EdgeGeneralSetting }                         from '@acx-ui/rc/utils'
import { useParams }                                  from '@acx-ui/react-router-dom'
import { getIntl, validationMessages }                from '@acx-ui/utils'

interface EdgeSettingFormProps {
  isEdit?: boolean
  isFetching?: boolean
}

const venueOptionsDefaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

async function edgeSerialNumberValidator (value: string) {
  const { $t } = getIntl()
  if (value.startsWith('96')) return
  return Promise.reject($t(validationMessages.invalid))
}

export const EdgeSettingForm = (props: EdgeSettingFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const [showOtpMessage, setShowOtpMessage] = useState(false)
  const { form } = useStepFormContext<EdgeGeneralSetting>()
  const serialNumber = useWatch('serialNumber', form)
  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })

  useEffect(() => {
    setShowOtpMessage(!!serialNumber?.startsWith('96') && !!!props.isEdit)
  }, [serialNumber])

  return (
    <Loader states={[{
      isLoading: isVenuesListLoading,
      isFetching: props.isFetching
    }]}>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: 'Venue' })}
        rules={[{
          required: true
        }]}
      >
        <Select options={venueOptions} disabled={props.isEdit}/>
      </Form.Item>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'SmartEdge Name' })}
        rules={[
          { required: true },
          { max: 64 }
        ]}
        children={<Input />}
        validateFirst
      />
      <Form.Item
        name='serialNumber'
        label={<>
          { $t({ defaultMessage: 'Serial Number' }) }
          <Tooltip.Question
            title={$t({ defaultMessage: 'Serial Number' })}
            placement='bottom'
          />
        </>}
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please enter Serial Number' })
          },
          { max: 34 },
          { validator: (_, value) => edgeSerialNumberValidator(value) }
        ]}
        children={<Input disabled={props.isEdit} />}
        validateFirst
      />
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        children={<TextArea rows={4} maxLength={255} />}
      />
      {/* <Form.Item
        name='tags'
        label={$t({ defaultMessage: 'Tags' })}
        children={<Select mode='tags' />}
      /> */}
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
    </Loader>
  )
}
