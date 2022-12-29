import React, { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Radio, Select, Space, Switch } from 'antd'
import { useIntl }                                                from 'react-intl'

import { GridCol, GridRow, StepsForm }                                          from '@acx-ui/components'
import { useGetAAAPolicyListQuery }                                             from '@acx-ui/rc/services'
import {
  AAAPolicyType, AAAPurposeEnum, networkWifiIpRegExp, networkWifiSecretRegExp
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
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const useAs=useWatch('useAs')
  const purposeKeys = Object.keys(AAAPurposeEnum) as Array<keyof typeof AAAPurposeEnum>
  const { data } = useGetAAAPolicyListQuery({ params: params })

  useEffect(() => {
    if (edit && data) {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      setOriginalName(policyData?.name)
    }
  }, [data])

  useEffect(() => {
    if (edit && saveState) {
      if(saveState.tacacsServer?.purpose){
        form.setFieldValue('useAs','tacacs')
      }
    }
  }, [saveState])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='profileName'
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
          name='useAs'
          label={$t({ defaultMessage: 'Use as' })}
          initialValue={'radius'}
          children={<Radio.Group>
            <Space direction='vertical'>
              <Radio key='radius' value='radius'>
                {$t({ defaultMessage: 'RADIUS Server' })}
              </Radio>
              <Radio key='tacacs' value='tacacs'>
                {$t({ defaultMessage: 'TACACS+ Server (Switch only)' })}
              </Radio>
            </Space>
          </Radio.Group>}
        />
        <Form.Item
          name={[ useAs+'Server' ,'serverAddress']}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          label={$t({ defaultMessage: 'Server Address' })}
          initialValue={''}
          children={<Input/>}
        />
        {useAs === 'radius'&&<Form.Item
          name={['radiusServer','authPort']}
          label={$t({ defaultMessage: 'Authentication Port' })}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={1812}
          children={<InputNumber min={1} max={65535} />}
        />}
        {useAs === 'radius'&&<Form.Item
          name={['radiusServer','acctPort']}
          label={$t({ defaultMessage: 'Accounting Port' })}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={1813}
          children={<InputNumber min={1} max={65535} />}
        />}
        {useAs !== 'radius'&&<Form.Item
          name={['tacacsServer','tacacsPort']}
          label={$t({ defaultMessage: 'TACACS+ Port' })}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={1815}
          children={<InputNumber min={1} max={65535} />}
        />}
        <Form.Item
          name={[ useAs+'Server' ,'sharedSecret']}
          label={$t({ defaultMessage: 'Shared Secret' })}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiSecretRegExp(value) }
          ]}
          children={<Input.Password />}
        />
        {useAs === 'radius'&&<Form.Item>
          <span>{$t({ defaultMessage: 'This is a Cloudpath server' })}</span>
          <Form.Item noStyle name={['radiusServer','isCloudpath']} valuePropName='checked'>
            <Switch/>
          </Form.Item>
        </Form.Item>}
        {useAs !== 'radius'&&<Form.Item
          name={['tacacsServer','purpose']}
          label={$t({ defaultMessage: 'Purpose' })}
          initialValue={'ALL'}
          children={<Select>
            {purposeKeys.map(item=>{
              return <Select.Option key={item} value={item}>
                {$t({ defaultMessage: '{purpose}' }, { purpose: AAAPurposeEnum[item] })}
              </Select.Option>
            })}
          </Select>}
        />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default AAASettingForm
