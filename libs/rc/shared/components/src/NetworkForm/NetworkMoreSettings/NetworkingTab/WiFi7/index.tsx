/* eslint-disable max-len */
import { useEffect, useContext, useReducer } from 'react'

import { Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import _, { get, isUndefined } from 'lodash'
import { useIntl }             from 'react-intl'


import { Tooltip }                                                                                               from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                from '@acx-ui/feature-toggle'
import { InformationSolid }                                                                                      from '@acx-ui/icons'
import { NetworkSaveData, WlanSecurityEnum, MultiLinkOperationOptions, IsNetworkSupport6g, IsSecuritySupport6g } from '@acx-ui/rc/utils'

import { MLOContext } from '../../../NetworkForm'
import * as UI        from '../../../NetworkMoreSettings/styledComponents'

const RADIO_COUNT_LIMIT = 2

enum MLOCheckboxAction {
  Init,
  UseDefault,
  Change
}

interface Option {
  index: number
  name: string
  value: boolean
  label: string
  disabled: boolean
}

interface MLOState {
  action: MLOCheckboxAction
  checkboxOptions: Option[],
  flipOptionName?: string
}

interface securityParameters {
  wlanSecurity?: WlanSecurityEnum,
  aaaWlanSecurity? : WlanSecurityEnum,
  dpskWlanSecurity? : WlanSecurityEnum,
  wisprWlanSecurity?: WlanSecurityEnum
}

export const isEnableOptionOf6GHz = (wlanData: NetworkSaveData | null, security?: securityParameters) => {

  // add Network mode
  const { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity } = security || {}

  const result = [
    dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed,
    get(wlanData, ['enableOwe']),
    get(wlanData, ['networkSecurity']) === WlanSecurityEnum.OWE, // For WISPR
    IsSecuritySupport6g(wlanSecurity),
    IsSecuritySupport6g(aaaWlanSecurity),
    IsSecuritySupport6g(wisprWlanSecurity),
    IsNetworkSupport6g(wlanData)
  ].some(Boolean)

  return result
}

const flipCheckboxOptionsValue = (incomingState: MLOState): MLOState => {
  const flipOptions = incomingState.checkboxOptions.map((option) => {
    if(incomingState.flipOptionName && incomingState.flipOptionName === option.name) {
      // Flip the value
      return { ...option, value: !option.value }
    }
    // return origin option if no change
    return option
  })

  const cloneState = _.cloneDeep(incomingState)
  _.set(cloneState, ['checkboxOptions'], flipOptions)

  return cloneState
}

const setOptionsAvailability = (incomingState: MLOState): MLOState => {
  // find all selected checkbox
  const selectedOptionsCount = incomingState.checkboxOptions.filter((opt) => opt.value === true).length
  const cloneState = _.cloneDeep(incomingState)
  // if it didn't reach the limit, all checkbox should be enable
  if (selectedOptionsCount < RADIO_COUNT_LIMIT) {
    cloneState.checkboxOptions = cloneState.checkboxOptions.map((option) => { return { ...option, disabled: false }})
  }
  // if it reach the limit, only "unselected" checkbox will be disabled.
  else {
    cloneState.checkboxOptions = cloneState.checkboxOptions.map((option) => {
      // disable the unselected checkbox
      if (!option.value) {
        return { ...option, disabled: true }
      } else {
        return { ...option, disabled: false }
      }
    })
  }
  return cloneState
}

const setOptionsValueFromSaveData = (wlanData: NetworkSaveData | null, incomingState: MLOState) : MLOState => {

  // Null-Check Guard
  if (wlanData === null) return incomingState

  const savedOption = wlanData?.wlan?.advancedCustomization?.multiLinkOperationOptions

  // Undefined-Check Guard
  if (!savedOption) return incomingState

  // Crosscheck, assign value from saved options
  if (Object.values(savedOption).filter(value => isUndefined(value)).length === 0){
    const cloneState = _.cloneDeep(incomingState)
    _.forIn(savedOption, function (value, key) {
      cloneState.checkboxOptions.forEach((option) => {
        if(option.name === key) {
          _.set(option, 'value', value)
        }
      })
    })

    return cloneState
  }

  return incomingState
}

const transformCheckboxOptionsToFormValue = (incomingState: MLOState) => {
  const optionNames = incomingState.checkboxOptions.map((opt) => opt.name)
  const optionValues = incomingState.checkboxOptions.map((opt) => opt.value)
  return _.zipObject(optionNames, optionValues)
}


const { useWatch } = Form



const CheckboxGroup = ({ wlanData } : { wlanData : NetworkSaveData | null }) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const defaultOptions: Option[] = [
    {
      index: 0,
      name: 'enable24G',
      value: true,
      label: $t({ defaultMessage: '2.4 GHz' }),
      disabled: false
    },
    {
      index: 1,
      name: 'enable50G',
      value: true,
      label: $t({ defaultMessage: '5 GHz' }),
      disabled: false
    },
    {
      index: 2,
      name: 'enable6G',
      value: false,
      label: $t({ defaultMessage: '6 GHz' }),
      disabled: true
    }
  ]

  const initialState: MLOState = {
    action: MLOCheckboxAction.UseDefault,
    checkboxOptions: defaultOptions,
    flipOptionName: ''
  }


  const actionRunner = (currentState: MLOState, incomingState: MLOState) => {
    switch(incomingState.action) {
      case MLOCheckboxAction.Init:
        // setOptions(incomingState.checkboxOptions)
        return setOptionsAvailability(setOptionsValueFromSaveData(wlanData, incomingState))
      case MLOCheckboxAction.UseDefault:
        form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], new MultiLinkOperationOptions())
        return initialState
      case MLOCheckboxAction.Change:
        const flipState = setOptionsAvailability(flipCheckboxOptionsValue(incomingState))
        // setOptions(incomingState.checkboxOptions)
        form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], transformCheckboxOptionsToFormValue(flipState))
        return flipState
      default:
        /* eslint-disable no-console */
        console.log(`Invalid action:${incomingState}`)
        return incomingState
    }

  }

  const wlanSecurity = useWatch(['wlan', 'wlanSecurity']) // for PSK network
  const aaaWlanSecurity = useWatch('wlanSecurity') // for AAA network
  const dpskWlanSecurity = useWatch('dpskWlanSecurity') // for DPSK network
  const wisprWlanSecurity = useWatch('pskProtocol') // for WISPr network
  const [state, dispatch] = useReducer(actionRunner, initialState)
  const isEnabled6GHz = isEnableOptionOf6GHz(wlanData, { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity })

  useEffect(() => {
    if (!isEnabled6GHz) {
      dispatch({ ...state, action: MLOCheckboxAction.UseDefault })
    } else {
      dispatch({ ...state, action: MLOCheckboxAction.Init })
    }
  }, [isEnabled6GHz])

  const handleChange = (event: CheckboxChangeEvent) => {
    dispatch({ ...state, action: MLOCheckboxAction.Change, flipOptionName: event.target.name })
  }

  return (
    <Form.Item
      label={$t({ defaultMessage: 'Select 2 bands for MLO: ' })}
      name={['wlan', 'advancedCustomization', 'multiLinkOperationOptions']}
      valuePropName='checked'
      style={{ marginBottom: '15px', width: '300px' }}
      rules={[
        { validator: () => {
          const selectedRadios = state.checkboxOptions.filter(option => option.value === true).length
          if (selectedRadios < RADIO_COUNT_LIMIT) {
            return Promise.reject($t({ defaultMessage: 'Please select two radios' }))
          }
          return Promise.resolve()}
        }
      ]}
      children={
        <div style={{ display: 'flex' }}>
          { state.checkboxOptions.map((option, key) => {
            if (option.name === 'enable6G' && !isEnabled6GHz) {
              return (
                <Tooltip
                  key={key}
                  title={$t({
                    // eslint-disable-next-line max-len
                    defaultMessage: '6GHz only works when this network is using WPA3 or OWE encryption'
                  })}
                  placement='right'
                  style={{
                    height: 10,
                    display: 'flex'
                  }}
                  children={
                    <div>
                      <UI.StyledCheckbox
                        name={option.name}
                        checked={option.value}
                        disabled={true}
                        onChange={handleChange}
                        children={option.label}
                      />
                    </div>
                  }
                />
              )
            }
            else {
              return (
                <div key={key}>
                  <UI.StyledCheckbox
                    name={option.name}
                    checked={option.value}
                    disabled={option.disabled}
                    onChange={handleChange}
                    children={option.label}
                  />
                </div>
              )
            }
          }) }
        </div>
      }
    />
  )
}

