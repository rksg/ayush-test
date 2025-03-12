import { memo, useEffect, useState } from 'react'

import { Input, SelectProps } from 'antd'
import { DefaultOptionType }  from 'antd/lib/select'
import { useIntl }            from 'react-intl'

import { Select }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { RadioTypeEnum }          from '@acx-ui/rc/utils'
const radioTypeEnumToString = (radioType: RadioTypeEnum) => {
  return radioType.replace(/-/g, ' ') //FIXME: useIntl
}

type RadioSelectProps = SelectProps & {
  isSupport6G: boolean,
  isSelected?: boolean
}

export const RadioSelect = memo((props: RadioSelectProps) => {
  const { $t } = useIntl()
  const { isSupport6G, isSelected = true, value = [], onChange, ...otherProps } = props
  // eslint-disable-next-line max-len
  const disabledBandTooltip = $t({ defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.' })
  const [selectedValues, setSelectedValues] = useState<string[]>(Array.isArray(value) ? value : [])
  const default6gEnablementToggle = useIsSplitOn(Features.WIFI_AP_DEFAULT_6G_ENABLEMENT_TOGGLE)

  useEffect(() => {
    setSelectedValues(Array.isArray(value) ? value : [])
  }, [value])

  useEffect(() => {
    setSelectedValues((prev) => {
      const updatedValues = new Set(prev)
      const shouldInclude6G = isSupport6G && default6gEnablementToggle

      if (shouldInclude6G && !updatedValues.has(RadioTypeEnum._6_GHz)) {
        updatedValues.add(RadioTypeEnum._6_GHz)
      }

      if (!shouldInclude6G && updatedValues.has(RadioTypeEnum._6_GHz)) {
        updatedValues.delete(RadioTypeEnum._6_GHz)
      }

      const updatedValuesArray = Array.from(updatedValues)
      if (updatedValuesArray.length === prev.length
        && updatedValuesArray.every((v) => prev.includes(v))) {
        return prev
      }

      onChange?.(updatedValuesArray, [])
      return updatedValuesArray
    })
  }, [isSupport6G, default6gEnablementToggle])

  const handleChange = (newValues: string[], option: DefaultOptionType | DefaultOptionType[]) => {
    setSelectedValues(newValues)
    onChange?.(newValues, option)
  }

  if (!isSelected) {
    return <Input type='hidden' />
  }

  return (
    <Select
      {...otherProps}
      mode='multiple'
      showArrow
      style={{ width: '220px' }}
      value={selectedValues}
      onChange={handleChange}
    >
      {/* eslint-disable-next-line max-len */}
      <Select.Option value={RadioTypeEnum._2_4_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._2_4_GHz)}</Select.Option>
      {/* eslint-disable-next-line max-len */}
      <Select.Option value={RadioTypeEnum._5_GHz} title=''>{radioTypeEnumToString(RadioTypeEnum._5_GHz)}</Select.Option>
      <Select.Option
        value={RadioTypeEnum._6_GHz}
        disabled={!isSupport6G}
        title={!isSupport6G ? disabledBandTooltip : ''}
      >
        {radioTypeEnumToString(RadioTypeEnum._6_GHz)}
      </Select.Option>
    </Select>
  )
})
