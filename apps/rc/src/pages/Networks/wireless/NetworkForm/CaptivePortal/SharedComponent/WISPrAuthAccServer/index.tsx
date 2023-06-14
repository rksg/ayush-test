import { useState, useEffect, useContext } from 'react'

import {
  Space,
  Form,
  Switch,
  Select,
  Radio
} from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Subtitle, Tooltip, PasswordInput }                from '@acx-ui/components'
import { get }                                             from '@acx-ui/config'
import { useGetAAAPolicyListQuery }                        from '@acx-ui/rc/services'
import { AaaServerOrderEnum, AAATempType, AuthRadiusEnum } from '@acx-ui/rc/utils'

import AAAInstance        from '../../../AAAInstance'
import AAAPolicyModal     from '../../../AAAInstance/AAAPolicyModal'
import * as contents      from '../../../contentsMap'
import NetworkFormContext from '../../../NetworkFormContext'

import { Description }         from './styledComponents'
import { WISPrAuthAccContext } from './WISPrAuthAccServerReducer'

export function WISPrAuthAccServer (props : {
  onClickAuth: () => void,
  onClickAllAccept: () => void
}) {
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
  const context = useContext(WISPrAuthAccContext)

  const [
    enableAccountingService,
    authRadius,
    accountingRadius
  ] = [
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
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Service' })}</Subtitle>

        <Form.Item
          name={['guestPortal','wisprPage','authType']}
          initialValue={'RADIUS'}
        >
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={AuthRadiusEnum.RADIUS}
                data-testid='radius'
                onChange={() => {props.onClickAuth()}}>
                {$t({ defaultMessage: 'Authenticate Connections' })}
              </Radio>
              <Space>
                <Form.Item label={$t({ defaultMessage: 'Authentication Server' })}>
                  <Space>
                    <Form.Item
                      name={'authRadiusId'}
                      noStyle
                      label={$t({ defaultMessage: 'Authentication Server' })}
                      rules={[
                        {
                          validator: (_, value) => {
                            if (context.state.isDisabled.Auth || value !== '') {
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
                          disabled={context.state.isDisabled.Auth}
                          data-testid='radius_server_selection'
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
                      <AAAPolicyModal
                        updateInstance={(data)=>{
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
                        disabled={context.state.isDisabled.Auth}
                      />
                    </Tooltip>
                  </Space>
                </Form.Item>
              </Space>
              <Radio
                data-testid='always_accept'
                value={AuthRadiusEnum.ALWAYS_ACCEPT}
                disabled={context.state.isDisabled.AllAccept}
                onChange={() => {props.onClickAllAccept()}}>
                {context.state.isDisabled.AllAccept ? <Tooltip
                  placement='bottom'
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  // eslint-disable-next-line max-len
                  title={$t({ defaultMessage: 'In order to enable this option you have to uncheck the “Enable MAC auth bypass” option' })}>
                  {$t({ defaultMessage: 'Accept All Connections' })}
                </Tooltip> : $t({ defaultMessage: 'Accept All Connections' })}
              </Radio>
              <Description>
                <FormattedMessage
                  values={{
                    br: () => <br />,
                    link: <a
                      className='link'
                      target='_blank'
                      href={get('API_DOCUMENTATION_URL')}
                      rel='noreferrer'>
                      {$t({ defaultMessage: 'RUCKUS One WISPr API Reference' })}
                    </a>
                  }}

                  defaultMessage={
                    // eslint-disable-next-line
                    `Additional external configuration is required for this feature to function properly.
                    <br></br>
                    For more details, refer to {link}.`}
                />
              </Description>
            </Space>
          </Radio.Group>
        </Form.Item>

        <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
          width: 210, paddingLeft: 5 }}>
          {radiusValue?.[AaaServerOrderEnum.PRIMARY]&&<>
            <Form.Item
              label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
              children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                ipAddress: _.get(radiusValue,
                  `${AaaServerOrderEnum.PRIMARY}.ip`),
                port: _.get(radiusValue,
                  `${AaaServerOrderEnum.PRIMARY}.port`)
              })} />
            <Form.Item
              label={$t({ defaultMessage: 'Shared Secret' })}
              children={<PasswordInput
                readOnly
                bordered={false}
                value={_.get(radiusValue,
                  `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
              />}
            /></>}
          {radiusValue?.[AaaServerOrderEnum.SECONDARY]&&<>
            <Form.Item
              label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
              children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                ipAddress: _.get(radiusValue,
                  `${AaaServerOrderEnum.SECONDARY}.ip`),
                port: _.get(radiusValue,
                  `${AaaServerOrderEnum.SECONDARY}.port`)
              })} />
            <Form.Item
              label={$t({ defaultMessage: 'Shared Secret' })}
              children={<PasswordInput
                readOnly
                bordered={false}
                value={_.get(radiusValue,
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
