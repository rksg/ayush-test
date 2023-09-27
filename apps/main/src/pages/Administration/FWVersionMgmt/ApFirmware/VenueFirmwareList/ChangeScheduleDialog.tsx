import { useEffect, useState } from 'react'

import { DatePicker, Select, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                              from 'antd/lib/form/Form'
import dayjs                                                                    from 'dayjs'
import { useIntl }                                                              from 'react-intl'


import {
  AVAILABLE_SLOTS,
  FirmwareType,
  FirmwareVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel, isBetaFirmware
} from '../../FirmwareUtils'

import { filteredOtherActiveVersions, getDefaultActiveVersion } from './AdvancedUpdateNowDialog'
import * as UI                                                  from './styledComponents'
import { VersionsSelectMode }                                   from './UpdateNowDialog'

import type { DatePickerProps }  from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ChangeScheduleDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions } = props
  const [selectMode, setSelectMode] = useState(VersionsSelectMode.Radio)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [disableSave, setDisableSave] = useState(true)

  useEffect(() => {
    if (availableVersions && availableVersions[0]) {
      let firstIndex = availableVersions.findIndex(isRecommanded)
      if (firstIndex > -1) {
        setSelectedVersion(availableVersions[firstIndex].name)
      } else {
        setSelectedVersion(availableVersions[0].name)
      }
    }
  }, [availableVersions])

  useEffect(() => {
    if (!selectedDate || (selectMode === VersionsSelectMode.Dropdown && !selectedVersion)) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }, [selectMode, selectedVersion, selectedDate])

  // eslint-disable-next-line max-len
  const defaultActiveVersion: FirmwareVersion | undefined = getDefaultActiveVersion(availableVersions)
  const otherVersions: FirmwareVersion[] = filteredOtherActiveVersions(availableVersions)

  const isRecommanded = (e: FirmwareVersion) => {
    return e.category === 'RECOMMENDED'
  }

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelectMode(e.target.value)
  }

  const otherOptions = otherVersions.map((version) => {
    return {
      label: getVersionLabel(intl, version, isBetaFirmware(version.category)),
      value: version.name
    }
  })

  const handleChange = (value: string) => {
    setSelectedVersion(value)
  }

  const startDate = dayjs(Date.now()).endOf('day')
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

  const createVenuePayload = (venue: FirmwareVenue) => {
    return {
      id: venue.id,
      version: selectedVersion,
      type: FirmwareType.AP_FIRMWARE_UPGRADE
    }
  }

  const createRequest = (): UpdateScheduleRequest => {
    return {
      date: selectedDate,
      time: selectedTime,
      venues: (data as FirmwareVenue[]).map((row) => createVenuePayload(row))
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
    setSelectMode(VersionsSelectMode.Radio)
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
        <Form.Item
          initialValue={VersionsSelectMode.Radio}
        >
          <div>
            <Typography style={{ fontWeight: 700 }}>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Choose which version to update the venue to:' })}
            </Typography>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={onSelectModeChange}
              value={selectMode}>
              <Space direction={'vertical'}>
                {defaultActiveVersion &&
                  <Radio value={VersionsSelectMode.Radio}>
                    {getVersionLabel(intl, defaultActiveVersion)}
                  </Radio>
                }
                { otherVersions.length > 0 ?
                  <Radio value={VersionsSelectMode.Dropdown}>
                    <Select
                      style={{ width: '420px', fontSize: '12px' }}
                      placeholder='Select other version...'
                      onChange={handleChange}
                      options={otherOptions}
                    />
                  </Radio>
                  : null
                }
              </Space>
            </Radio.Group>
          </div>
        </Form.Item>
        <UI.TitleDate>{$t({ defaultMessage: 'When do you want the update to run?' })}</UI.TitleDate>
        { // eslint-disable-next-line max-len
          <UI.Title2Date>{$t({ defaultMessage: 'Selected time will apply to each venue according to own time-zone' })}</UI.Title2Date>}
        <UI.DateContainer>
          <label>{$t({ defaultMessage: 'Update date:' })}</label>
          <DatePicker
            showToday={false}
            disabledDate={disabledDate}
            onChange={onChange}
          />
        </UI.DateContainer>
        { selectedDate ?
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
      </Form>
    </UI.ScheduleModal>
  )
}
