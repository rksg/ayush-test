import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { useGetAAAPolicyListQuery } from '@acx-ui/rc/services'

import AAAPolicyModal from './AAAPolicyModal'

const AAAInstance = () => {
  const { $t } = useIntl()
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
    <div>
      <Form.Item
        name='aaaPolicyProfileId'
        label={$t({ defaultMessage: 'AAA Server' })}
        rules={[
          { required: true }
        ]}
        children={<Select
          options={[
            ...aaaList
          ]}
        />}
      />
      <Form.Item>
        <AAAPolicyModal updateInstance={(data)=>{
          aaaList.push({
            label: data.profileName, value: data.id })
          setAaaList([...aaaList])
          form.setFieldValue('aaaPolicyProfileId', data.id)
        }}/>
      </Form.Item>
    </div>
  )
}

export default AAAInstance
