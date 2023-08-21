import { useEffect, useState } from 'react'

import { Checkbox, Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent }           from 'antd/lib/checkbox/Checkbox'
import { get }                           from 'lodash'
import { useIntl }                       from 'react-intl'

import { Tooltip }                           from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { InformationSolid }                  from '@acx-ui/icons'
import { NetworkSaveData, WlanSecurityEnum } from '@acx-ui/rc/utils'


import * as UI from '../../../NetworkMoreSettings/styledComponents'


interface MultiLinkOperationOptions {
  enable24G: boolean
  enable50G: boolean
  enable6G: boolean
}

interface Option {
  index: number
  name: string
  value: boolean
  label: string
  disabled: boolean
}

const LABEL_OF_6GHZ = '6 GHz'

export const getInitMloOptions = (mloOption: {
  enable24G?: boolean
  enable50G?: boolean
  enable6G?: boolean
} | undefined) : MultiLinkOperationOptions => {
  if (mloOption &&
          Object.values(mloOption).filter(value =>
            typeof value === 'undefined').length === 0) {
    return {
      enable24G: typeof mloOption.enable24G === 'undefined' ? true : mloOption.enable24G,
      enable50G: typeof mloOption.enable50G === 'undefined' ? true : mloOption.enable50G,
      enable6G: typeof mloOption.enable6G === 'undefined' ? false : mloOption.enable6G
    }
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

export const is6GHz = (option: Option) => option.label === LABEL_OF_6GHZ

export const isEnableOptionOf6GHz = (wlanSecurity: string | undefined) => {
  if (!wlanSecurity)
    return false

  const isWPA3Security = wlanSecurity === WlanSecurityEnum.WPA3
  const isOWESecurity = wlanSecurity === WlanSecurityEnum.OWE

  return isWPA3Security || isOWESecurity
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

export const enableAll = (options: Option[]) => {
  const newOptions = options.map(option =>
    ({ ...option, disabled: false })
  )

  return [...newOptions]
}

export const handleDisabledOfOptions = (options: Option[]) => {
  const MAX_SELECTED_LIMIT = 2
  const numberOfSelected = options.filter(option => option.value).length

  return (numberOfSelected === MAX_SELECTED_LIMIT) ?
    disabledUnCheckOption(options) : enableAll(options)
}

export const getDefaultMloOptions = (): MultiLinkOperationOptions => ({
  enable24G: true,
  enable50G: true,
  enable6G: false
})

export const getInitialOptions = (mloOptions: MultiLinkOperationOptions): Option[] => {
  const initOptions = [
    {
      index: 0,
      name: 'enable24G',
      value: mloOptions.enable24G,
      label: '2.4 GHz',
      disabled: false
    },
    {
      index: 1,
      name: 'enable50G',
      value: mloOptions.enable50G,
      label: '5 GHz',
      disabled: false
    },
    {
      index: 2,
      name: 'enable6G',
      value: mloOptions.enable6G,
      label: LABEL_OF_6GHZ,
      disabled: false
    }
  ]
  const updatedOptions = handleDisabledOfOptions(initOptions)

  return sortOptions(updatedOptions)
}

const { useWatch } = Form

const CheckboxGroup = ({ wlanData } : { wlanData : NetworkSaveData | null }) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const dataMloOptions =
          wlanData?.wlan?.advancedCustomization?.multiLinkOperationOptions
  const mloOptions = getInitMloOptions(dataMloOptions)
  const initOptions = getInitialOptions(mloOptions)
  const [options, setOptions] = useState<Option[]>(initOptions)

  const isEnabled6GHz = isEnableOptionOf6GHz(wlanData?.wlan?.wlanSecurity)

  useEffect(() => {
    const updateMloOptions = () => {
      const mloOptions = covertToMultiLinkOperationOptions(options)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], mloOptions)
    }

    updateMloOptions()
  }, [options])

  useEffect(() => {
    const resetCheckboxGroup = () => {
      const initOptions = [
        {
          index: 0,
          name: 'enable24G',
          value: true,
          label: '2.4 GHz',
          disabled: false
        },
        {
          index: 1,
          name: 'enable50G',
          value: true,
          label: '5 GHz',
          disabled: false
        },
        {
          index: 2,
          name: 'enable6G',
          value: false,
          label: LABEL_OF_6GHZ,
          disabled: false
        }
      ]
      const updatedOptions = disabledUnCheckOption(initOptions)
      const sortedUpdatedOptions = sortOptions(updatedOptions)
      setOptions(sortedUpdatedOptions)
      const mloOptions = covertToMultiLinkOperationOptions(sortedUpdatedOptions)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationOptions'], mloOptions)
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
  }

  return (
    <Form.Item
      label={$t({ defaultMessage: 'Select 2 bands for MLO: ' })}
      name={['wlan', 'advancedCustomization', 'multiLinkOperationOptions']}
      valuePropName='checked'
      style={{ marginBottom: '15px', width: '300px' }}
      rules={[
        { validator: (_, value) => {
          const itemValues = Object.values<boolean>(value)
          const MUST_SELECTED = 2
          const numberOfSelected = itemValues.filter(itemValue => itemValue).length
          if (numberOfSelected < MUST_SELECTED) {
            return Promise.reject($t({ defaultMessage: 'At least 2 bands are selected' }))
          }

          return Promise.resolve()}
        }
      ]}
      validateFirst
      children={
        <>
          { sortOptions(options).map((option, key) => {
            if (is6GHz(option) && !isEnabled6GHz) {
              return (
                <Tooltip
                  key={key}
                  title={$t({
                    // eslint-disable-next-line max-len
                    defaultMessage: '6GHz only works when this network is using WPA3 or OWE encryption'
                  })}
                  placement='rightBottom'
                  style={{
                    height: 10,
                    display: 'flex'
                  }}
                  children={
                    <Checkbox
                      key={key}
                      name={option.name}
                      checked={option.value}
                      disabled={true}
                      onChange={handleChange}
                      children={option.label}
                    />
                  }
                />
              )
            }
            else {
              return (
                <Checkbox
                  key={key}
                  name={option.name}
                  checked={option.value}
                  disabled={option.disabled}
                  onChange={handleChange}
                  children={option.label}
                />
              )
            }
          }) }
        </>
      }
    />
  )
}
export const getInitMloEnabled = (wlanData: NetworkSaveData | null, initWifi7Enabled: boolean) => {
  const dataMloEnabled =
          get(wlanData, ['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])

  return typeof dataMloEnabled === 'undefined' ? false : initWifi7Enabled && dataMloEnabled
}

function WiFi7 ({ wlanData } : { wlanData : NetworkSaveData | null }) {
  const { $t } = useIntl()
  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
  const form = Form.useFormInstance()

  const initWifi7Enabled = get(wlanData, ['wlan', 'advancedCustomization', 'wifi7Enabled'], true)
  const initMloEnabled = getInitMloEnabled(wlanData, initWifi7Enabled)

  const [
    wifi7Enabled,
    mloEnabled
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'wifi7Enabled']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])
  ]

  useEffect(() => {
    const setWifi6 = () =>
      form.setFieldValue(['wlan', 'advancedCustomization', 'wifi6Enabled'], wifi7Enabled)

    const disableMlo = () => {
      if (!wifi7Enabled) {
        form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
      }
    }

    setWifi6()
    // disable the mlo when wifi7 is disabled
    disableMlo()
  }, [wifi7Enabled])


  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Wi-Fi 7' })}
        <Tooltip.Question
          title={$t({ defaultMessage: 'Only work with Wi-Fi Aps, e.g., R770' })}
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
      { wifi7MloFlag &&
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
                  initialValue={initMloEnabled}
                  children={<Switch />}
                />
              </UI.FieldLabel>
      }
      { mloEnabled && <CheckboxGroup wlanData={wlanData} /> }
    </>
  )
}


export default WiFi7