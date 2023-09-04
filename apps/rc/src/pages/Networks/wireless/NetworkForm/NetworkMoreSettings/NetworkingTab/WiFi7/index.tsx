import { useEffect, useState } from 'react'

import { Checkbox, Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent }           from 'antd/lib/checkbox/Checkbox'
import { get, isUndefined }              from 'lodash'
import { useIntl }                       from 'react-intl'

import { Tooltip }                                                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { InformationSolid }                                                             from '@acx-ui/icons'
import { NetworkSaveData, WlanSecurityEnum, MultiLinkOperationOptions, IsWPA3Security } from '@acx-ui/rc/utils'


import * as UI from '../../../NetworkMoreSettings/styledComponents'

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

export const isEnableOptionOf6GHz = (wlanSecurity: string | undefined) => {
  if (!wlanSecurity)
    return false

  return IsWPA3Security(wlanSecurity as WlanSecurityEnum)
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
            return Promise.reject($t({ defaultMessage: 'Please select two radios' }))
          }

          return Promise.resolve()}
        }
      ]}
      validateFirst
      children={
        <>
          { sortOptions(options).map((option, key) => {
            if (option.name === 'enable6G' && !isEnabled6GHz) {
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

  return isUndefined(dataMloEnabled) ? false : initWifi7Enabled && dataMloEnabled
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
                  children={<Switch disabled={!wifi7Enabled} />}
                />
              </UI.FieldLabel>
      }
      { mloEnabled && <CheckboxGroup wlanData={wlanData} /> }
    </>
  )
}


export default WiFi7
