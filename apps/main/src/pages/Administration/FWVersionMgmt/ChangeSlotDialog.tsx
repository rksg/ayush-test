import { useEffect, useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import {
  AVAILABLE_DAYS,
  AVAILABLE_SLOTS
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { SelectProps  } from 'antd'

interface ChangeSlotDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: { valueDays: string[], valueTimes: string[] }) => void,
  days: string[],
  times: string[]
}

const { Option } = Select

export function ChangeSlotDialog (props: ChangeSlotDialogProps) {
  const { $t } = useIntl()
  const { visible, onSubmit, onCancel, days, times } = props
  const [valueDays, setValueDays] = useState<string[]>([])
  const [disabledDays, setDisabledDays] = useState(false)
  const [valueTimes, setValueTimes] = useState<string[]>([])
  const [disabledTimes, setDisabledTimes] = useState(false)
  const [disableSave, setDisableSave] = useState(true)

  useEffect(() => {
    if (days) {
      setValueDays([...days])
    }
    if (times) {
      setValueTimes([...times])
    }
  }, [days, times])

  // eslint-disable-next-line max-len
  const dayOptions = AVAILABLE_DAYS.map(item => <Option key={item.value} value={item.value} disabled={disabledDays && !valueDays.includes(item.value)}>{item.label}</Option>) ?? []

  const selectDaysProps: SelectProps = {
    mode: 'multiple',
    style: { width: '100%' },
    value: valueDays,
    children: dayOptions,
    onChange: (newValue: string[]) => {
      if (newValue.length >=3) {
        setDisabledDays(true)
      } else {
        setDisabledDays(false)
      }
      setValueDays(newValue)
      if (newValue.length === 0 || valueTimes.length ===0) {
        setDisableSave(true)
      } else {
        setDisableSave(false)
      }
    },
    placeholder: 'Select Item...'
    // maxTagCount: 1
  }

  // eslint-disable-next-line max-len
  const timeOptions = AVAILABLE_SLOTS.map(item => <Option key={item.value} value={item.value} disabled={disabledTimes && !valueTimes.includes(item.value)}>{item.label}</Option>) ?? []

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
      if (valueDays.length === 0 || newValue.length ===0) {
        setDisableSave(true)
      } else {
        setDisableSave(false)
      }
    },
    placeholder: 'Select Item...'
    // maxTagCount: 1
  }

  const triggerSubmit = () => {
    onSubmit({
      valueDays: valueDays,
      valueTimes: valueTimes
    })
    onCancel()
  }

  const onModalCancel = () => {
    setValueDays([...days])
    setValueTimes([...times])
    onCancel()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Change preferred update slot' })}
      visible={visible}
      width={440}
      okText={$t({ defaultMessage: 'Save' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <UI.FieldGroup>
        <label>
          <div style={{ fontWeight: 600 }}>{$t({ defaultMessage: 'Preferred day(s):' })}</div>
          <div>{$t({ defaultMessage: 'Select up to 3 days' })}</div>
        </label>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Select {...selectDaysProps} />
        </Space>
      </UI.FieldGroup>
      <UI.FieldGroup>
        <label>
          <div style={{ fontWeight: 600 }}>{$t({ defaultMessage: 'Preferred Time Slot:' })}</div>
          <div>{$t({ defaultMessage: 'Select up to 3 slots' })}</div>
        </label>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Select {...selectTimesProps} />
        </Space>
      </UI.FieldGroup>
    </Modal>
  )
}
