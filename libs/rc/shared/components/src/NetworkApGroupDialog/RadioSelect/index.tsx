import { memo } from 'react'

import { Input, SelectProps } from 'antd'
import _                      from 'lodash'
import { useIntl }            from 'react-intl'

import { Select }        from '@acx-ui/components'
import { RadioTypeEnum } from '@acx-ui/rc/utils'

const radioTypeEnumToString = (radioType: RadioTypeEnum) => {
  return radioType.replace(/-/g, ' ') //FIXME: useIntl
}

type RadioSelectProps = SelectProps & {
  isSupport6G: boolean,
  isSelected?: boolean
}

export const RadioSelect = memo((props: RadioSelectProps) => {
  const { $t } = useIntl()
  const { isSupport6G, isSelected = true, ...otherProps } = props
  // eslint-disable-next-line max-len
  const disabledBandTooltip = $t({ defaultMessage: '6GHz disabled for non-WPA3 networks. To enable 6GHz operation, configure a WLAN for WPA3 operation.' })
  if (!isSupport6G) {
    _.remove(otherProps.value, (v) => v === RadioTypeEnum._6_GHz)
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
