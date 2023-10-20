/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import dayjs                                                from 'dayjs'
import _                                                    from 'lodash'
import moment                                               from 'moment-timezone'
import { useIntl }                                          from 'react-intl'

import { Subtitle, useStepFormContext } from '@acx-ui/components'
import {
  AVAILABLE_SLOTS,
  FirmwareCategory,
  FirmwareVersion,
  switchSchedule
} from '@acx-ui/rc/utils'

import {
  getSwitchVersionLabel
} from '../../../../FirmwareUtils'
import * as UI from '../../styledComponents'

import { PreDownload } from './PreDownload'

import type { DatePickerProps  } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ScheduleStepProps {
  visible: boolean,
  availableVersions?: FirmwareVersion[]
  nonIcx8200Count: number
  icx8200Count: number
  hasVenue: boolean,
  currentSchedule?: switchSchedule
}

export function ScheduleStep (props: ScheduleStepProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form } = useStepFormContext()
  const { availableVersions, nonIcx8200Count, icx8200Count,
    currentSchedule, hasVenue } = props
  const [selectedDateMoment, setSelectedDateMoment] = useState<moment.Moment>()
  const [currentScheduleDateString, setCurrentScheduleDateString] = useState('')
  const [currentScheduleTime, setCurrentScheduleTime] = useState('')
  const [currentPreDownload, setCurrentPreDownload] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [checked, setChecked] = useState(false)
  const [disableSave, setDisableSave] = useState(true)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)
  const [scheduleDateChanged, setScheduleDateChanged] = useState(false)
  const [scheduleTimeChanged, setScheduleTimeChanged] = useState(false)
  const [preDownloadChanged, setPreDownloadChanged] = useState(false)

  const currentScheduleVersion = currentSchedule?.version ? currentSchedule.version.name : ''
  // eslint-disable-next-line max-len
  const currentScheduleVersionAboveTen = currentSchedule?.versionAboveTen ? currentSchedule.versionAboveTen.name : ''

  // useEffect(() => {
  //   if (data) {
  //     if (data.length === 1 && data[0].preDownload) {
  //       setChecked(data[0].preDownload)
  //       setCurrentPreDownload(data[0].preDownload)
  //     } else {
  //       setChecked(false)
  //       setCurrentPreDownload(false)
  //     }
  //   }
  // }, [data])

  useEffect(() => {
    const hasSelectedDateAndTime = !_.isEmpty(selectedDate) && !_.isEmpty(selectedTime)
    // eslint-disable-next-line max-len
    setDisableSave((!selectionChanged && !selectionAboveTenChanged && !scheduleDateChanged && !scheduleTimeChanged && !preDownloadChanged) ||
      !hasSelectedDateAndTime)
  }, [selectionChanged, selectionAboveTenChanged, selectedDate, selectedTime, scheduleDateChanged,
    scheduleTimeChanged, preDownloadChanged ])

  useEffect(() => {
    if (currentSchedule?.timeSlot?.startDateTime) {
      getCurrentScheduleDateAndTime(currentSchedule?.timeSlot?.startDateTime)
    } else {
      setSelectedDate('')
      setSelectedTime('')
      form.setFieldValue('selectedDate', '')
      form.setFieldValue('selectedTime', '')
    }

    setSelectedVersion(currentScheduleVersion ? currentScheduleVersion : '')
    // eslint-disable-next-line max-len
    setSelectedAboveTenVersion(currentScheduleVersionAboveTen ? currentScheduleVersionAboveTen : '')

  }, [currentSchedule, currentScheduleVersion,
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
      form.setFieldValue('selectedDate', dateAndTime[0])

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
          form.setFieldValue('selectedTime', scheduleStartTime)
          break
        }
      }
    }
  }

  const handleChange = (value: RadioChangeEvent) => {
    setSelectionChanged(currentScheduleVersion !== value.target.value)
    setSelectedVersion(value.target.value)
    form.setFieldValue('switchVersion', value.target.value)
    form.validateFields(['selectVersionStep'])
  }

  const handleChangeForVersionAboveTen = (value: RadioChangeEvent) => {
    setSelectionAboveTenChanged(currentScheduleVersionAboveTen !== value.target.value)
    setSelectedAboveTenVersion(value.target.value)
    form.setFieldValue('switchVersionAboveTen', value.target.value)
    form.validateFields(['selectVersionStep'])
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
    form.setFieldValue('selectedDate', dateString)
    form.validateFields(['selectDateStep'])
  }

  const onChangeRegular = (e: RadioChangeEvent) => {
    setScheduleTimeChanged(currentScheduleTime !== e.target.value)
    setSelectedTime(e.target.value)
    form.setFieldValue('selectedTime', e.target.value)
    form.validateFields(['selectTimeStep'])
  }

  const onPreDownloadChange = (checked: boolean) => {
    setPreDownloadChanged(currentPreDownload !== checked)
    setChecked(checked)
    form.setFieldValue('preDonloadChecked', checked)
  }


  return (
    <div
      style={{
        minHeight: '50vh',
        marginBottom: '30px'
      }}
    >
      <Form.Item>
        <div>
          <UI.ValidateField
            name='selectVersionStep'
            rules={[
              {
                validator: () => {
                  const switchVersionAboveTen = form.getFieldValue('switchVersionAboveTen')
                  const switchVersion = form.getFieldValue('switchVersion')
                  if (_.isEmpty(switchVersionAboveTen) && _.isEmpty(switchVersion)) {
                    return Promise.reject('Please select at least 1 version.')
                  }

                  return Promise.resolve()
                }
              }
            ]}
            validateFirst
            children={<> </>}
          />
          {(hasVenue || icx8200Count > 0) && <>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
              &nbsp;
              ({icx8200Count} {$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={handleChangeForVersionAboveTen}
              value={selectedAboveTenVersion}>
              <Space direction={'vertical'}>
                { // eslint-disable-next-line max-len
                  getAvailableVersionsByPrefix(availableVersions, true, currentScheduleVersionAboveTen)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      {getSwitchVersionLabel(intl, v)}</Radio>)}
                <Radio value='' key='0'>
                  {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}
          {(hasVenue || nonIcx8200Count > 0) &&
            <UI.Section>
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
                      <Radio value={v.id} key={v.id} disabled={v.inUse}>
                        {getSwitchVersionLabel(intl, v)}</Radio>)}
                  <Radio value='' key='0'>
                    {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>
          }
        </div>

      </Form.Item>
      <Subtitle level={4}>
        {$t({ defaultMessage: 'When do you want the update to run?' })}
      </Subtitle>
      {
        <UI.TitleActive>
          {$t({
            defaultMessage: 'Venue\'s local time-zone is applied to the selection below.'
          })}
        </UI.TitleActive>}

      <Form.Item
        label={'Update date:'}
        name='selectDateStep'
        rules={[
          {
            validator: () => {
              const selectedDate = form.getFieldValue('selectedDate')
              if (_.isEmpty(selectedDate)) {
                return Promise.reject('This field is required.')
              }
              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={
          <DatePicker
            showToday={false}
            disabledDate={disabledDate}
            onChange={onChange}
            value={selectedDate ? moment(selectedDateMoment) : undefined}
          />
        }
      />


      {selectedDate ?
        <Form.Item
          name='selectTimeStep'
          label={$t({ defaultMessage: 'Update time:' })}
          rules={[
            {
              validator: () => {
                const selectedTime = form.getFieldValue('selectedTime')
                if (_.isEmpty(selectedTime)) {
                  return Promise.reject('This field is required.')
                }

                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={
            <Radio.Group
              // style={{ margin: 12 }}
              onChange={onChangeRegular}
              value={selectedTime}>
              <Space direction={'vertical'}>
                {AVAILABLE_SLOTS.map(v =>
                  <Radio value={v.value} key={v.value}>{v.label}</Radio>)}
              </Space>
            </Radio.Group>}
        />

        : null
      }
      <PreDownload
        checked={checked}
        setChecked={onPreDownloadChange}
      />

    </div>
  )
}
