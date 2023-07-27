import React, { useState } from 'react'

import { Checkbox, Form, Space, Switch } from 'antd'
import { CheckboxChangeEvent }           from 'antd/lib/checkbox'
import { CheckboxChangeEventTarget }     from 'antd/lib/checkbox/Checkbox'
import { useWatch }                      from 'antd/lib/form/Form'
import { useIntl }                       from 'react-intl'

import { Tooltip }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { NetworkSaveData }        from '@acx-ui/rc/utils'

import { useGetNetwork } from '../../../../NetworkDetails/services'
import * as UI           from '../../../NetworkMoreSettings/styledComponents'

export interface Option {
  index: number;
  label: string;
  value: string;
  name: string;
  checked: boolean;
  disabled?: boolean;
}

export const LABEL_OF_6GHZ = '6 GHz'

export const is6GHz = (searchOption: Option) => searchOption.label === LABEL_OF_6GHZ

export const isSelectTwoRadioBands = (options: Option[]) =>
  options.filter((option) => option.checked).length >= 2

export const isDisabledOptionOf6GHz = (network: NetworkSaveData | null | undefined) => {
  const isWPA3Security = (network?.wlan && network?.wlan.wlanSecurity === 'WPA3') || false
  const isOWESecurity = (network?.wlan && network?.wlan.wlanSecurity === 'OWE') || false

  return !isWPA3Security && !isOWESecurity
}

export const getNewStateOfOptionsOnChange = (
  target: CheckboxChangeEventTarget,
  options: Option[],
  isDisabledOptionOf6GHz: boolean
) => {
  const optionsOfUnChanged: Option[] = options.filter(option => option.name !== target.name)
  const optionOfChanged: Option | undefined =
          options.find(option => option.name === target.name)
  if (optionOfChanged) {
    const optionOfNewState: Option = { ...optionOfChanged, checked: target.checked }
    const newOptions: Option[] = [...optionsOfUnChanged, optionOfNewState]

    return handleDisabledOfOptions(newOptions, isDisabledOptionOf6GHz)
  }

  return options
}

const handleDisabledOfOptions = (newOptions: Option[], isDisabledOptionOf6GHz: boolean) => {
  const MUST_SELECTED_LIMIT = 2
  const unCheckedOptions = newOptions.filter(option => !option.checked)
  const isMaxSelectLimited = unCheckedOptions.length < MUST_SELECTED_LIMIT
  const newStateOfOptions = isMaxSelectLimited ?
    getOptionsOfDisableUnCheck(newOptions) :
    getOptionsOfEnableAll(newOptions, isDisabledOptionOf6GHz)

  return newStateOfOptions.sort((a, b) => a.index - b.index)
}

const getOptionsOfDisableUnCheck = (options: Option[]) => {
  const checkedOptions: Option[] = options.filter(option => option.checked)
  const unCheckedOptions: Option[] = options.filter(option => !option.checked)
  const newStateOfUnCheckedOptions: Option[] = unCheckedOptions.map(option => {
    return { ...option, disabled: true }}
  )

  return [...checkedOptions, ...newStateOfUnCheckedOptions]
}

const getOptionsOfEnableAll = (options: Option[], isDisabledOptionOf6GHz: boolean) => {
  const newOptions = options.map(option => {
    const is6GHzAndShouldBeDisabled =
            option.label === LABEL_OF_6GHZ && isDisabledOptionOf6GHz

    return { ...option, disabled: is6GHzAndShouldBeDisabled }
  })

  return [...newOptions]
}


const WiFi7 = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const network: NetworkSaveData | null | undefined = useGetNetwork().data

  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)

  const [enableWiFi, enableMlo] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableWifi7']) || true,
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled']) || false
  ]

  const [options, setOptions] =
          useState<Option[]>([{
            index: 0,
            label: '2.4 GHz',
            value: '2.4',
            name: 'enable24G',
            checked: true,
            disabled: false
          },
          {
            index: 1,
            label: '5 GHz',
            value: '5',
            name: 'enable50G',
            checked: true,
            disabled: false
          },
          {
            index: 2,
            label: LABEL_OF_6GHZ,
            value: '6',
            name: 'enable6G',
            checked: false,
            disabled: true
          }])

  const onEnableWiFiChange = (enableWiFi: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi6'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi7'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'],
      enableWiFi ? enableMlo : false)
  }

  const onEnableMloChange = (enableMlo: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], enableMlo)
  }

  const onOptionChange = (event: CheckboxChangeEvent) => {
    if (event.target) {
      const newOptions =
              getNewStateOfOptionsOnChange(event.target, options, isDisabledOptionOf6GHz(network))
      setOptions(newOptions)
    }
  }


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
            name={['wlan', 'advancedCustomization', 'enableWifi7']}
            style={{ marginBottom: '10px', width: '300px' }}
            valuePropName='checked'
            children={
              <Switch
                onChange={onEnableWiFiChange}
                defaultChecked={enableWiFi}
              />
            }
          />
        </UI.FieldLabel>
        {!enableWiFi && (
          <div
            data-testid='Description'
            style={{ marginBottom: '10px', width: '300px', display: 'flex' }}
          >
            <UI.ExclamationCircleFilledIcon />
            <UI.Description>
              {/* eslint-disable-next-line max-len */}
              {`Clients connecting to this WLAN will not be able to use Wi-Fi 6/7 features,
                    such as 6GHz operation, 320MHz bandwidth and MLO.`}
            </UI.Description>
          </div>
        )}
      </div>
      { wifi7MloFlag &&
              <div>
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
                    children={
                      <Switch
                        defaultChecked={enableMlo}
                        disabled={!enableWiFi}
                        onChange={onEnableMloChange}
                      />
                    }
                  />
                </UI.FieldLabel>
                { enableMlo &&
                        <Form.Item
                          {...!isSelectTwoRadioBands(options) ? {
                            validateStatus: 'error',
                            help: $t({ defaultMessage: 'At least 2 bands are selected' })
                          } : undefined}
                          label={$t({ defaultMessage: 'Select 2 bands for MLO: ' })}
                          name={[
                            'wlan',
                            'advancedCustomization',
                            'multiLinkOperationOptions'
                          ]}
                          initialValue={[options[0], options[1]]}
                          valuePropName='checked'
                          style={{ marginBottom: '15px', width: '300px' }}
                          children={options.map((option) => {
                            if (is6GHz(option) && isDisabledOptionOf6GHz(network)) {
                              return (
                                <UI.CheckboxTooltip
                                  title={$t({ defaultMessage:
                                  // eslint-disable-next-line max-len
                                              '6GHz only works when this network is using WPA3 or OWE encryption' })
                                  }
                                  placement='topRight'
                                  style={{
                                    height: 10,
                                    marginLeft: -5,
                                    marginBottom: -3,
                                    display: 'flex'
                                  }}
                                >
                                  <Checkbox
                                    key={option.index}
                                    name={option.name}
                                    defaultChecked={option.checked}
                                    checked={option.checked}
                                    disabled={option.disabled}
                                    onChange={onOptionChange}
                                  >
                                    {option.label}
                                  </Checkbox>
                                </UI.CheckboxTooltip>
                              )
                            }
                            else {
                              return (
                                <Checkbox
                                  key={option.index}
                                  name={option.name}
                                  defaultChecked={option.checked}
                                  checked={option.checked}
                                  disabled={option.disabled}
                                  onChange={onOptionChange}
                                >
                                  {option.label}
                                </Checkbox>
                              )
                            }
                          })}
                        />
                }
              </div>
      }
    </>
  )
}


export default WiFi7