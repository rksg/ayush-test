import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useParams }    from 'react-router-dom'

import { useGetAAAPolicyListQuery } from '@acx-ui/rc/services'

import AAAPolicyModal from './AAAPolicyModal'

const AAAInstance = (props:{
  serverLabel: string
}) => {
  const params = useParams()
  const form = Form.useFormInstance()
  const { data } = useGetAAAPolicyListQuery({ params })
  const aaaServices = data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [aaaList, setAaaList]= useState(aaaServices)
  useEffect(()=>{
    if(data){
      setAaaList(data?.map(m => ({ label: m.name, value: m.id })) ?? [])
    }
  },[data])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px auto' }}>
      <Form.Item
        name='aaaPolicyProfileId'
        label={props.serverLabel}
        rules={[
          { required: true }
        ]}
        children={<Select
          options={[
            ...aaaList
          ]}
        />}
      />
      <AAAPolicyModal updateInstance={(data)=>{
        const tempID = Date.now() + ''
        aaaList.push({
          label: data.profileName, value: tempID })
        setAaaList([...aaaList])
        form.setFieldValue('aaaPolicyProfileId', tempID)
      }}/>
    </div>
  )
}

export default AAAInstance
