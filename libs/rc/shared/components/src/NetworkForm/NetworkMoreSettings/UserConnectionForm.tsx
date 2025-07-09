import { useContext, useEffect, useState } from 'react'

import {
  Checkbox,
  Form,
  InputNumber,
  Select,
  Space,
  Row,
  Col
} from 'antd'
import _, { isNumber } from 'lodash'
import { useIntl }     from 'react-intl'

import { StepsForm, Button, Fieldset, Tooltip } from '@acx-ui/components'
import { GuestNetworkTypeEnum }                 from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

const { Option } = Select
const { useWatch, useFormInstance } = Form

const oneDay = 1440
const oneHour = 60
const oneWeek = 10080

const enum UnitEnum {
  MINS = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks'
}
const sessionMapping: { [key:string]:number }={
  [UnitEnum.HOURS]: 240,
  [UnitEnum.DAYS]: 10,
  [UnitEnum.MINS]: 14400
}
const durationMapping: { [key:string]:number }={
  [UnitEnum.MINS]: 1440,
  [UnitEnum.HOURS]: 24,
  [UnitEnum.DAYS]: 30,
  [UnitEnum.WEEKS]: 7
}
const lockoutMapping: { [key:string]:number }={
  [UnitEnum.MINS]: 65535,
  [UnitEnum.HOURS]: 1092,
  [UnitEnum.DAYS]: 45
}

const calGracePeriod = (sessionTimeoutUnit: string, value: number) => {
  if(sessionTimeoutUnit === UnitEnum.DAYS){
    return value * 1440
  }else if(sessionTimeoutUnit === UnitEnum.HOURS){
    return value * 60
  }
  return value
}

const calCurrentDataAndUnit = (timeData: number, units: UnitEnum[]) => {
  if(units.includes(UnitEnum.DAYS) &&
    timeData && timeData >= oneDay && timeData % oneDay === 0){
    return [timeData/oneDay, UnitEnum.DAYS]
  } else if (
    units.includes(UnitEnum.HOURS) &&
    timeData && timeData >= oneHour && timeData % oneHour === 0){
    return [timeData/oneHour, UnitEnum.HOURS]
  }
  return [timeData, UnitEnum.MINS]
}

