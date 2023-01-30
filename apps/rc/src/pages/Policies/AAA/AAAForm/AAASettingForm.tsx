import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Radio, Space } from 'antd'
import { useIntl }                                from 'react-intl'

import { GridCol, GridRow, StepsForm, Subtitle }                from '@acx-ui/components'
import { useGetAAAPolicyListQuery }                             from '@acx-ui/rc/services'
import {
  AAAPolicyType, networkWifiIpRegExp, networkWifiSecretRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


type AAASettingFormProps = {
  edit: boolean,
  saveState: AAAPolicyType
}

const AAASettingForm = (props: AAASettingFormProps) => {
  const { $t } = useIntl()
  const { edit, saveState } = props
  const params = useParams()
  const [originalName, setOriginalName] = useState('')
  const { data } = useGetAAAPolicyListQuery({ params: params })
  const form = Form.useFormInstance()
  useEffect(() => {
    if (edit && data) {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      setOriginalName(policyData?.name)
    }
  }, [data])

  useEffect(() => {
    if (edit && saveState) {
    }
  }, [saveState])
  return (
    <GridRow>
      <GridCol col={{ span: 8 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (rule, value) => {
              if (!edit && value
                  && data && data?.findIndex((policy) => policy.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The aaa policy with that name already exists' })
                )
              }
              if (edit && value && value !== originalName && data
                  && data?.filter((policy) => policy.name !== originalName)
                    .findIndex((policy) => policy.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The aaa policy with that name already exists' })
                )
              }
              return Promise.resolve()
            } }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='isAuth'
          label={$t({ defaultMessage: 'Profile Type' })}
          initialValue={true}
          children={<Radio.Group>
            <Space direction='vertical'>
              <Radio key='authentication' value={true}>
                {$t({ defaultMessage: 'Authentication' })}
              </Radio>
              <Radio key='accounting' value={false}>
                {$t({ defaultMessage: 'Accounting' })}
              </Radio>
            </Space>
          </Radio.Group>}
        />
        <Subtitle level={4}>{ $t({ defaultMessage: 'Primary' }) }</Subtitle>
        <div>
          <Form.Item
            name={['primary', 'ip']}
            style={{ display: 'inline-block', width: 'calc(80%)' , paddingRight: '20px' }}
            rules={[
              { required: true },
              { validator: (_, value) => networkWifiIpRegExp(value) }
            ]}
            label={$t({ defaultMessage: 'Server Address' })}
            initialValue={''}
            children={<Input/>}
          />
          <Form.Item
            name={['primary', 'port']}
            style={{ display: 'inline-block', width: 'calc(20%)' }}
            label={$t({ defaultMessage: 'Port' })}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
            initialValue={1812}
            children={<InputNumber min={1} max={65535} />}
          />
        </div>
        <Form.Item
          name={['primary', 'sharedSecret']}
          label={$t({ defaultMessage: 'Shared Secret' })}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiSecretRegExp(value) }
          ]}
          children={<Input.Password />}
        />
        <Subtitle level={4}>{ $t({ defaultMessage: 'Secondary' }) }</Subtitle>
        <div>
          <Form.Item
            name={['secondary', 'ip']}
            style={{ display: 'inline-block', width: 'calc(80%)' , paddingRight: '20px' }}
            rules={[
              { required: true },
              { validator: (_, value) => networkWifiIpRegExp(value) },
              { validator: (_, value) => {
                const primaryIP = form.getFieldValue(['primary', 'ip'])
                const primaryPort = form.getFieldValue(['primary', 'port'])
                const secPort = form.getFieldValue(['secondary', 'port'])
                if(value === primaryIP && primaryPort === secPort){
                  return Promise.reject(
                    $t({ defaultMessage: 'IP address and Port combinations must be unique' }))
                }
                return Promise.resolve()
              } }
            ]}
            label={$t({ defaultMessage: 'Server Address' })}
            initialValue={''}
            children={<Input/>}
          />
          <Form.Item
            name={['secondary', 'port']}
            style={{ display: 'inline-block', width: 'calc(20%)' }}
            label={$t({ defaultMessage: 'Port' })}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
            initialValue={1813}
            children={<InputNumber min={1} max={65535} />}
          />
        </div>
        <Form.Item
          name={['secondary', 'sharedSecret']}
          label={$t({ defaultMessage: 'Shared Secret' })}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiSecretRegExp(value) }
          ]}
          children={<Input.Password />}
        />
      </GridCol>
      <GridCol col={{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default AAASettingForm
