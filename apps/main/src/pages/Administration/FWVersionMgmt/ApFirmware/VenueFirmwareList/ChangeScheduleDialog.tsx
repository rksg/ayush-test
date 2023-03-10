import { useEffect, useState } from 'react'

import { DatePicker, Select, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                              from 'antd/lib/form/Form'
import { useIntl }                                                              from 'react-intl'

import {
  AVAILABLE_SLOTS,
  FirmwareType,
  FirmwareVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

import type { DatePickerProps  } from 'antd'

enum VersionsSelectMode {
  Radio,
  Dropdown
}

export interface ChangeScheduleDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  // eslint-disable-next-line max-len
  const { visible, onSubmit, onCancel, data, availableVersions } = props
  const [selectMode, setSelectMode] = useState(VersionsSelectMode.Radio)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [disableSave, setDisableSave] = useState(false)

  useEffect(() => {
    if (availableVersions && availableVersions[0]) {
      let firstIndex = availableVersions.findIndex(isRecommanded)
      setSelectedVersion(availableVersions[firstIndex].name)
    }
  }, [availableVersions])

  useEffect(() => {
    if (selectMode === VersionsSelectMode.Dropdown && !selectedVersion) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }, [selectMode, selectedVersion])

  let versionOptions: FirmwareVersion[] = []
  let otherVersions: FirmwareVersion[] = []

  const isRecommanded = (e: FirmwareVersion) => {
    return e.category === 'RECOMMENDED'
  }

  let copyAvailableVersions = availableVersions ? [...availableVersions] : []
  let firstIndex = copyAvailableVersions.findIndex(isRecommanded)
  if (firstIndex > 0) {
    let removed = copyAvailableVersions.splice(firstIndex, 1)
    versionOptions = [...removed, ...copyAvailableVersions]
  } else {
    versionOptions = [...copyAvailableVersions]
  }
  otherVersions = copyAvailableVersions.slice(1)

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelectMode(e.target.value)
  }

  const otherOptions = otherVersions.map((version) => {
    return {
      label: getVersionLabel(version),
      value: version.name
    }
  })

  const handleChange = (value: string) => {
    setSelectedVersion(value)
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
      // eslint-disable-next-line max-len
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
            <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Choose which version to update the venue to:' })}
            </Typography>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={onSelectModeChange}
              value={selectMode}>
              <Space direction={'vertical'}>
                <Radio value={VersionsSelectMode.Radio}>
                  {getVersionLabel(versionOptions[0])}
                </Radio>
                { otherVersions.length > 0 ?
                  <Radio value={VersionsSelectMode.Dropdown}>
                    <Select
                      style={{ width: '100%', fontSize: '12px' }}
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
        <UI.TitleActive>When do you want the update to run?</UI.TitleActive>
        { // eslint-disable-next-line max-len
          <UI.TitleActive>Selected time will apply to each venue according to own time-zone</UI.TitleActive>}
        <UI.DateContainer>
          <label>Update date:</label>
          <DatePicker onChange={onChange} />
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
      </Form>
    </UI.ScheduleModal>
  )
}
