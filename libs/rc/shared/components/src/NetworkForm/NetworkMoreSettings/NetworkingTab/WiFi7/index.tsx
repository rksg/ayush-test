/* eslint-disable max-len */
import { useEffect, useState, useContext } from 'react'

import { Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import _, { get, isUndefined } from 'lodash'
import { useIntl }             from 'react-intl'

import { Tooltip }                                                from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { InformationSolid }                                       from '@acx-ui/icons'
import {
  NetworkSaveData,
  WlanSecurityEnum,
  MultiLinkOperationOptions,
  IsNetworkSupport6g,
  IsSecuritySupport6g,
  NetworkTypeEnum,
  GuestNetworkTypeEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { MLOContext }     from '../../../NetworkForm'
import NetworkFormContext from '../../../NetworkFormContext'
import * as UI            from '../../../NetworkMoreSettings/styledComponents'

interface Option {
  index: number
  name: string
  value: boolean
  label: string
  disabled: boolean
}

export const getInitMloOptions =
        (mloOption: MultiLinkOperationOptions | undefined) : MultiLinkOperationOptions => {
          if (mloOption &&
          Object.values(mloOption).filter(value =>
            isUndefined(value)).length === 0) {
            return {
              enable24G: mloOption.enable24G,
              enable50G: mloOption.enable50G,
              enable6G: mloOption.enable6G
            } as MultiLinkOperationOptions
          }

          return getDefaultMloOptions()
        }

export const sortOptions = (options: Option[]) => options.sort((a, b) => a.index - b.index)

export const covertToMultiLinkOperationOptions = (options: Option[]): MultiLinkOperationOptions => {
  return {
    enable24G: options.find(option => option.name === 'enable24G')?.value || false,
    enable50G: options.find(option => option.name === 'enable50G')?.value || false,
    enable6G: options.find(option => option.name === 'enable6G')?.value || false
  }
}

export const isEnableOptionOf6GHz = (wlanData: NetworkSaveData | null,
  security?: {
    wlanSecurity?: WlanSecurityEnum,
    aaaWlanSecurity? : WlanSecurityEnum,
    dpskWlanSecurity? : WlanSecurityEnum,
    wisprWlanSecurity?: WlanSecurityEnum
 }
) => {

  // add Network mode
  const { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity } = security || {}
  if (dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed) return true
  if (IsSecuritySupport6g(wlanSecurity) || IsSecuritySupport6g(aaaWlanSecurity) || IsSecuritySupport6g(wisprWlanSecurity)) return true
  if (getIsOwe(wlanData)) return true

  // edit network mode
  return IsNetworkSupport6g(wlanData)
}

export const inverseTargetValue =
        (target: Option, options: Option[]): Option[] => options.map(option =>
          option.name === target.name ? { ...option, value: !target.value } : option)


export const disabledOption = (option: Option) => ({ ...option, disabled: true, value: false })

export const disabledUnCheckOption = (options: Option[]) => {
  const checkedOptions: Option[] = options.filter(option => option.value)
  const unCheckedOptions: Option[] = options.filter(option => !option.value)
  const newStateOfUnCheckedOptions: Option[] =
          unCheckedOptions.map(option => disabledOption(option))

  return [...checkedOptions, ...newStateOfUnCheckedOptions]
}

export const enableAllRadioCheckboxes = (options: Option[]) => {
  const newOptions = options.map(option =>
    ({ ...option, disabled: false })
  )

  return [...newOptions]
}

export const handleDisabledOfOptions = (options: Option[]) => {
  const MAX_SELECTED_LIMIT = 2
  const numberOfSelected = options.filter(option => option.value).length

  return (numberOfSelected === MAX_SELECTED_LIMIT) ?
    disabledUnCheckOption(options) : enableAllRadioCheckboxes(options)
}

export const getDefaultMloOptions = (): MultiLinkOperationOptions => ({
  enable24G: true,
  enable50G: true,
  enable6G: false
})

export const getInitialOptions = (mloOptions: MultiLinkOperationOptions, labels: {
  labelOf24G: string,
  labelOf50G: string,
  labelOf60G: string,
}): Option[] => {
  const initOptions: Option[] = [
    {
      index: 0,
      name: 'enable24G',
      value: isUndefined(mloOptions.enable24G) ? true: mloOptions.enable24G,
      label: labels.labelOf24G,
      disabled: false
    },
    {
      index: 1,
      name: 'enable50G',
      value: isUndefined(mloOptions.enable50G) ? true: mloOptions.enable50G,
      label: labels.labelOf50G,
      disabled: false
    },
    {
      index: 2,
      name: 'enable6G',
      value: isUndefined(mloOptions.enable6G) ? false: mloOptions.enable6G,
      label: labels.labelOf60G,
      disabled: false
    }
  ]

  return handleDisabledOfOptions(initOptions)
}

export const getIsOwe = (wlanData : NetworkSaveData | null) => {
  return get(wlanData, ['enableOwe']) ||
         get(wlanData, ['networkSecurity']) === WlanSecurityEnum.OWE // WISPr network
}

const { useWatch } = Form

const CheckboxGroup = ({ wlanData } : { wlanData : NetworkSaveData | null }) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const labels = {
    labelOf24G: $t({ defaultMessage: '2.4 GHz' }),
    labelOf50G: $t({ defaultMessage: '5 GHz' }),
    labelOf60G: $t({ defaultMessage: '6 GHz' })
  }
  const dataMloOptions =
          wlanData?.wlan?.advancedCustomization?.multiLinkOperationOptions
  const mloOptions = getInitMloOptions(dataMloOptions)
  const initOptions = getInitialOptions(mloOptions, labels)
  const [options, setOptions] = useState<Option[]>(initOptions)

  const wlanSecurity = useWatch(['wlan', 'wlanSecurity']) // for PSK network
  const aaaWlanSecurity = useWatch('wlanSecurity') // for AAA network
  const dpskWlanSecurity = useWatch('dpskWlanSecurity') // for DPSK network
  const wisprWlanSecurity = useWatch('pskProtocol') // for WISPr network

  const isEnabled6GHz = isEnableOptionOf6GHz(wlanData, { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity })

  useEffect(() => {
    const updateMloOptions = () => {
      const mloOptions = covertToMultiLinkOperationOptions(options)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], mloOptions)
    }

    updateMloOptions()
  }, [options])

  useEffect(() => {
    const resetCheckboxGroup = () => {
      const defaultMloOptions = getDefaultMloOptions()
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'],
        defaultMloOptions)

      const initOptions = getInitialOptions(defaultMloOptions, labels)
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
    const finalOptions = handleDisabledOfOptions(updatedOptions)
    setOptions(finalOptions)
    // after onChange, validate the value
    form.validateFields([['wlan', 'advancedCustomization', 'multiLinkOperationOptions']])
  }

  return (
    <Form.Item
      label={$t({ defaultMessage: 'Select 2 bands for MLO: ' })}
      name={['wlan', 'advancedCustomization', 'multiLinkOperationOptions']}
      valuePropName='checked'
      style={{ marginBottom: '15px', width: '300px' }}
      rules={[
        { validator: () => {
          const MUST_SELECTED = 2
          const numberOfSelected = options.map(option => option.value)
            .filter(value => value === true)
            .length
          if (numberOfSelected < MUST_SELECTED) {
            return Promise.reject($t({ defaultMessage: 'Please select two radios' }))
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
  const { setData, data: wlanData } = useContext(NetworkFormContext)
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)
  const form = Form.useFormInstance()
  const params = useParams()
  const editMode = params.action === 'edit'
  const { isDisableMLO, disableMLO } = useContext(MLOContext)
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

  /* eslint-disable */
  useEffect(()=>{
    if(editMode && wlanData !== null){
      const MLOEffectiveCondition = [
        (wlanData.type === NetworkTypeEnum.PSK && wlanData.wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed),
        (wlanData.type === NetworkTypeEnum.PSK && wlanData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3),
        (wlanData.type === NetworkTypeEnum.AAA && wlanData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3),
        (wlanData.type === NetworkTypeEnum.OPEN && wlanData.wlan?.wlanSecurity === WlanSecurityEnum.OWE),
        (wlanData.type === NetworkTypeEnum.CAPTIVEPORTAL && 
          wlanData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.GuestPass &&
          wlanData.wlan?.wlanSecurity === WlanSecurityEnum.OWE),
        (wlanData.type === NetworkTypeEnum.CAPTIVEPORTAL && 
          wlanData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr &&
          wlanData.wlan?.wlanSecurity === WlanSecurityEnum.OWE),

      ].some(Boolean)

      disableMLO(!MLOEffectiveCondition)

      if (!MLOEffectiveCondition) {
        const cloneData = _.cloneDeep(wlanData)
        _.set(cloneData, 'wlan.advancedCustomization.multiLinkOperationEnabled', false)
        setData && setData(cloneData)
      }
    }
  }, [])
  /* eslint-enable */
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
                  {/* eslint-disable max-len */}
                  <Tooltip.Question
                    title={$t({ defaultMessage: `Allows Wi-Fi 7 devices to utilize multiple radio channels simultaneously.
                      Increases network efficiency and better throughput.
                      Most relevant in high-density environments. To enable, radios for MLO must be active on APs.
                      Stays disabled when Wi-Fi Network is configured for DPSK3` })
                    }
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
