import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Tooltip, PasswordInput }                                   from '@acx-ui/components'
import { useGetAAAPolicyViewModelListQuery, useLazyAaaPolicyQuery } from '@acx-ui/rc/services'
import { AaaServerOrderEnum }                                       from '@acx-ui/rc/utils'

import * as contents      from '../contentsMap'
import NetworkFormContext from '../NetworkFormContext'

import AAAPolicyModal from './AAAPolicyModal'
const radiusType: { [key:string]:string }={
  authRadius: 'AUTHENTICATION',
  accountingRadius: 'ACCOUNTING'
}
const AAAInstance = (props:{ serverLabel: string, type: 'authRadius' | 'accountingRadius' }) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const radiusValue = Form.useWatch(props.type)
  const radiusIdName = props.type + 'Id'
  const selectedAaaProfileId = Form.useWatch(radiusIdName)
  const { data: aaaListQuery } = useGetAAAPolicyViewModelListQuery({ params, payload: {} })
  const [ getAaaPolicy ] = useLazyAaaPolicyQuery()
  const [aaaList, setAaaList]= useState([] as DefaultOptionType[])
  const { data, setData } = useContext(NetworkFormContext)

  useEffect(()=>{
    if(aaaListQuery?.data){
      setAaaList(aaaListQuery.data?.filter(d => d.type === radiusType[props.type])
        .map(m => ({ label: m.name, value: m.id })))
    }
  },[aaaListQuery])

  useEffect(() => {
    const currentDataAaaProfileId = data && data[props.type]?.id
    if (radiusValue && radiusValue.name && radiusValue.id !== currentDataAaaProfileId) {
      setData && setData({
        ...data,
        [props.type]: radiusValue,
        [radiusIdName]: radiusValue.id
      })
    }

  }, [radiusValue])

  useEffect(() => {
    if (selectedAaaProfileId) {
      getAaaPolicy({ params: { ...params, policyId: selectedAaaProfileId } })
        .unwrap()
        .then((data) => form.setFieldValue(props.type, data))
    } else {
      form.setFieldValue(props.type, undefined)
    }
  }, [selectedAaaProfileId])

  return (
    <>
      <Form.Item label={props.serverLabel}><Space>
        <Form.Item
          name={radiusIdName}
          noStyle
          label={props.serverLabel}
          rules={[
            { required: true }
          ]}
          initialValue={''}
          children={<Select
            style={{ width: 210 }}
            options={[
              { label: $t({ defaultMessage: 'Select RADIUS' }), value: '' },
              ...aaaList
            ]}
          />}
        />
        <Tooltip>
          <AAAPolicyModal updateInstance={(data) => {
            setAaaList([...aaaList, { label: data.name, value: data.id }])
            form.setFieldValue(radiusIdName, data.id)
            form.setFieldValue(props.type, data)
          }}
          aaaCount={aaaList.length}
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
        children={<></>}
        hidden
      />
    </>
  )
}

export default AAAInstance
