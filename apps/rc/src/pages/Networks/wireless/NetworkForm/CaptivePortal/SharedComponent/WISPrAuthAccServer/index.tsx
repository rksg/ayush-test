import { useState, useEffect, useContext } from 'react'

import {
  Space,
  Form,
  Switch,
  Select,
  Input,
  Radio
} from 'antd'
import _             from 'lodash'
import { get }       from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Subtitle, Tooltip }               from '@acx-ui/components'
import { useGetAAAPolicyListQuery }        from '@acx-ui/rc/services'
import { AaaServerOrderEnum, AAATempType } from '@acx-ui/rc/utils'


import AAAInstance        from '../../../AAAInstance'
import AAAPolicyModal     from '../../../AAAInstance/AAAPolicyModal'
import * as contents      from '../../../contentsMap'
import NetworkFormContext from '../../../NetworkFormContext'


export function WISPrAuthAccServer () {
  const { $t } = useIntl()
  const params = useParams()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const { data: aaaListQuery } = useGetAAAPolicyListQuery({ params })
  const aaaServices = aaaListQuery?.data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [aaaList, setAaaList]= useState(aaaServices)
  const [aaaData, setAaaData]= useState([] as AAATempType[])
  const radiusValue = Form.useWatch('authRadius')
  const [
    enableAccountingService,
    authRadius,
    accountingRadius
  ] = [

    +
    useWatch<boolean>(['enableAccountingService']),
    useWatch('authRadius'),
    useWatch('accountingRadius')
  ]

  const onChange = (value: boolean, fieldName: string) => {
    if(!value){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], undefined)
    }
    setData && setData({ ...(!value?_.omit(data, 'guestPortal.wisprPage.accountingRadius'):data),
      [fieldName]: value })
  }

  useEffect(()=>{
    if(aaaListQuery?.data){
      setAaaData([...aaaListQuery.data])
      setAaaList(((aaaListQuery.data?.filter(d => d.type === 'AUTHENTICATION')))
        .map(m => ({ label: m.name, value: m.id })))
    }
  },[aaaListQuery])
  useEffect(()=>{
    if(authRadius){
      form.setFieldValue(['guestPortal','wisprPage','authRadius'], authRadius)
    }
  },[authRadius])
  useEffect(()=>{
    if(accountingRadius){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], accountingRadius)
    }
  },[accountingRadius])

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Connections' })}</Subtitle>

        <Form.Item name={['guestPortal','wisprPage','authType']}>
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={'RADIUS'}>Authenticate Connections</Radio>
              <Space>
                <Form.Item label={$t({ defaultMessage: 'Authentication Server' })}>

                  <Form.Item
                    name={'authRadiusId'}
                    noStyle
                    label={$t({ defaultMessage: 'Authentication Server' })}
                    rules={[
                      {
                        validator: (_, value) => {
                          const disabled = true
                          if (disabled || value !== '') {
                            return Promise.resolve()
                          }
                          return Promise.reject()
                        }
                      }
                    ]}
                    initialValue={''}
                    children={
                      <Select
                        style={{ width: 210 }}
                        disabled={true}
                        onChange={(value)=>{
                          // eslint-disable-next-line max-len
                          form.setFieldValue('authRadius' ,aaaData?.filter(d => d.id === value)[0])}}
                        options={[
                          { label: $t({ defaultMessage: 'Select server' }), value: '' },
                          ...aaaList
                        ]}
                      />}
                  />
                  <Tooltip>
                    <AAAPolicyModal updateInstance={(data)=>{
                      aaaList.push({
                        label: data.name, value: data.id })
                      setAaaList([...aaaList])
                      aaaData.push({ ...data })
                      setAaaData([...aaaData])
                      form.setFieldValue('authRadiusId', data.id)
                      form.setFieldValue('authRadius', data)
                    }}
                    aaaCount={aaaData.length}
                    type={'AUTHENTICATION'}
                    />
                  </Tooltip>
                </Form.Item>
              </Space>
              <Radio value={'ALWAYS_ACCEPT'}>Accept All Connections</Radio>
            </Space>
          </Radio.Group>
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
              children={<Input.Password
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
              children={<Input.Password
                readOnly
                bordered={false}
                value={get(radiusValue,
                  `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
              />}
            />
          </>}
        </div>
        <Form.Item
          name={'authRadius'}
          hidden
        />

      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={
            (checked)=>onChange(checked, 'enableAccountingService')}/>
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        }
        <Form.Item name={['guestPortal','wisprPage','accountingRadius']} noStyle/>
        <Form.Item name={['guestPortal','wisprPage','authRadius']} noStyle/>
      </div>
    </Space>
  )
}