export function UserConnectionForm () {
  const { $t } = useIntl()
  const form = useFormInstance()
  const { data, editMode, cloneMode } = useContext(NetworkFormContext)
  const [useDefaultSetting, setUseDefaultSetting]=useState<boolean>(true)
  const [maxGracePeriod, setMaxGracePeriod]=useState<number>(1440)
  const [checkDuration,
    userSessionTimeoutUnit,
    lockoutPeriodUnit,
    macCredentialsDurationUnit,
    userSessionTimeout
  ]=[useWatch(['wlan','bypassCPUsingMacAddressAuthentication']),
    useWatch(['userConnection','userSessionTimeoutUnit']),
    useWatch(['userConnection','lockoutPeriodUnit']),
    useWatch(['userConnection','macCredentialsDurationUnit']),
    useWatch(['userConnection','userSessionTimeout'])
  ]
  const guestType = data?.guestPortal?.guestNetworkType
  const isClickThrough = guestType === GuestNetworkTypeEnum.ClickThrough
  const isWispr = guestType === GuestNetworkTypeEnum.WISPr
  const createMode = !editMode && !cloneMode

  useEffect(() => {
    if (!isNumber(userSessionTimeout)) return
    const gracePeriod = calGracePeriod(userSessionTimeoutUnit, userSessionTimeout)
    if (gracePeriod !== maxGracePeriod) {
      setMaxGracePeriod(gracePeriod)
    }
  }, [userSessionTimeoutUnit, userSessionTimeout, maxGracePeriod])

  useEffect(() => {
    if ((editMode || cloneMode) && data && data.guestPortal) {
      // eslint-disable-next-line max-len
      const userSessionTimeoutUnitData = form.getFieldValue(['userConnection','userSessionTimeoutUnit'])
      const userSessionTimeoutData = _.get(data, 'guestPortal.userSessionTimeout')
      const lockoutPeriodUnitData = form.getFieldValue(['userConnection','lockoutPeriodUnit'])
      const lockoutPeriodEnabledData = _.get(data, 'guestPortal.lockoutPeriodEnabled')
      const lockoutPeriodData = _.get(data, 'guestPortal.lockoutPeriod')
      // eslint-disable-next-line max-len
      const macCredentialsDurationUnitData = form.getFieldValue(['userConnection','macCredentialsDurationUnit'])
      const macCredentialsDurationData = _.get(data, 'guestPortal.macCredentialsDuration')
      const userSessionGracePeriodData = _.get(data, 'guestPortal.userSessionGracePeriod')
      /* eslint-disable max-len */
      const currentGracePeriod = calGracePeriod(userSessionTimeoutUnitData, userSessionTimeoutData) || maxGracePeriod
      if (currentGracePeriod !== maxGracePeriod) {
        setMaxGracePeriod(currentGracePeriod)
      }
      form.setFieldValue(['guestPortal','userSessionGracePeriod'], userSessionGracePeriodData)

      if(lockoutPeriodEnabledData){
        setUseDefaultSetting(false)

        if (!userSessionTimeoutUnitData) {
          const [timeData, unit] = calCurrentDataAndUnit(userSessionTimeoutData, [UnitEnum.HOURS, UnitEnum.MINS])
          form.setFieldValue(['userConnection','userSessionTimeout'], timeData)
          form.setFieldValue(['userConnection','userSessionTimeoutUnit'], unit)
        }

        if (!lockoutPeriodUnitData) {
          const [timeData, unit] = calCurrentDataAndUnit(lockoutPeriodData, [UnitEnum.DAYS, UnitEnum.HOURS, UnitEnum.HOURS])
          form.setFieldValue(['userConnection','lockoutPeriod'], timeData)
          form.setFieldValue(['userConnection','lockoutPeriodUnit'], unit)
        }

        // default
        if (!macCredentialsDurationUnitData){
          form.setFieldValue(['userConnection','macCredentialsDurationUnit'], UnitEnum.HOURS)
        }

      } else {
        if (!userSessionTimeoutUnitData) {
          const [timeData, unit] = calCurrentDataAndUnit(userSessionTimeoutData, [UnitEnum.DAYS, UnitEnum.HOURS, UnitEnum.MINS])
          form.setFieldValue(['userConnection','userSessionTimeout'], timeData)
          form.setFieldValue(['userConnection', 'userSessionTimeoutUnit'], unit)
        }

        // Parsing the minutes to different time unit, backend will only return/receive duration as minutes without unit
        // Both duration and unit will be parse again in Network form before sending it to backend.
        if (macCredentialsDurationData && !macCredentialsDurationUnitData) {
          let duration = macCredentialsDurationData
          let durationUnit = UnitEnum.MINS
          if (macCredentialsDurationData >= oneWeek && macCredentialsDurationData % oneWeek === 0) {
            duration = macCredentialsDurationData / oneWeek
            durationUnit = UnitEnum.WEEKS
          } else if (macCredentialsDurationData >= oneDay && macCredentialsDurationData % oneDay === 0) {
            duration = macCredentialsDurationData / oneDay
            durationUnit = UnitEnum.DAYS
          } else if (macCredentialsDurationData >= oneHour && macCredentialsDurationData % oneHour === 0) {
            duration = macCredentialsDurationData / oneHour
            durationUnit = UnitEnum.HOURS
          }
          form.setFieldValue(['userConnection','macCredentialsDuration'], duration)
          form.setFieldValue(['userConnection','macCredentialsDurationUnit'], durationUnit)
        }
        // default
        if (!lockoutPeriodUnitData){
          form.setFieldValue(['userConnection','lockoutPeriodUnit'], UnitEnum.HOURS)
        }
      }
    }
  }, [data, editMode, cloneMode, form])

  /* eslint-enable max-len */
  const changeSettings=()=>{
    if(useDefaultSetting){
      if(userSessionTimeoutUnit === UnitEnum.DAYS){
        const sessionTimeout = form.getFieldValue(['userConnection','userSessionTimeout'])
        form.setFieldValue(['userConnection', 'userSessionTimeoutUnit'], UnitEnum.HOURS)
        form.setFieldValue(['userConnection','userSessionTimeout'], sessionTimeout*24)
      }
    }
    form.setFieldValue(['guestPortal','lockoutPeriodEnabled'],useDefaultSetting)
    setUseDefaultSetting(!useDefaultSetting)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateUserSessionTimeout = (value:any) => {
    const unit = userSessionTimeoutUnit === UnitEnum.MINS ? 2 :1
    if(!isNumber(value) || value < unit || value > sessionMapping[userSessionTimeoutUnit]){
      return Promise.reject($t({ defaultMessage:
        'Value must between 2-14400 minutes or 1-240 hours or 1-10 days' }))
    }
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateMacCredentialsDuration = (value:any) => {
    if(!isNumber(value) || value > durationMapping[macCredentialsDurationUnit]){
      /* eslint-disable-next-line */
      return Promise.reject($t({ defaultMessage: 'Value must between 1-1440 minutes or 1-24 hours or 1-30 days or 1-7 weeks' }))
    }
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateUserSessionGracePeriod = (value:any) => {
    if(!isNumber(value) || value >= 14400 || value > maxGracePeriod){
      return Promise.reject($t({ defaultMessage:
        'Value cannot be more than the time the user is allowed to '+
        'stay connected and cannot be more than 14399 minutes' }))
    }
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateLockoutPeriod = (value:any) => {
    if(!isNumber(value) || value >lockoutMapping[lockoutPeriodUnit]){
      return Promise.reject($t({ defaultMessage:
        'Value must between 1-65535 minutes or 1-1092 hours or 1-45 days' }))
    }
    return Promise.resolve()
  }

  return(
    <>
      <Row justify='space-between'>
        <Col>
          <StepsForm.Subtitle style={{ marginTop: 5 }}>
            {!isClickThrough &&
              $t({ defaultMessage: 'User Connection Settings' })}
            {isClickThrough &&
              $t({ defaultMessage: 'User Connection Settings ({desc})' }, {
                desc: useDefaultSetting ?
                  $t({ defaultMessage: 'Default' }) :
                  $t({ defaultMessage: 'Time limited' })
              })}
          </StepsForm.Subtitle>
        </Col>
        {isClickThrough &&
        <Col style={{ height: '20px', paddingTop: '20px', paddingBottom: '10px', marginTop: 5 }}>
          <Button type='link'
            onClick={changeSettings}
            style={{ fontSize: 12 }}>
            {!useDefaultSetting && $t({ defaultMessage: 'Change to default connection' })}
            {useDefaultSetting && $t({ defaultMessage: 'Change to Time limited connection' })}
          </Button>
        </Col>}
      </Row>
      <Form.Item
        label={<>
          { useDefaultSetting ?
            $t({ defaultMessage: 'Allow the user to stay connected for' }) :
            $t({ defaultMessage: 'Allow user to connect for' })}
          <Tooltip.Question
            title={useDefaultSetting ?
              $t({ defaultMessage:
            'Once this connection time limit has been reached, the client will be disconnected' }) :
              $t({ defaultMessage: 'Once this aggregated connection time'+
              ' limit has been reached the client will be disconnected' })}
            placement='bottom' />
        </>}>
        <Space align='start'>
          <Form.Item hidden
            name={['guestPortal','userSessionTimeout']}
            children={<InputNumber />}/>
          <Form.Item
            noStyle
            name={['userConnection','userSessionTimeout']}
            validateTrigger='onChange'
            initialValue={useDefaultSetting? 1 :24}
            label={$t({ defaultMessage: 'User Session Timeout' })}
            rules={[
              { required: true },
              { validator: (_, value) => validateUserSessionTimeout(value) }
            ]}
          >
            <InputNumber data-testid='userSessionTimeout'
              min={userSessionTimeoutUnit===UnitEnum.MINS ? 2 : 1}
              max={sessionMapping[userSessionTimeoutUnit]}
              style={{ width: '100px' }}
              onChange={(value)=>setMaxGracePeriod(calGracePeriod(userSessionTimeoutUnit, value))}
            />
          </Form.Item>
          <Form.Item noStyle
            name={['userConnection','userSessionTimeoutUnit']}
            initialValue={createMode? UnitEnum.DAYS : ''}>
            <Select data-testid='userSessionTimeoutUnit'
              style={{ minWidth: '100px' }}
              onChange={(value)=>setMaxGracePeriod(calGracePeriod(value, userSessionTimeout))}>
              {useDefaultSetting &&
              <Option value={UnitEnum.DAYS}>{$t({ defaultMessage: 'Days' })}</Option>}
              <Option value={UnitEnum.HOURS}>{$t({ defaultMessage: 'Hours' })}</Option>
              <Option value={UnitEnum.MINS}>{$t({ defaultMessage: 'Minutes' })}</Option>
            </Select>
          </Form.Item>
        </Space>
      </Form.Item>
      {!useDefaultSetting && <>
        <Form.Item
          hidden
          name={['guestPortal','lockoutPeriodEnabled']}
          initialValue={false}
          valuePropName='checked'
          children={<Checkbox />}
        />
        <Form.Item label={<>
          {$t({ defaultMessage: 'After that time, don\'t allow to reconnect for' })}
          <Tooltip.Question
            title={$t({ defaultMessage: 'During this period, the user will'+
            ' not be allowed to sign in again (Lock-out period)' })}
            placement='bottom' />
        </>}>
          <Space align='start'>
            <Form.Item hidden
              name={['guestPortal','lockoutPeriod']}
              children={<InputNumber />}/>
            <Form.Item
              noStyle
              name={['userConnection','lockoutPeriod']}
              initialValue={2}
              validateTrigger='onChange'
              label={$t({ defaultMessage: 'Lock-out period' })}
              rules={[
                { required: true },
                { validator: (_, value) => validateLockoutPeriod(value) }
              ]}
            >
              <InputNumber data-testid='lockoutPeriod'
                min={1}
                max={lockoutMapping[lockoutPeriodUnit]}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item noStyle
              name={['userConnection','lockoutPeriodUnit']}
              initialValue={createMode?UnitEnum.HOURS:''}>
              <Select data-testid='lockoutPeriodUnit' style={{ minWidth: '100px' }}>
                <Option value={UnitEnum.DAYS}>{$t({ defaultMessage: 'Days' })}</Option>
                <Option value={UnitEnum.HOURS}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={UnitEnum.MINS}>{$t({ defaultMessage: 'Minutes' })}</Option>
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
        {useDefaultSetting&& !isWispr && <Form.Item>
          <Space align='start'>
            <Form.Item style={{ height: 32, marginBottom: 0 }}
              name={['wlan','bypassCPUsingMacAddressAuthentication']}
              valuePropName='checked'
              initialValue={true}
              children={<Checkbox disabled={editMode}/>}
            />
            <Form.Item hidden
              name={['guestPortal','macCredentialsDuration']}
              children={<InputNumber />}/>
            <Form.Item
              noStyle
              name={['userConnection','macCredentialsDuration']}
              initialValue={4}
              validateTrigger='onChange'
              label={$t({ defaultMessage: 'Mac Credentials Duration' })}
              rules={[
                { required: true },
                { validator: (_, value) => validateMacCredentialsDuration(value) }
              ]}
            >
              <InputNumber data-testid='macCredentialsDuration'
                min={1}
                max={durationMapping[macCredentialsDurationUnit]}
                disabled={!checkDuration}
                style={{ width: '100px' }} />
            </Form.Item>
            <Form.Item noStyle
              name={['userConnection','macCredentialsDurationUnit']}
              initialValue={createMode?UnitEnum.HOURS:''}>
              <Select data-testid='macCredentialsDurationUnit'
                style={{ minWidth: '100px' }}
                disabled={!checkDuration}>
                <Option value={UnitEnum.MINS}>{$t({ defaultMessage: 'Minutes' })}</Option>
                <Option value={UnitEnum.HOURS}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={UnitEnum.DAYS}>{$t({ defaultMessage: 'Days' })}</Option>
                <Option value={UnitEnum.WEEKS}>{$t({ defaultMessage: 'Weeks' })}</Option>
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
              label={$t({ defaultMessage: 'User Session Grace Period' })}
              name={['guestPortal','userSessionGracePeriod']}
              initialValue={60}
              validateTrigger='onChange'
              rules={[
                { required: true },
                { validator: (_, value) => validateUserSessionGracePeriod(value) }
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
