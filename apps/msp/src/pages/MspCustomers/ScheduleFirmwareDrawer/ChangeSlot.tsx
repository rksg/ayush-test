import { useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import {
  AVAILABLE_DAYS,
  AVAILABLE_SLOTS
} from '@acx-ui/rc/utils'

import type { SelectProps  } from 'antd'

export interface ChangeSlotProps {
    visible?: boolean,
    onCancel?: () => void,
    onSubmit?: (data: { valueDays: string[], valueTimes: string[] }) => void,
    days?: string[],
    times?: string[]
}

const ChangeSlot = (props: ChangeSlotProps) => {
  const { $t } = useIntl()
  const { visible, onSubmit, onCancel, days, times } = props
  const { Option } = Select
  const [valueDays, setValueDays] = useState<string[]>([])
  const [disabledDays, setDisabledDays] = useState(false)
  const [valueTimes, setValueTimes] = useState<string[]>([])
  const [disabledTimes, setDisabledTimes] = useState(false)
  //   const [disableSave, setDisableSave] = useState(true)

  useEffect(() => {
    if (days) {
      setValueDays([...days])
    }
    if (times) {
      setValueTimes([...times])
    }
  }, [days, times])

  const dayOptions = AVAILABLE_DAYS.map(item =>
    <Option
      key={item.value}
      value={item.value}
      disabled={disabledDays && !valueDays.includes(item.value)}>
      {item.label}</Option>) ?? []

  const selectDaysProps: SelectProps = {
    mode: 'multiple',
    style: { width: '100%' },
    value: valueDays,
    children: dayOptions,
    onChange: (newValue: string[]) => {
      if (newValue.length >=2) {
        setDisabledDays(true)
      } else {
        setDisabledDays(false)
      }
      setValueDays(newValue)
    //   if (newValue.length === 0 || valueTimes.length ===0) {
    //     setDisableSave(true)
    //   } else {
    //     setDisableSave(false)
    //   }
    },
    placeholder: $t({ defaultMessage: 'Selected 2 days' })
    // maxTagCount: 2
  }

  const timeOptions = AVAILABLE_SLOTS.map(item =>
    <Option
      key={item.value}
      value={item.value}
      disabled={disabledTimes && !valueTimes.includes(item.value)}>
      {item.label}</Option>) ?? []

  const selectTimesProps: SelectProps = {
    mode: 'multiple',
    style: { width: '100%' },
    value: valueTimes,
    children: timeOptions,
    onChange: (newValue: string[]) => {
      if (newValue.length >=3) {
        setDisabledTimes(true)
      } else {
        setDisabledTimes(false)
      }
      setValueTimes(newValue)
    //   if (valueDays.length === 0 || newValue.length ===0) {
    //     setDisableSave(true)
    //   } else {
    //     setDisableSave(false)
    //   }
    },
    placeholder: $t({ defaultMessage: 'Selected 3 time slots' })
    // maxTagCount: 3
  }

  return (
    <Space size={18} direction='vertical'>
      <Form
        // form={form}
        layout='vertical'
        style={{ marginTop: 10 }}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Scheduled Days' })}
          rules={[{ required: true }]}
        >
          <Select placeholder={$t({ defaultMessage: 'Selected 2 Days' })}
            {...selectDaysProps} />
        </Form.Item>

        <Form.Item
          label={$t({ defaultMessage: 'Scheduled Time Slots' })}
          rules={[{ required: true }]}
        >
          <Select {...selectTimesProps} />
        </Form.Item>
      </Form>
    </Space>
  )
}

export default ChangeSlot