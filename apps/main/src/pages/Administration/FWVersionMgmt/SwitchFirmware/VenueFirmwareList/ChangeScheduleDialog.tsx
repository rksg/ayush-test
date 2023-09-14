import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                      from 'antd/lib/form/Form'
import dayjs                                                            from 'dayjs'
import _                                                                from 'lodash'
import moment                                                           from 'moment-timezone'
import { useIntl }                                                      from 'react-intl'

import { Modal, Subtitle }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AVAILABLE_SLOTS,
  FirmwareCategory,
  FirmwareSwitchVenue,
  FirmwareVersion,
  switchSchedule,
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
  currentSchedule?: switchSchedule
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions, nonIcx8200Count, icx8200Count,
    currentSchedule } = props
  const [selectedDateMoment, setSelectedDateMoment] = useState<moment.Moment>()
  const [currentScheduleDateString, setCurrentScheduleDateString] = useState('')
  const [currentScheduleTime, setCurrentScheduleTime] = useState('')
  const [currentPreDownload, setCurrentPreDownload] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [checked, setChecked] = useState(false)
  const enableSwitchTwoVersionUpgrade = useIsSplitOn(Features.SUPPORT_SWITCH_TWO_VERSION_UPGRADE)
  const [disableSave, setDisableSave] = useState(enableSwitchTwoVersionUpgrade)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)
  const [scheduleDateChanged, setScheduleDateChanged] = useState(false)
  const [scheduleTimeChanged, setScheduleTimeChanged] = useState(false)
  const [preDownloadChanged, setPreDownloadChanged] = useState(false)

  const currentScheduleVersion = currentSchedule?.version ? currentSchedule.version.name : ''
  // eslint-disable-next-line max-len
  const currentScheduleVersionAboveTen = currentSchedule?.versionAboveTen ? currentSchedule.versionAboveTen.name : ''

  useEffect(() => {
    if (data) {
      if (data.length === 1 && data[0].preDownload) {
        setChecked(data[0].preDownload)
        setCurrentPreDownload(data[0].preDownload)
      } else {
        setChecked(false)
        setCurrentPreDownload(false)
      }
    }
  }, [data])

  useEffect(() => {
    const hasSelectedDateAndTime = !_.isEmpty(selectedDate) && !_.isEmpty(selectedTime)
    // eslint-disable-next-line max-len
    setDisableSave((!selectionChanged && !selectionAboveTenChanged && !scheduleDateChanged && !scheduleTimeChanged && !preDownloadChanged) ||
      !hasSelectedDateAndTime)
  }, [selectionChanged, selectionAboveTenChanged, selectedDate, selectedTime, scheduleDateChanged,
    scheduleTimeChanged, preDownloadChanged ])

  useEffect(() => {
    if (enableSwitchTwoVersionUpgrade) {
      if (currentSchedule?.timeSlot?.startDateTime) {
        getCurrentScheduleDateAndTime(currentSchedule?.timeSlot?.startDateTime)
      } else {
        setSelectedDate('')
        setSelectedTime('')
      }

      setSelectedVersion(currentScheduleVersion ? currentScheduleVersion : '')
      // eslint-disable-next-line max-len
      setSelectedAboveTenVersion(currentScheduleVersionAboveTen ? currentScheduleVersionAboveTen : '')
    }
  }, [enableSwitchTwoVersionUpgrade, currentSchedule, currentScheduleVersion,
    currentScheduleVersionAboveTen])

  // eslint-disable-next-line max-len
  const getAvailableVersionsByPrefix = (availableVersions?: FirmwareVersion[], aboveTenPrefix?: boolean, currentScheduleVersion?: string) => {
    let firmwareAvailableVersions = availableVersions?.filter(
      (v: FirmwareVersion) => aboveTenPrefix ? v.id.startsWith('100') : !v.id.startsWith('100')
    )
    if (currentScheduleVersion) {
      const currentVersionInSchedule = firmwareAvailableVersions?.filter((v: FirmwareVersion) =>
        currentScheduleVersion === v.id)

      if (currentVersionInSchedule?.length === 0) {
        firmwareAvailableVersions?.push({
          id: currentScheduleVersion,
          name: currentScheduleVersion,
          category: FirmwareCategory.REGULAR } as FirmwareVersion)
      }
    }
    return firmwareAvailableVersions
  }

  const getCurrentScheduleDateAndTime = (startTime: string) => {
    const dateAndTime = startTime.split('T')

    if (dateAndTime?.length === 2) {
      setCurrentScheduleDateString(dateAndTime[0])
      setSelectedDate(dateAndTime[0])
      setSelectedDateMoment(moment(dateAndTime[0]))

      const timeZoneKeyWords = ['-', '+', 'Z']
      for (let value of timeZoneKeyWords) {
        let startAndEndTime = dateAndTime[1].split(value)
        if (startAndEndTime.length === 2) {
          const startTime = startAndEndTime[0].split(':')
          const endTime = startTime[0] === '22' ? '00' : +startTime[0] + 2
          let scheduleStartTime: string
          if (endTime !== '00' && endTime < 10) {
            scheduleStartTime = startTime[0] + ':00-0' + endTime + ':00'
          } else {
            scheduleStartTime = startTime[0] + ':00-' + endTime + ':00'
          }

          setCurrentScheduleTime(scheduleStartTime)
          setSelectedTime(scheduleStartTime)
          break
        }
      }
    }
  }

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
    setScheduleDateChanged(currentScheduleDateString !== dateString)
    setSelectedDateMoment(moment(dateString))
    setSelectedDate(dateString)
  }

  const onChangeRegular = (e: RadioChangeEvent) => {
    setScheduleTimeChanged(currentScheduleTime !== e.target.value)
    setSelectedTime(e.target.value)
  }

  const onPreDownloadChange = (checked: boolean) => {
    setPreDownloadChanged(currentPreDownload !== checked)
    setChecked(checked)
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
    setScheduleTimeChanged(false)
    setScheduleDateChanged(false)
    setPreDownloadChanged(false)
    setSelectedVersion(currentScheduleVersion ? currentScheduleVersion : '')
    setSelectedAboveTenVersion(currentScheduleVersionAboveTen ? currentScheduleVersionAboveTen : '')
    // eslint-disable-next-line max-len
    setSelectedDateMoment(currentScheduleDateString ? moment(currentScheduleDateString) : undefined)
    setSelectedTime(currentScheduleTime)
    setChecked(currentPreDownload)
  }

  return (
    <Modal
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
              {$t({ defaultMessage: 'Choose which version to update the venue to:' })}
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
            {enableSwitchTwoVersionUpgrade && <Subtitle level={4}>
              {$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
                &nbsp;
              ({icx8200Count} {$t({ defaultMessage: 'switches' })})
            </Subtitle>}
            {enableSwitchTwoVersionUpgrade && <Radio.Group
              style={{ margin: 12 }}
              onChange={handleChangeForVersionAboveTen}
              value={selectedAboveTenVersion}>
              <Space direction={'vertical'}>
                { // eslint-disable-next-line max-len
                  getAvailableVersionsByPrefix(availableVersions, true, currentScheduleVersionAboveTen)?.map(v =>
                    <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
                <Radio value='' key='0'>
                  {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>}
            {enableSwitchTwoVersionUpgrade && <UI.Section>
              <Subtitle level={4}>
                {$t({ defaultMessage: 'Firmware available for ICX 7150/7550/7650/7850 Series' })}
                &nbsp;
                ({nonIcx8200Count} {$t({ defaultMessage: 'switches' })})
              </Subtitle>
              <Radio.Group
                style={{ margin: 12 }}
                onChange={handleChange}
                value={selectedVersion}>
                <Space direction={'vertical'}>
                  { // eslint-disable-next-line max-len
                    getAvailableVersionsByPrefix(availableVersions, false, currentScheduleVersion)?.map(v =>
                      <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
                  <Radio value='' key='0'>
                    {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>}
          </div>
        </Form.Item>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'When do you want the update to run?' })}
        </Subtitle>
        {
          <UI.TitleActive>
            {$t({
              defaultMessage: 'Selected time will apply to each venue according to own time-zone'
            })}
          </UI.TitleActive>}

        <UI.DateContainer>
          <label>{$t({ defaultMessage: 'Update date:' })}</label>
          <DatePicker
            showToday={false}
            disabledDate={disabledDate}
            onChange={onChange}
            value={selectedDate ? moment(selectedDateMoment) : undefined}
          />
        </UI.DateContainer>

        {selectedDate ?
          <UI.DateContainer>
            <label>{$t({ defaultMessage: 'Update time:' })}</label>
            <Radio.Group
              style={{ margin: 12 }}
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
          setChecked={onPreDownloadChange}
        />

      </Form>
    </Modal>
  )
}
