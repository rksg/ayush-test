import React, { useState } from 'react'

import { Form }                from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { NetworkSaveData } from '@acx-ui/rc/utils'

import { useGetNetwork } from '../../../../../../../wireless/NetworkDetails/services'

import CustomCheckbox from './CustomCheckbox'


export const LABEL_OF_6GHZ = '6 GHz'

export const isSelectTwoRadioBands = (options: Option[]) =>
  options.filter((option) => option.checked).length >= 2

export const isDisabledOptionOf6GHz = (network: NetworkSaveData | null | undefined) => {
  const isWPA3Security = (network?.wlan && network?.wlan.wlanSecurity === 'WPA3') || false
  const isOWESecurity = (network?.wlan && network?.wlan.wlanSecurity === 'OWE') || false

  return !isWPA3Security && !isOWESecurity
}

export interface Option {
    index: number;
    label: string;
    value: string;
    name: string;
    checked: boolean;
    disabled?: boolean;
}

const RadioBandsOfMlo = () => {
  const { $t } = useIntl()
  const network: NetworkSaveData | null | undefined = useGetNetwork().data

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

  const onOptionChange = (event: CheckboxChangeEvent) => {
    const target = event.target
    const optionsOfUnChanged: Option[] = options.filter(option => option.name !== target.name)
    const optionOfChanged: Option | undefined = options.find(option => option.name === target.name)
    if (optionOfChanged) {
      const optionOfNewState: Option = { ...optionOfChanged, checked: target.checked }
      const newOptions: Option[] = [...optionsOfUnChanged, optionOfNewState]
      handleDisabledOfOptions(newOptions)
    }
  }

  const handleDisabledOfOptions = (newOptions: Option[]) => {
    const MUST_SELECTED_LIMIT = 2
    const unCheckedOptions = newOptions.filter(option => !option.checked)
    const isMaxSelectLimited = unCheckedOptions.length < MUST_SELECTED_LIMIT
    const newStateOfOptions = isMaxSelectLimited ?
      getOptionsOfDisableUnCheck(newOptions) : getOptionsOfEnableAll(newOptions)
    const newStateOfOptionsAfterSortByIndex = newStateOfOptions.sort((a, b) => a.index - b.index)

    setOptions(newStateOfOptionsAfterSortByIndex)
  }

  const getOptionsOfDisableUnCheck = (options: Option[]) => {
    const checkedOptions: Option[] = options.filter(option => option.checked)
    const unCheckedOptions: Option[] = options.filter(option => !option.checked)
    const newStateOfUnCheckedOptions: Option[] = unCheckedOptions.map(option => {
      return { ...option, disabled: true }}
    )

    return [...checkedOptions, ...newStateOfUnCheckedOptions]
  }

  const getOptionsOfEnableAll = (options: Option[]) => {
    const newOptions = options.map(option => {
      const is6GHzAndShouldBeDisabled =
                    option.label === LABEL_OF_6GHZ && isDisabledOptionOf6GHz(network)

      return { ...option, disabled: is6GHzAndShouldBeDisabled }
    })

    return [...newOptions]
  }


  return (
    <Form.Item
      {...!isSelectTwoRadioBands(options) ? {
        validateStatus: 'error',
        help: 'At least 2 bands are selected'
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
      children={<CustomCheckbox
        options={options}
        onOptionChange={onOptionChange}
        isDisabledOptionOf6GHz={isDisabledOptionOf6GHz(network)}
      />}
    />
  )
}


export default RadioBandsOfMlo