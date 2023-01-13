import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

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

  const vlanPoolServices = data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [vlanPoolList, setVlanPoolList]= useState(vlanPoolServices)
  useEffect(()=>{
    if(data){
      setVlanPoolList(data?.map(m => ({ label: m.name, value: m.id })) ?? [])
    }
  },[data])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px auto' }}>
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
      <VLANPoolModal updateInstance={(data)=>{
        vlanPoolList.push({
          label: data.name, value: data.id })
        setVlanPoolList([...vlanPoolList])
        form.setFieldValue('vlanPoolPolicyProfileId', data.id)
      }}/>

    </div>
  )
}

export default VLANPoolInstance
