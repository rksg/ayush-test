import { useState } from 'react'

import {
  Select,
  InputNumber,
  Radio,
  Space,
  DatePicker,
  DatePickerProps,
  RadioChangeEvent
} from 'antd'
import { useIntl } from 'react-intl'

import {
  ExpirationDateEntity,
  ExpirationMode,
  ExpirationType,
  ExpirationModeLabel
} from './models'
import * as UI from './styledComponents'

export * from './models'

export interface ExpirationDateSelectorProps {
  data: ExpirationDateEntity,
  setData: (data: ExpirationDateEntity) => void
}

function expirationTypeToMode (expirationType: ExpirationType | null) : ExpirationMode {
  if (!expirationType) {
    return ExpirationMode.NEVER
  }

  if (expirationType === ExpirationType.SPECIFIED_DATE) {
    return ExpirationMode.BY_DATE
  }
  return ExpirationMode.AFTER_DATE
}

export function ExpirationDateSelector (prop: ExpirationDateSelectorProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const { data, setData } = prop
  const [ expirationMode, setExpirationMode ] = useState<ExpirationMode>(
    expirationTypeToMode(data.expirationType)
  )

  const onExpirationModeChange = (e: RadioChangeEvent) => {
    const expirationMode: ExpirationMode = e.target.value as ExpirationMode
    setExpirationMode(expirationMode)

    if (expirationMode === ExpirationMode.NEVER) {
      setData({ expirationType: null })
    }
  }

  const onDateChange: DatePickerProps['onChange'] = (date) => {
    const dateStr = date?.format('YYYY-MM-DD')
    setData({
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: dateStr
    })
  }

  const onDateOffsetChange = (value: number) => {
    setData({
      expirationType: data.expirationType,
      expirationOffset: value
    })
  }

  const onDateUnitChange = (value: string) => {
    setData({
      expirationType: value as ExpirationType,
      expirationOffset: data.expirationOffset
    })
  }

  return (
    <Radio.Group onChange={onExpirationModeChange}>
      <Space direction='vertical' size='middle'>
        <Radio key={ExpirationMode.NEVER} value={ExpirationMode.NEVER}>
          { $t(ExpirationModeLabel[ExpirationMode.NEVER]) }
        </Radio>
        <Radio key={ExpirationMode.BY_DATE} value={ExpirationMode.BY_DATE}>
          <UI.FieldLabel columns={'120px 1fr'}>
            { $t(ExpirationModeLabel[ExpirationMode.BY_DATE]) }
            { expirationMode === ExpirationMode.BY_DATE &&
              <DatePicker onChange={onDateChange} />
            }
          </UI.FieldLabel>
        </Radio>
        <Radio key={ExpirationMode.AFTER_DATE} value={ExpirationMode.AFTER_DATE}>
          <UI.FieldLabel columns={'120px auto 120px'}>
            { $t(ExpirationModeLabel[ExpirationMode.AFTER_DATE]) }
            { expirationMode === ExpirationMode.AFTER_DATE &&
              <>
                <InputNumber min={1} max={64} onChange={onDateOffsetChange} />
                <Select style={{ width: 120 }} onChange={onDateUnitChange}>
                  <Option key={ExpirationType.HOURS_AFTER_TIME}>
                    {$t({ defaultMessage: 'Hours' })}
                  </Option>
                  <Option key={ExpirationType.DAYS_AFTER_TIME}>
                    {$t({ defaultMessage: 'Days' })}
                  </Option>
                  <Option key={ExpirationType.WEEKS_AFTER_TIME}>
                    {$t({ defaultMessage: 'Weeks' })}
                  </Option>
                  <Option key={ExpirationType.MONTHS_AFTER_TIME}>
                    {$t({ defaultMessage: 'Months' })}
                  </Option>
                  <Option key={ExpirationType.YEARS_AFTER_TIME}>
                    {$t({ defaultMessage: 'Years' })}
                  </Option>
                </Select>
              </>
            }
          </UI.FieldLabel>
        </Radio>
      </Space>
    </Radio.Group>
  )
}