function WiFi7 ({ wlanData } : { wlanData : NetworkSaveData | null }) {
  const { $t } = useIntl()
  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)
  const form = Form.useFormInstance()
  const { isDisableMLO } = useContext(MLOContext)
  const initWifi7Enabled = get(wlanData, ['wlan', 'advancedCustomization', 'wifi7Enabled'], true)
  const [
    wifi7Enabled,
    mloEnabled
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'wifi7Enabled']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])
  ]

  useEffect(() => {
    if (!isUndefined(wifi7Enabled)) {
      form.setFieldValue(['wlan', 'advancedCustomization', 'wifi6Enabled'], wifi7Enabled)
    }
    // disable the mlo when wifi7 is disabled
    if (!wifi7Enabled) {
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [wifi7Enabled])

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Wi-Fi 7' })}
        <Tooltip.Question
          title={$t({ defaultMessage: 'Only work with Wi-Fi 7 Aps, e.g., R770' })}
          placement='right'
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
        />
      </UI.Subtitle>
      <div>
        <UI.FieldLabel width='250px'>
          <Space>
            {$t({ defaultMessage: 'Enable WiFi 6/ 7' })}
            <Tooltip.Question
              title={$t({ defaultMessage: `Use this feature to allow some legacy Wi-Fi 5 clients
                    with out-of-date drivers to inter-operate with a Wi-Fi 6/7 AP.` })}
              placement='right'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            name={['wlan', 'advancedCustomization', 'wifi7Enabled']}
            style={{ marginBottom: '10px', width: '300px' }}
            valuePropName='checked'
            initialValue={initWifi7Enabled}
            children={<Switch />}
          />
        </UI.FieldLabel>
        <Form.Item
          name={['wlan', 'advancedCustomization', 'wifi6Enabled']}
          initialValue={initWifi7Enabled}
          hidden
        />
        {!wifi7Enabled && (
          <div
            data-testid='Description'
            style={{ marginBottom: '10px', width: '220px', fontSize: '11px' }}
          >
            <Space align={'start'}>
              <InformationSolid />
              {/* eslint-disable-next-line max-len */}
              {$t({ defaultMessage: `Clients connecting to this WLAN will not be able to use Wi-Fi 6/7 features,
                    such as 6GHz operation, 320MHz bandwidth and MLO.` })}
            </Space>
          </div>
        )}
      </div>
      { wifi7MloFlag && enableAP70 &&
              <UI.FieldLabel width='250px'>
                <Space>
                  {$t({ defaultMessage: 'Enable Multi-Link operation (MLO)' })}
                  <Tooltip.Question
                    title={$t({ defaultMessage: `This feature allows a Wi-Fi 7 device to
            utilize multiple radio channels concurrently,
            for better throughput and increased network efficiency.
            Most relevant in high-density environments.
            The radios for MLO need to be active on APs` })}
                    placement='right'
                    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                  />
                </Space>
                <Form.Item
                  name={['wlan', 'advancedCustomization', 'multiLinkOperationEnabled']}
                  valuePropName='checked'
                  style={{ marginBottom: '15px', width: '300px' }}
                  initialValue={false}
                  children={<Switch disabled={!wifi7Enabled || isDisableMLO} />}
                />
              </UI.FieldLabel>
      }
      { mloEnabled && <CheckboxGroup wlanData={wlanData} /> }
    </>
  )
}


export default WiFi7
