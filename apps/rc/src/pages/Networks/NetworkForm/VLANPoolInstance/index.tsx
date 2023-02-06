import { useEffect, useState } from 'react'

import { Form, Select, Input } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

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
    <div style={{ display: 'grid', gridTemplateColumns: '210px auto' }}>
      <Form.Item
        name={['wlan', 'advancedCustomization','vlanPool','id']}
        label={$t({ defaultMessage: 'Select VLAN Pool' })}
        rules={[
          { required: true }
        ]}
        children={<Select
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
          options={vlanPoolList}
        />}
      />
      <Form.Item name={['wlan', 'advancedCustomization','vlanPool','name']} noStyle>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item name={['wlan', 'advancedCustomization','vlanPool','vlanMembers']} noStyle>
        <Input type='hidden' />
      </Form.Item>
      <VLANPoolModal updateInstance={(data)=>{
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
      }}/>

    </div>
  )
}

export default VLANPoolInstance
