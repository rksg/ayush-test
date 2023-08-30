import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, Space, Typography } from 'antd'
import { useForm }                                    from 'antd/lib/form/Form'
import dayjs                                          from 'dayjs'
import { useIntl }                                    from 'react-intl'

import {
  AVAILABLE_SLOTS,
  EdgeFirmwareVersion,
  EdgeUpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

import type { RangePickerProps } from 'antd/es/date-picker'

export interface ChangeScheduleDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: EdgeUpdateScheduleRequest) => void,
  availableVersions?: EdgeFirmwareVersion[]
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const intl = useIntl()
  const { $t } = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, availableVersions } = props
  const [disableSave, setDisableSave] = useState(true)
  const selectedVersion = Form.useWatch('version', form)
  const selectedDate = Form.useWatch('date', form)
  const selectedTime = Form.useWatch('time', form)

  useEffect(() => {
    const shouldDisabled = !selectedVersion || !selectedDate || !selectedTime
    setDisableSave(shouldDisabled)
  }, [selectedVersion, selectedDate, selectedTime])

  const startDate = dayjs(Date.now()).endOf('day')
  const endDate = startDate.add(21, 'day')
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  // Can not select days before today and today
    return current && (current < startDate || current > endDate)
  }

  const handleFinish = (value: EdgeUpdateScheduleRequest) => {
    onSubmit(value)
    onModalCancel()
  }

  const onModalCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <UI.ScheduleModal
      title={$t({ defaultMessage: 'Change Update Schedule' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Save' })}
      onOk={() => form.submit()}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <Form
        form={form}
        name={'changeScheduleModalForm'}
        onFinish={handleFinish}
      >
        <Form.Item>
          <Typography>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Choose which version to update the venue to:' })}
          </Typography>
          <Form.Item
            name='version'
            initialValue={availableVersions?.[0]?.id || ''}
            noStyle
          >
            <Radio.Group
              style={{ margin: 12 }}
            >
              <Space direction={'vertical'}>
                {
                  // first GA just support one firmware version
                  availableVersions && availableVersions[0] &&
                  <Radio
                    value={availableVersions[0].id}
                    key={availableVersions[0].id}>
                    {getVersionLabel(intl, availableVersions[0])}
                  </Radio>
                }
                {/* { availableVersions?.map(v =>
                  <Radio value={v.id} key={v.id}>{getVersionLabel(intl, v)}</Radio>)} */}
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form.Item>
        <UI.TitleActive>
          {$t({ defaultMessage: 'When do you want the update to run?' })}
        </UI.TitleActive>
        <UI.TitleActive>
          {
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Selected time will apply to each venue according to own time-zone' })
          }
        </UI.TitleActive>
        <UI.DateContainer>
          <label>{$t({ defaultMessage: 'Update date:' })}</label>
          <Form.Item name='date' noStyle>
            <DatePicker
              showToday={false}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </UI.DateContainer>
        {
          selectedDate &&
          <UI.DateContainer>
            <label>{$t({ defaultMessage: 'Update time:' })}</label>
            <Form.Item name='time' noStyle>
              <Radio.Group style={{ margin: 12 }}>
                <Space direction={'vertical'}>
                  { AVAILABLE_SLOTS.map(v =>
                    <Radio value={v.value} key={v.value}>{v.label}</Radio>)}
                </Space>
              </Radio.Group>
            </Form.Item>
          </UI.DateContainer>
        }
      </Form>
    </UI.ScheduleModal>
  )
}
