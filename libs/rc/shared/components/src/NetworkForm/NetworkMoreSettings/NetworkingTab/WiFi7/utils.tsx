import { Form }             from 'antd'
import { get, isUndefined } from 'lodash'

import { IsNetworkSupport6g, IsSecuritySupport6g, MultiLinkOperationOptions, NetworkSaveData, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { getDefaultMloOptions } from '../../../utils'

export interface Option {
    index: number
    name: string
    value: boolean
    label: string
    disabled: boolean
  }

export const getInitMloOptions = (mloOption: MultiLinkOperationOptions | undefined,
  wifi7Mlo3LinkFlag: boolean) : MultiLinkOperationOptions => {
  if (mloOption &&
    Object.values(mloOption).filter(value =>
      isUndefined(value)).length === 0) {
    return {
      enable24G: mloOption.enable24G,
      enable50G: mloOption.enable50G,
      enable6G: mloOption.enable6G
    } as MultiLinkOperationOptions
  }

  return getDefaultMloOptions(wifi7Mlo3LinkFlag)
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
    },
  options?: Record<string, boolean>
) => {

  // add Network mode
  const { wlanSecurity, aaaWlanSecurity, dpskWlanSecurity, wisprWlanSecurity } = security || {}
  if (dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed) return true
  if (IsSecuritySupport6g(wlanSecurity) ||
    IsSecuritySupport6g(aaaWlanSecurity) ||
    IsSecuritySupport6g(wisprWlanSecurity))
    return true
  if (getIsOwe(wlanData)) return true

  // edit network mode
  return IsNetworkSupport6g(wlanData, options)
}

export const inverseTargetValue =
    (target: Option, options: Option[]): Option[] => options.map(option =>
      option.name === target.name ? { ...option, value: !target.value } : option)

export const disabledOption = (option: Option) => {
  return { ...option, disabled: true, value: false }
}
// export const disabledOption = (option: Option) => ({ ...option, disabled: true, value: false })


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

export const getInitialOptions =
  (mloOptions: MultiLinkOperationOptions, wifi7Mlo3LinkFlag: boolean, labels: {
    labelOf24G: string,
    labelOf50G: string,
    labelOf60G: string,
  }): Option[] => {

    const initEnabled6GHz = wifi7Mlo3LinkFlag ? true : false
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
        value: isUndefined(mloOptions.enable6G) ? initEnabled6GHz: mloOptions.enable6G,
        label: labels.labelOf60G,
        disabled: false
      }
    ]

    return wifi7Mlo3LinkFlag ? initOptions : handleDisabledOfOptions(initOptions)
  }

export const getIsOwe = (wlanData : NetworkSaveData | null) => {
  return get(wlanData, ['enableOwe']) ||
            get(wlanData, ['networkSecurity']) === WlanSecurityEnum.OWE // WISPr network
}


export const { useWatch } = Form