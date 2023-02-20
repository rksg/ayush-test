import { useEffect, useState } from 'react'

import { Form, Select, Input, Space } from 'antd'
import { DefaultOptionType }          from 'antd/lib/select'
import _                              from 'lodash'
import { useIntl }                    from 'react-intl'
import { useParams }                  from 'react-router-dom'

import { Tooltip }              from '@acx-ui/components'
import { useVlanPoolListQuery } from '@acx-ui/rc/services'

import VLANPoolModal from './VLANPoolModal'


const listPayload = {
  fields: ['name', 'id'], sortField: 'name',
  sortOrder: 'ASC', page: 1, pageSize: 10000
}

const VLANPoolInstance = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  // const { data } = useGetVLANPoolPolicyListQuery({ params })
  const { data } = useVlanPoolListQuery({
    params,
    payload: listPayload
  })

  const [vlanPoolList, setVlanPoolList]= useState<DefaultOptionType[]>()
  useEffect(()=>{
    if(data){
      setVlanPoolList(data.map(m => ({ label: m.name, value: m.id })))
    }
  },[data])
  return (
    <>
      <Form.Item label={$t({ defaultMessage: 'Select VLAN Pool' })}><Space>
        <Form.Item
          label={$t({ defaultMessage: 'Select VLAN Pool' })}
          name={['wlan', 'advancedCustomization','vlanPool','id']}
          noStyle
          initialValue={''}
          rules={[
            { required: true }
          ]}
          children={<Select
            style={{ width: 210 }}
            onChange={(value)=>{
              const record = _.find(data, { id: value })
              form.setFieldValue(['wlan', 'advancedCustomization','vlanPool','name'], record?.name)
              form.setFieldValue([
                'wlan',
                'advancedCustomization',
                'vlanPool',
                'vlanMembers'
              ], record?.vlanMembers)
            }}
            options={[
              { label: $t({ defaultMessage: 'Select Pool' }), value: '' },
              ...(vlanPoolList || [])
            ]}
          />}
        />
        <Tooltip><VLANPoolModal updateInstance={(data)=>{
          vlanPoolList &&
          setVlanPoolList([...vlanPoolList, { label: data.name, value: data.id }])
          form.setFieldValue(['wlan', 'advancedCustomization','vlanPool','id'], data.id)
          form.setFieldValue(['wlan', 'advancedCustomization','vlanPool','name'], data.name)
          form.setFieldValue([
            'wlan',
            'advancedCustomization',
            'vlanPool',
            'vlanMembers'
          ], (data.vlanMembers as string).split(','))
        }}/></Tooltip>
      </Space></Form.Item>
      <Form.Item name={['wlan', 'advancedCustomization','vlanPool','name']} noStyle>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item name={['wlan', 'advancedCustomization','vlanPool','vlanMembers']} noStyle>
        <Input type='hidden' />
      </Form.Item>
    </>
  )
}

export default VLANPoolInstance
