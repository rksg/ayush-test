import { useEffect, useState } from 'react'

import { Form, Select, Input } from 'antd'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { useGetAAAPolicyListQuery } from '@acx-ui/rc/services'
import { AaaServerOrderEnum }       from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

import AAAPolicyModal from './AAAPolicyModal'

const AAAInstance = (props:{
  serverLabel: string,
  type: string
}) => {
  const { $t } = useIntl()
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
        label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
        children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
          ipAddress: get(form.getFieldValue(props.type),
            `${AaaServerOrderEnum.PRIMARY}.ip`),
          port: get(form.getFieldValue(props.type),
            `${AaaServerOrderEnum.PRIMARY}.port`)
        })} />
      <Form.Item
        label={$t({ defaultMessage: 'Shared Secret:' })}
        children={<Input.Password
          readOnly
          bordered={false}
          value={get(form.getFieldValue(props.type),
            `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
        />}
      />
      {form.getFieldValue(props.type)?.[AaaServerOrderEnum.SECONDARY]&&<>
        <Form.Item
          label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
          children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
            ipAddress: get(form.getFieldValue(props.type),
              `${AaaServerOrderEnum.SECONDARY}.ip`),
            port: get(form.getFieldValue(props.type),
              `${AaaServerOrderEnum.SECONDARY}.port`)
          })} />
        <Form.Item
          label={$t({ defaultMessage: 'Shared Secret:' })}
          children={<Input.Password
            readOnly
            bordered={false}
            value={get(form.getFieldValue(props.type),
              `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
          />}
        />
      </>}
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
