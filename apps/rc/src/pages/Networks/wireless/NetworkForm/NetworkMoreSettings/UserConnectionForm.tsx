import React, { useContext, useEffect, useState } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Select,
  Space
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Fieldset, Tooltip } from '@acx-ui/components'
import { GuestNetworkTypeEnum }      from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

import * as UI from './styledComponents'

const { Option } = Select
const sessionMapping: { [key:string]:number }={
  hours: 240,
  days: 10,
  minutes: 14400
}
const durationMapping: { [key:string]:number }={
  hours: 24,
  minutes: 1440
}
const lockoutMapping: { [key:string]:number }={
  days: 45,
  hours: 1092,
  minutes: 65535
}
const minutesMapping: { [key:string]:number }={
  hours: 60,
  days: 1440,
  minutes: 1
}
const oneDay = 1440
const oneHour = 60
export function UserConnectionForm () {

  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const [checkDuration,
    userSessionTimeoutUnit,
    lockoutPeriodUnit,
    macCredentialsDurationUnit,
    userSessionTimeout
  ]=[useWatch(['wlan','bypassCPUsingMacAddressAuthentication']),
    useWatch('userSessionTimeoutUnit'),
    useWatch('lockoutPeriodUnit'),
    useWatch('macCredentialsDurationUnit'),
    useWatch(['guestPortal','userSessionTimeout'])
  ]

  const { data, editMode, cloneMode } = useContext(NetworkFormContext)
  const [useDefaultSetting, setUseDefaultSetting]=useState(true)
  const [maxGracePeriod, setMaxGracePeriod]=useState(1440)

  useEffect(() => {
    if ((editMode || cloneMode)&&data) {
      if(_.get(data, 'userSessionTimeoutUnit')){
        setMaxGracePeriod(
          (data.guestPortal?.userSessionTimeout || 1) *
            minutesMapping[_.get(data, 'userSessionTimeoutUnit')]
          || maxGracePeriod)
      }else{
        setMaxGracePeriod(data.guestPortal?.userSessionTimeout || maxGracePeriod)
      }
      form.setFieldValue(['guestPortal','userSessionGracePeriod'],
        data.guestPortal?.userSessionGracePeriod)
      if(data.guestPortal?.lockoutPeriodEnabled){
        setUseDefaultSetting(false)
        const userSessionTimeoutUnit = _.get(data, 'userSessionTimeoutUnit')
        if(userSessionTimeoutUnit){
          form.setFieldValue('userSessionTimeoutUnit', userSessionTimeoutUnit)
        }
        if(data.guestPortal.userSessionTimeout && data.guestPortal.userSessionTimeout>=oneHour
          && data.guestPortal.userSessionTimeout%oneHour===0&&!userSessionTimeoutUnit){
          form.setFieldValue(['guestPortal','userSessionTimeout'],
            data.guestPortal.userSessionTimeout/oneHour)
          form.setFieldValue('userSessionTimeoutUnit', 'hours')
        }else if(!userSessionTimeoutUnit) {
          form.setFieldValue(['guestPortal','userSessionTimeout'],
            data.guestPortal.userSessionTimeout)
          form.setFieldValue('userSessionTimeoutUnit', 'minutes')
        }

        const lockoutPeriodUnit = _.get(data, 'lockoutPeriodUnit')
        if(lockoutPeriodUnit){
          form.setFieldValue('lockoutPeriodUnit', lockoutPeriodUnit)
        }
        if(data.guestPortal.lockoutPeriod && data.guestPortal.lockoutPeriod>=oneDay
          && data.guestPortal.lockoutPeriod%oneDay===0&&!lockoutPeriodUnit){
          form.setFieldValue(['guestPortal','lockoutPeriod'],
            data.guestPortal.lockoutPeriod/oneDay)
          form.setFieldValue('lockoutPeriodUnit', 'days')
        }else if(data.guestPortal.lockoutPeriod && data.guestPortal.lockoutPeriod>=oneHour
          && data.guestPortal.lockoutPeriod%oneHour===0&&!lockoutPeriodUnit){
          form.setFieldValue(['guestPortal','lockoutPeriod'],
            data.guestPortal.lockoutPeriod/oneHour)
          form.setFieldValue('lockoutPeriodUnit', 'hours')
        }else if(!lockoutPeriodUnit) {
          form.setFieldValue(['guestPortal','lockoutPeriod'],
            data.guestPortal.lockoutPeriod)
          form.setFieldValue('lockoutPeriodUnit', 'minutes')
        }
      }else{
        const userSessionTimeoutUnit = _.get(data, 'userSessionTimeoutUnit')
        if(userSessionTimeoutUnit){
          form.setFieldValue('userSessionTimeoutUnit', userSessionTimeoutUnit)
        }
        if(data.guestPortal?.userSessionTimeout && data.guestPortal.userSessionTimeout>=oneDay
          && data.guestPortal?.userSessionTimeout%oneDay===0&&!userSessionTimeoutUnit){
          form.setFieldValue(['guestPortal','userSessionTimeout'],
            data.guestPortal.userSessionTimeout/oneDay)
          form.setFieldValue('userSessionTimeoutUnit', 'days')
        }else if(data.guestPortal?.userSessionTimeout &&
          data.guestPortal.userSessionTimeout>=oneHour
          && data.guestPortal.userSessionTimeout%oneHour===0
          &&!userSessionTimeoutUnit){
          form.setFieldValue(['guestPortal','userSessionTimeout'],
            data.guestPortal.userSessionTimeout/oneHour)
          form.setFieldValue('userSessionTimeoutUnit', 'hours')
        }else if(!userSessionTimeoutUnit) {
          form.setFieldValue(['guestPortal','userSessionTimeout'],
            data.guestPortal?.userSessionTimeout)
          form.setFieldValue('userSessionTimeoutUnit', 'minutes')
        }

        const macCredentialsDurationUnit = _.get(data, 'macCredentialsDurationUnit')
        if(macCredentialsDurationUnit){
          form.setFieldValue('macCredentialsDurationUnit', macCredentialsDurationUnit)
        }
        if(data.guestPortal?.macCredentialsDuration &&
          data.guestPortal.macCredentialsDuration>=oneHour
          && data.guestPortal.macCredentialsDuration%oneHour===0
          && !macCredentialsDurationUnit){
          form.setFieldValue(['guestPortal','macCredentialsDuration'],
            data.guestPortal.macCredentialsDuration/oneHour)
          form.setFieldValue('macCredentialsDurationUnit', 'hours')
        }else if(!macCredentialsDurationUnit) {
          form.setFieldValue(['guestPortal','macCredentialsDuration'],
            data.guestPortal?.macCredentialsDuration)
          form.setFieldValue('macCredentialsDurationUnit', 'minutes')
        }
      }
    }
  }, [data])
  const changeSettings=()=>{
    form.setFieldValue(['guestPortal','lockoutPeriodEnabled'],useDefaultSetting)
    setUseDefaultSetting(!useDefaultSetting)
    if(useDefaultSetting){
      if(userSessionTimeoutUnit === 'days'){
        form.setFieldValue('userSessionTimeoutUnit', 'hours')
        form.setFieldValue(['guestPortal','userSessionTimeout'],
          form.getFieldValue(['guestPortal','userSessionTimeout'])*24)
      }
    }
  }
  const guestType = data?.guestPortal?.guestNetworkType

  return(
    <>
      <UI.Subtitle style={{ marginTop: 5 }}>{guestType!==GuestNetworkTypeEnum.ClickThrough &&
        $t({ defaultMessage: 'User Connection Settings' })}
      {guestType===GuestNetworkTypeEnum.ClickThrough &&useDefaultSetting&&
        $t({ defaultMessage: 'User Connection Settings(Default)' })}
      {guestType===GuestNetworkTypeEnum.ClickThrough &&!useDefaultSetting&&
        $t({ defaultMessage: 'User Connection Settings(Time limited)' })}
      </UI.Subtitle>
      {guestType===GuestNetworkTypeEnum.ClickThrough&&
        <Button type='link'
          onClick={changeSettings}
          style={{ float: 'right', fontSize: 12, marginTop: -28 }}>
          {!useDefaultSetting&&$t({ defaultMessage: 'Change to default connection' })}
          {useDefaultSetting&&$t({ defaultMessage: 'Change to Time limited connection' })}
        </Button>}
      {useDefaultSetting&&<Form.Item label={<>
        {$t({ defaultMessage: 'Allow the user to stay connected for' })}
        <Tooltip.Question
          title={$t({ defaultMessage:
            'Once this connection time limit has been reached, the client will be disconnected' })}
          placement='bottom' />
      </>}>
        <Space align='start'>
          <Form.Item
            noStyle
            name={['guestPortal','userSessionTimeout']}
            validateTrigger='onChange'
            initialValue={1}
            label={$t({ defaultMessage: 'User Session Timeout' })}
            rules={[
              { required: true },
              { validator: (_, value) => {
                if(value<(userSessionTimeoutUnit==='minutes'?2:1) ||
                  value >sessionMapping[userSessionTimeoutUnit]){
                  return Promise.reject($t({ defaultMessage:
                    'Value must between 2-14400 minutes or 1-240 hours or 1-10 days' }))
                }
                return Promise.resolve()
              } }
            ]}
          >
            <InputNumber data-testid='userSessionTimeout'
              min={userSessionTimeoutUnit==='minutes'?2:1}
              max={sessionMapping[userSessionTimeoutUnit]}
              style={{ width: '100px' }}
              onChange={(value)=>{
                if(userSessionTimeoutUnit === 'days'){
                  setMaxGracePeriod(value*24*60)
                }else if(userSessionTimeoutUnit === 'hours'){
                  setMaxGracePeriod(value*60)
                }else{
                  setMaxGracePeriod(value)
                }
              }}
            />
          </Form.Item>
          <Form.Item noStyle name='userSessionTimeoutUnit' initialValue={'days'}>
            <Select data-testid='userSessionTimeoutUnit'
              onChange={(value)=>{
                if(value === 'days'){
                  setMaxGracePeriod(userSessionTimeout*24*60)
                }else if(value === 'hours'){
                  setMaxGracePeriod(userSessionTimeout*60)
                }else{
                  setMaxGracePeriod(userSessionTimeout)
                }
              }}>
              <Option value={'days'}>{$t({ defaultMessage: 'Days' })}</Option>
              <Option value={'hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
              <Option value={'minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
            </Select>
          </Form.Item>
        </Space>
      </Form.Item>}
      {!useDefaultSetting&&<>
        <Form.Item label={<>
          {$t({ defaultMessage: 'Allow user to connect for' })}
          <Tooltip.Question
            title={$t({ defaultMessage: 'Once this aggregated connection time'+
            ' limit has been reached the client will be disconnected' })}
            placement='bottom' />
        </>}>
          <Space align='start'>
            <Form.Item
              noStyle
              name={['guestPortal','userSessionTimeout']}
              validateTrigger='onChange'
              initialValue={24}
              label={$t({ defaultMessage: 'User Session Timeout' })}
              rules={[
                { required: true },
                { validator: (_, value) => {
                  if(value<(userSessionTimeoutUnit==='minutes'?2:1) ||
                    value >sessionMapping[userSessionTimeoutUnit]){
                    return Promise.reject($t({ defaultMessage:
                      'Value must between 2-14400 minutes or 1-240 hours' }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              <InputNumber data-testid='userSessionTimeout'
                onChange={(value)=>{
                  if(userSessionTimeoutUnit === 'hours'){
                    setMaxGracePeriod(value*60)
                  }else{
                    setMaxGracePeriod(value)
                  }
                }}
                min={userSessionTimeoutUnit==='minutes'?2:1}
                max={sessionMapping[userSessionTimeoutUnit]}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item noStyle name='userSessionTimeoutUnit' initialValue={'hours'}>
              <Select data-testid='userSessionTimeoutUnit'
                onChange={(value)=>{
                  if(value === 'hours'){
                    setMaxGracePeriod(userSessionTimeout*60)
                  }else{
                    setMaxGracePeriod(userSessionTimeout)
                  }
                }}
              >
                <Option value={'hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item
          hidden
          name={['guestPortal','lockoutPeriodEnabled']}
          initialValue={false}
        />
        <Form.Item label={<>
          {$t({ defaultMessage: 'After that time, don\'t allow to reconnect for' })}
          <Tooltip.Question
            title={$t({ defaultMessage: 'During this period, the user will'+
            ' not be allowed to sign in again (Lock-out period)' })}
            placement='bottom' />
        </>}>
          <Space align='start'>
            <Form.Item
              noStyle
              name={['guestPortal','lockoutPeriod']}
              initialValue={2}
              validateTrigger='onChange'
              label={$t({ defaultMessage: 'Lock-out period' })}
              rules={[
                { required: true },
                { validator: (_, value) => {
                  if(value >lockoutMapping[lockoutPeriodUnit]){
                    return Promise.reject($t({ defaultMessage:
                      'Value must between 1-65535 minutes or 1-1092 hours or 1-45 days' }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              <InputNumber data-testid='lockoutPeriod'
                min={1}
                max={lockoutMapping[lockoutPeriodUnit]}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item noStyle name='lockoutPeriodUnit' initialValue={'hours'}>
              <Select data-testid='lockoutPeriodUnit'>
                <Option value={'days'}>{$t({ defaultMessage: 'Days' })}</Option>
                <Option value={'hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
      </>}
      <Fieldset label={$t({ defaultMessage:
        'Do not redirect to the portal when reconnecting within' })}
      checked={true}
      switchStyle={{ display: 'none' }}
      >
        {useDefaultSetting&&guestType !== GuestNetworkTypeEnum.WISPr &&<Form.Item>
          <Space align='start'>
            <Form.Item style={{ height: 32, marginBottom: 0 }}
              name={['wlan','bypassCPUsingMacAddressAuthentication']}
              valuePropName='checked'
              initialValue={true}
              children={<Checkbox disabled={editMode}/>}
            />
            <Form.Item
              noStyle
              name={['guestPortal','macCredentialsDuration']}
              initialValue={4}
              validateTrigger='onChange'
              label={$t({ defaultMessage: 'Mac Credentials Duration' })}
              rules={[
                { required: true },
                { validator: (_, value) => {
                  if(value >durationMapping[macCredentialsDurationUnit]){
                    return Promise.reject($t({ defaultMessage:
                      'Value must between 1-1440 minutes or 1-24 hours' }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              <InputNumber data-testid='macCredentialsDuration'
                min={1}
                max={durationMapping[macCredentialsDurationUnit]}
                disabled={!checkDuration}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item noStyle name='macCredentialsDurationUnit' initialValue={'hours'}>
              <Select data-testid='macCredentialsDurationUnit' disabled={!checkDuration}>
                <Option value={'hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              style={{ height: 32, marginBottom: 0, paddingTop: 6 }}
              label={<>
                {$t({ defaultMessage: 'since last redirection, or' })}
                <Tooltip.Question
                  title={$t({ defaultMessage:
                    'Once connected, clients\' MAC address will be cached for this period '+
                    'so they do not need to re-authenticate with the portal' })}
                  placement='bottom' />
              </>}></Form.Item>
          </Space>
        </Form.Item>}
        <Form.Item>
          <Space align='start'>
            <Form.Item
              noStyle
              initialValue={60}
              label={$t({ defaultMessage: 'User Session Grace Period' })}
              name={['guestPortal','userSessionGracePeriod']}
              validateTrigger='onChange'
              rules={[
                { required: true },
                { validator: (_, value) => {
                  if(value >= 14400 || value >maxGracePeriod){
                    return Promise.reject($t({ defaultMessage:
                      'Value cannot be more than the time the user is allowed to '+
                      'stay connected and cannot be more than 14399 minutes' }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              <InputNumber data-testid='userSessionGracePeriod'
                min={1}
                max={maxGracePeriod}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item
              style={{ height: 32, marginBottom: 0, paddingTop: 6 }}
              label={<>
                {$t({ defaultMessage: 'Minutes since disconnection (Grace period)' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: 'This is the period during which clients,'+
                    ' having been disconnected from the network, will be allowed to'+
                    ' reconnect without needing to re-authenticate with the portal' })}
                  placement='bottom' />
              </>}/>
          </Space>
        </Form.Item>
      </Fieldset>
    </>
  )
}
