import { useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Tooltip, PasswordInput }          from '@acx-ui/components'
import { useGetAAAPolicyListQuery }        from '@acx-ui/rc/services'
import { AaaServerOrderEnum, AAATempType } from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

import AAAPolicyModal from './AAAPolicyModal'
const radiusType: { [key:string]:string }={
  authRadius: 'AUTHENTICATION',
  accountingRadius: 'ACCOUNTING'
}
const AAAInstance = (props:{
  serverLabel: string,
  type: string
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const radiusValue = Form.useWatch(props.type)
  const { data: aaaListQuery } = useGetAAAPolicyListQuery({ params })
  const aaaServices = aaaListQuery?.data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [aaaList, setAaaList]= useState(aaaServices)
  const [aaaData, setAaaData]= useState([] as AAATempType[])
  useEffect(()=>{
    if(aaaListQuery?.data){
      setAaaData([...aaaListQuery.data])
      setAaaList(((aaaListQuery.data?.filter(d => d.type === radiusType[props.type])))
        .map(m => ({ label: m.name, value: m.id })))
    }
  },[aaaListQuery])
  return (
    <>
      <Form.Item label={props.serverLabel}><Space>
        <Form.Item
          name={props.type+'Id'}
          noStyle
          label={props.serverLabel}
          rules={[
            { required: true }
          ]}
          initialValue={''}
          children={<Select
            style={{ width: 210 }}
            onChange={(value)=>{
              form.setFieldValue(props.type,
                aaaData?.filter(d => d.id === value)[0])
            }}
            options={[
              { label: $t({ defaultMessage: 'Select RADIUS' }), value: '' },
              ...aaaList
            ]}
            data-testid='authRadiusId'
          />}
        />
        <Tooltip>
          <AAAPolicyModal updateInstance={(data)=>{
            aaaList.push({
              label: data.name, value: data.id })
            setAaaList([...aaaList])
            aaaData.push({ ...data })
            setAaaData([...aaaData])
            form.setFieldValue(props.type+'Id', data.id)
            form.setFieldValue(props.type, data)
          }}
          aaaCount={aaaData.length}
          type={radiusType[props.type]}
          />
        </Tooltip></Space>
      </Form.Item>
      <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
        width: 210, paddingLeft: 5 }}>
        {radiusValue?.[AaaServerOrderEnum.PRIMARY]&&<>
          <Form.Item
            label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
            children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
              ipAddress: get(radiusValue,
                `${AaaServerOrderEnum.PRIMARY}.ip`),
              port: get(radiusValue,
                `${AaaServerOrderEnum.PRIMARY}.port`)
            })} />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={get(radiusValue,
                `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
            />}
          /></>}
        {radiusValue?.[AaaServerOrderEnum.SECONDARY]&&<>
          <Form.Item
            label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
            children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
              ipAddress: get(radiusValue,
                `${AaaServerOrderEnum.SECONDARY}.ip`),
              port: get(radiusValue,
                `${AaaServerOrderEnum.SECONDARY}.port`)
            })} />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={get(radiusValue,
                `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
            />}
          />
        </>}
      </div>
      <Form.Item
        name={props.type}
        hidden
      />
    </>
  )
}

export default AAAInstance
