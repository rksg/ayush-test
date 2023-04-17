import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                      from 'antd/lib/form/Form'
import dayjs                                                            from 'dayjs'
import { useIntl }                                                      from 'react-intl'

import {
  AVAILABLE_SLOTS,
  FirmwareSwitchVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getSwitchVersionLabel
} from '../../FirmwareUtils'
import { PreDownload } from '../../PreDownload'

import * as UI from './styledComponents'

import type { DatePickerProps  } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ChangeScheduleDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[]
  availableVersions?: FirmwareVersion[]
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions } = props
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [disableSave, setDisableSave] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!selectedVersion) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }, [selectedVersion])

  useEffect(() => {
    if (data) {
      if (data.length === 1 && data[0].preDownload) {
        setChecked(data[0].preDownload)
      } else {
        setChecked(false)
      }
    }
  }, [data])

  const handleChange = (value: RadioChangeEvent) => {
    setSelectedVersion(value.target.value)
  }

  const startDate = dayjs().endOf('day')
  const endDate = startDate.add(21, 'day')
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  // Can not select days before today and today
    return current && (current < startDate || current > endDate)
  }

  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    setSelectedDate(dateString)
  }

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectedTime(e.target.value)
  }

  const createRequest = (): UpdateScheduleRequest => {
    return {
      date: selectedDate,
      time: selectedTime,
      preDownload: checked,
      venueIds: data ? (data as FirmwareSwitchVenue[]).map((d: FirmwareSwitchVenue) => d.id) : null,
      switchVersion: selectedVersion
    }
  }

  const triggerSubmit = () => {
    form.validateFields()
      .then(() => {
        onSubmit(createRequest())
        onModalCancel()
      })
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
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <Form
        form={form}
        name={'changeScheduleModalForm'}
      >
        <Form.Item>
          <div>
            <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Choose which version to update the venue to:' })}
            </Typography>
            <Radio.Group
              style={{ margin: 12 }}
              // eslint-disable-next-line max-len
              defaultValue={availableVersions && availableVersions[0] ? availableVersions[0] : ''}
              onChange={handleChange}
              value={selectedVersion}>
              <Space direction={'vertical'}>
                { availableVersions?.map(v =>
                  <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(v)}</Radio>)}
              </Space>
            </Radio.Group>
          </div>
        </Form.Item>
        <UI.TitleActive>When do you want the update to run?</UI.TitleActive>
        { // eslint-disable-next-line max-len
          <UI.TitleActive>Selected time will apply to each venue according to own time-zone</UI.TitleActive>}
        <UI.DateContainer>
          <label>Update date:</label>
          <DatePicker
            showToday={false}
            disabledDate={disabledDate}
            onChange={onChange}
          />
        </UI.DateContainer>
        { selectedDate ?
          <UI.DateContainer>
            <label>Update time:</label>
            <Radio.Group
              style={{ margin: 12 }}
              // eslint-disable-next-line max-len
              // defaultValue={availableVersions && availableVersions[0] ? availableVersions[0].name : ''}
              onChange={onChangeRegular}
              value={selectedTime}>
              <Space direction={'vertical'}>
                { AVAILABLE_SLOTS.map(v =>
                  <Radio value={v.value} key={v.value}>{v.label}</Radio>)}
              </Space>
            </Radio.Group>
          </UI.DateContainer>
          : null
        }
        <PreDownload
          checked={checked}
          setChecked={setChecked}
        />
      </Form>
    </UI.ScheduleModal>
  )
}
