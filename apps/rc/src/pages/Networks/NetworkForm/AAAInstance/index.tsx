import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useParams }    from 'react-router-dom'

import { useGetAAAPolicyListQuery } from '@acx-ui/rc/services'

import AAAPolicyModal from './AAAPolicyModal'

const AAAInstance = (props:{
  serverLabel: string,
  type: string
}) => {
  const params = useParams()
  const form = Form.useFormInstance()
  const { data } = useGetAAAPolicyListQuery({ params })
  const aaaServices = data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [aaaList, setAaaList]= useState(aaaServices)
  useEffect(()=>{
    if(data){
      setAaaList(data?.map(m => ({ label: m.name, value: m.id })))
    }
  },[data])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px auto' }}>
      <Form.Item
        name={props.type+'PolicyProfileId'}
        label={props.serverLabel}
        rules={[
          { required: true }
        ]}
        children={<Select
          onChange={(value)=>{
            form.setFieldValue(props.type,
              data?.filter(d => d.id === value)[0])
          }}
          options={[
            ...aaaList
          ]}
        />}
      />
      <Form.Item
        name={props.type}
        hidden
      />
      <AAAPolicyModal updateInstance={(data)=>{
        aaaList.push({
          label: data.name, value: data.id })
        setAaaList([...aaaList])
        form.setFieldValue(props.type+'PolicyProfileId', data.id)
        form.setFieldValue(props.type, data)
      }}/>
    </div>
  )
}

export default AAAInstance
