import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                      from 'antd/lib/form/Form'
import dayjs                                                            from 'dayjs'
import _                                                                from 'lodash'
import { useIntl }                                                      from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
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
  nonIcx8200Count: number
  icx8200Count: number
  currentScheduleVersion?: string
  currentScheduleVersionAboveTen?: string
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions, nonIcx8200Count, icx8200Count,
    currentScheduleVersion, currentScheduleVersionAboveTen } = props
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [checked, setChecked] = useState(false)
  const enableSwitchTwoVersionUpgrade = useIsSplitOn(Features.SUPPORT_SWITCH_TWO_VERSION_UPGRADE)
  const [disableSave, setDisableSave] = useState(enableSwitchTwoVersionUpgrade)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)

  // eslint-disable-next-line max-len
  const firmware90AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => !v.id.startsWith('100'))
  // eslint-disable-next-line max-len
  const firmware10AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => v.id.startsWith('100'))

  useEffect(() => {
    if (data) {
      if (data.length === 1 && data[0].preDownload) {
        setChecked(data[0].preDownload)
      } else {
        setChecked(false)
      }
      const hasSelectedDateAndTime = !_.isEmpty(selectedDate) && !_.isEmpty(selectedTime)
      setDisableSave((!selectionChanged && !selectionAboveTenChanged) || !hasSelectedDateAndTime)
    }
  }, [data, selectionChanged, selectionAboveTenChanged, selectedDate, selectedTime])

  useEffect(() => {
    if (enableSwitchTwoVersionUpgrade) {
      setSelectedVersion(currentScheduleVersion ? currentScheduleVersion : '')
      // eslint-disable-next-line max-len
      setSelectedAboveTenVersion(currentScheduleVersionAboveTen ? currentScheduleVersionAboveTen : '')
    }
  }, [enableSwitchTwoVersionUpgrade, currentScheduleVersion, currentScheduleVersionAboveTen])

  const handleChange = (value: RadioChangeEvent) => {
    setSelectionChanged(currentScheduleVersion !== value.target.value)
    setSelectedVersion(value.target.value)
  }

  const handleChangeForVersionAboveTen = (value: RadioChangeEvent) => {
    setSelectionAboveTenChanged(currentScheduleVersionAboveTen !== value.target.value)
    setSelectedAboveTenVersion(value.target.value)
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
    if (enableSwitchTwoVersionUpgrade) {
      return {
        date: selectedDate,
        time: selectedTime,
        preDownload: checked, // eslint-disable-next-line max-len
        venueIds: data ? (data as FirmwareSwitchVenue[]).map((d: FirmwareSwitchVenue) => d.id) : null,
        switchVersion: selectedVersion,
        switchVersionAboveTen: enableSwitchTwoVersionUpgrade ? selectedAboveTenVersion : ''
      }
    }
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
    resetValues()
    onCancel()
  }

  const resetValues = () => {
    setSelectionChanged(false)
    setSelectionAboveTenChanged(false)
    setSelectedVersion(currentScheduleVersion ? currentScheduleVersion : '')
    setSelectedAboveTenVersion(currentScheduleVersionAboveTen ? currentScheduleVersionAboveTen : '')
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
            {!enableSwitchTwoVersionUpgrade && <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Choose which version to update the venue to:' })}
            </Typography>}
            {!enableSwitchTwoVersionUpgrade && <Radio.Group
              style={{ margin: 12 }}
              // eslint-disable-next-line max-len
              defaultValue={availableVersions && availableVersions[0] ? availableVersions[0] : ''}
              onChange={handleChange}
              value={selectedVersion}>
              <Space direction={'vertical'}>
                { availableVersions?.map(v =>
                  <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
              </Space>
            </Radio.Group>}
            {enableSwitchTwoVersionUpgrade && <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Firmware available for ICX-8200 Series' }) } ({icx8200Count} {$t({ defaultMessage: 'switches' })})
            </Typography>}
            {enableSwitchTwoVersionUpgrade && <Radio.Group
              style={{ margin: 12 }}
              onChange={handleChangeForVersionAboveTen}
              value={selectedAboveTenVersion}>
              <Space direction={'vertical'}>
                { firmware10AvailableVersions?.map(v =>
                  <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
                <Radio value='' key='0'>
                  {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>}
            {enableSwitchTwoVersionUpgrade && <UI.Section>
              <Typography>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Firmware available for ICX 7150/7550/7650/7850 Series Models' })} ({nonIcx8200Count} {$t({ defaultMessage: 'switches' })})
              </Typography>
              <Radio.Group
                style={{ margin: 12 }}
                onChange={handleChange}
                value={selectedVersion}>
                <Space direction={'vertical'}>
                  { firmware90AvailableVersions?.map(v =>
                    <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
                  <Radio value='' key='0'>
                    {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>}
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
