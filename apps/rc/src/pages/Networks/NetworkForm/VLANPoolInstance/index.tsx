import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { useGetVLANPoolPolicyListQuery } from '@acx-ui/rc/services'

import VLANPoolModal from './VLANPoolModal'

const VLANPoolInstance = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const { data } = useGetVLANPoolPolicyListQuery({ params })
  const vlanPoolServices = data?.map(m => ({ label: m.policyName, value: m.id })) ?? []
  const [vlanPoolList, setVlanPoolList]= useState(vlanPoolServices)
  useEffect(()=>{
    if(data){
      setVlanPoolList(data?.map(m => ({ label: m.policyName, value: m.id })) ?? [])
    }
  },[data])
  return (
    <div>
      <Form.Item
        name='vlanPoolPolicyProfileId'
        label={$t({ defaultMessage: 'Select VLAN Pool' })}
        rules={[
          { required: true }
        ]}
        children={<Select
          options={[
            ...vlanPoolList
          ]}
        />}
      />
      <Form.Item>
        <VLANPoolModal updateInstance={(data)=>{
          vlanPoolList.push({
            label: data.policyName, value: data.id })
          setVlanPoolList([...vlanPoolList])
          form.setFieldValue('vlanPoolPolicyProfileId', data.id)
        }}/>
      </Form.Item>
    </div>
  )
}

export default VLANPoolInstance
