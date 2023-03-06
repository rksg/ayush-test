import { useState } from 'react'

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
  const [valueDays, setValueDays] = useState<string[]>([...days])
  const [disabledDays, setDisabledDays] = useState(false)
  const [valueTimes, setValueTimes] = useState<string[]>([...times])
  const [disabledTimes, setDisabledTimes] = useState(false)

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
    },
    placeholder: 'Select Item...',
    maxTagCount: 1
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
    },
    placeholder: 'Select Item...',
    maxTagCount: 1
  }

  const triggerSubmit = () => {
    onSubmit({
      valueDays: valueDays,
      valueTimes: valueTimes
    })
    onModalCancel()
  }

  const onModalCancel = () => {
    setValueDays([...days])
    setValueTimes([...times])
    onCancel()
  }

  return (
    <Modal
      title='Change preferred update slot'
      visible={visible}
      width={400}
      okText={$t({ defaultMessage: 'Save' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
    >
      <UI.FieldGroup>
        <label>
          <div>Preferred day(s):</div>
          <div>Select up to 3 days</div>
        </label>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Select {...selectDaysProps} />
        </Space>
      </UI.FieldGroup>
      <UI.FieldGroup>
        <label>
          <div>Preferred Time Slot:</div>
          <div>Select up to 3 slots</div>
        </label>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Select {...selectTimesProps} />
        </Space>
      </UI.FieldGroup>
    </Modal>
  )
}
