/* eslint-disable max-len */
import { useEffect, useState, useContext } from 'react'

import { Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import {
  cloneDeep,
  get,
  isUndefined,
  set
} from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm, Tooltip }                                     from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { InformationSolid }                                       from '@acx-ui/icons'
import {
  NetworkSaveData,
  IsNetworkSupport6g,
  NetworkTypeEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../../../../ApCompatibility'
import { MLOContext }           from '../../../NetworkForm'
import NetworkFormContext       from '../../../NetworkFormContext'
import * as UI                  from '../../../NetworkMoreSettings/styledComponents'
import { getDefaultMloOptions } from '../../../utils'

import { sortOptions,
  covertToMultiLinkOperationOptions,
  disabledUnCheckOption,
  getInitMloOptions,
  getInitialOptions,
  handleDisabledOfOptions,
  inverseTargetValue,
  isEnableOptionOf6GHz,
  useWatch,
  Option
} from './utils'

const CheckboxGroup = ({ wlanData, mloEnabled, wifi7Enabled } :
  { wlanData : NetworkSaveData | null, mloEnabled: boolean, wifi7Enabled: boolean }) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const wifi7Mlo3LinkFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_3LINK_TOGGLE)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)

  const labels = {
    labelOf24G: $t({ defaultMessage: '2.4 GHz' }),
    labelOf50G: $t({ defaultMessage: '5 GHz' }),
    labelOf60G: $t({ defaultMessage: '6 GHz' })
  }
  const dataMloOptions =
          wlanData?.wlan?.advancedCustomization?.multiLinkOperationOptions
  const mloOptions = getInitMloOptions(dataMloOptions, wifi7Mlo3LinkFlag)
  const initOptions = getInitialOptions(mloOptions, wifi7Mlo3LinkFlag, labels)
  const [options, setOptions] = useState<Option[]>(initOptions)

  const wlanSecurity = useWatch(['wlan', 'wlanSecurity']) // for PSK network
  const aaaWlanSecurity = useWatch('wlanSecurity') // for AAA network
  const dpskWlanSecurity = useWatch('dpskWlanSecurity') // for DPSK network
  const wisprWlanSecurity = useWatch('pskProtocol') // for WISPr network

  const isEnabled6GHz = isEnableOptionOf6GHz(wlanData,
    { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity },
    { isSupport6gOWETransition })

  useEffect(() => {
    const updateMloOptions = () => {
      const mloOptions = covertToMultiLinkOperationOptions(options)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], mloOptions)
    }

    updateMloOptions()
  }, [options])

  useEffect(() => {
    const resetCheckboxGroup = () => {
      const defaultMloOptions = getDefaultMloOptions(wifi7Mlo3LinkFlag)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'],
        defaultMloOptions)

      const initOptions = getInitialOptions(defaultMloOptions, wifi7Mlo3LinkFlag, labels)
      const updatedOptions = disabledUnCheckOption(initOptions)
      setOptions(updatedOptions)
    }

    if (!isEnabled6GHz) {
      resetCheckboxGroup()
    }
  }, [isEnabled6GHz])

  const handleChange = (event: CheckboxChangeEvent) => {
    const targetOption = options.find(option => event.target.name === option.name)
    const updatedOptions = targetOption ?
      inverseTargetValue(targetOption, options) : options
    const finalOptions = wifi7Mlo3LinkFlag ? updatedOptions : handleDisabledOfOptions(updatedOptions)
    setOptions(finalOptions)
    // after onChange, validate the value
    form.validateFields([['wlan', 'advancedCustomization', 'multiLinkOperationOptions']])
  }

  return (
    <Form.Item
      label={wifi7Mlo3LinkFlag
        ? $t({ defaultMessage: 'Select bands for MLO: ' })
        : $t({ defaultMessage: 'Select 2 bands for MLO: ' })}
      name={['wlan', 'advancedCustomization', 'multiLinkOperationOptions']}
      valuePropName='checked'
      hidden={!(wifi7Enabled && mloEnabled)}
      style={{ marginBottom: '15px', width: '300px' }}
      rules={[
        { validator: () => {
          const MUST_SELECTED = 2
          const numberOfSelected = options.map(option => option.value)
            .filter(value => value === true)
            .length
          if (mloEnabled && numberOfSelected < MUST_SELECTED) {
            return Promise.reject($t({ defaultMessage: 'Please select at least two radios' }))
          }

          return Promise.resolve()}
        }
      ]}
      children={
        <div style={{ display: 'flex' }}>
          { sortOptions(options).map((option, key) => {
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

function WiFi7 () {
  const { $t } = useIntl()
  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const { setData, data: wlanData } = useContext(NetworkFormContext)
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)
  const form = Form.useFormInstance()
  const params = useParams()
  const editMode = params.action === 'edit'
  const { isDisableMLO, disableMLO } = useContext(MLOContext)
  const initWifi7Enabled = get(wlanData, ['wlan', 'advancedCustomization', 'wifi7Enabled'], true)
  const mloTooltip = $t({ defaultMessage: `MLO allows Wi-Fi 7 devices to use multiple radio channels simultaneously (at least two) for better throughput and efficiency.
    For MLO to function, radios on APs must be active, and their usage is determined by AP configuration, which limits the number of supported 6 GHz networks` })
  const [mloDrawerVisible, setMloDrawerVisible] = useState(false)
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

  /* eslint-disable */
  useEffect(()=>{
    if(editMode && wlanData !== null){

      const shouldMLOBeDisable = wlanData.type === NetworkTypeEnum.DPSK ||
        wlanData?.wlanSecurity === WlanSecurityEnum.OWETransition ||
          !IsNetworkSupport6g(wlanData)

      disableMLO(shouldMLOBeDisable)

      if (shouldMLOBeDisable) {
        const cloneData = cloneDeep(wlanData)
        set(cloneData, 'wlan.advancedCustomization.multiLinkOperationEnabled', false)
        setData && setData(cloneData)
      }
    }
  }, [])
  /* eslint-enable */
  return (
    <>
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Wi-Fi 7' })}
        <Tooltip.Question
          title={$t({ defaultMessage: 'Only work with Wi-Fi 7 Aps, e.g., R770' })}
          placement='right'
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
        />
      </StepsForm.Subtitle>
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
                  {/* eslint-disable max-len */}
                  {!isR370UnsupportedFeatures && <Tooltip.Question
                    title={mloTooltip}
                    placement='right'
                    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                  />}
                  {isR370UnsupportedFeatures && <ApCompatibilityToolTip
                    title={mloTooltip}
                    showDetailButton
                    placement='right'
                    onClick={() => setMloDrawerVisible(true)}
                  />}
                  {isR370UnsupportedFeatures && <ApCompatibilityDrawer
                    visible={mloDrawerVisible}
                    type={ApCompatibilityType.ALONE}
                    networkId={params.networkId}
                    featureName={InCompatibilityFeatures.MLO_3R}
                    onClose={() => setMloDrawerVisible(false)}
                  />}
                </Space>
                <Form.Item
                  name={['wlan', 'advancedCustomization', 'multiLinkOperationEnabled']}
                  valuePropName='checked'
                  style={{ marginBottom: '15px', width: '300px' }}
                  initialValue={false}
                  children={
                    isDisableMLO?
                      <Tooltip
                        title={$t({
                          defaultMessage: 'For the functioning of MLO, ensure that either the WPA3 or OWE encryption method is activated.'
                        })}>
                        <Switch data-testid='mlo-switch-1' disabled={!wifi7Enabled || isDisableMLO} />
                      </Tooltip>
                      :
                      <Switch data-testid='mlo-switch-2' disabled={!wifi7Enabled || isDisableMLO} />
                  } />
              </UI.FieldLabel>
      }
      <CheckboxGroup wlanData={wlanData} mloEnabled={mloEnabled} wifi7Enabled={wifi7Enabled} />
    </>
  )
}


export default WiFi7
