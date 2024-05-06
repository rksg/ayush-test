import { useState } from 'react'

import { DatePicker, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import dayjs                                                      from 'dayjs'
import { useIntl }                                                from 'react-intl'


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

import type { DatePickerProps }  from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ChangeScheduleDialogProps {
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const intl = useIntl()
  const { onSubmit, onCancel, data, availableVersions } = props
  // eslint-disable-next-line max-len
  const defaultActiveVersion: FirmwareVersion | undefined = getDefaultActiveVersion(availableVersions)
  const otherVersions: FirmwareVersion[] = filteredOtherActiveVersions(availableVersions)
  const [selectedVersion, setSelectedVersion] = useState(defaultActiveVersion?.name ?? '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string>('')
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
      venues: data.map((row) => createVenuePayload(row))
    }
  }

  const triggerSubmit = () => {
    onSubmit(createRequest())
    onCancel()
  }

  const onSelectedVersionChange = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
  }

  return (
    <UI.ScheduleModal
      title={intl.$t({ defaultMessage: 'Change Update Schedule' })}
      visible={true}
      width={560}
      okText={intl.$t({ defaultMessage: 'Save' })}
      onOk={triggerSubmit}
      onCancel={onCancel}
      okButtonProps={{ disabled: !selectedVersion || !selectedDate || !selectedTime }}
    >
      <div>
        <Typography style={{ fontWeight: 700 }}>{ /*eslint-disable-next-line max-len*/ }
          { intl.$t({ defaultMessage: 'Choose which version to update the <venueSingular></venueSingular> to:' }) }
        </Typography>
        <Radio.Group
          style={{ margin: 12 }}
          onChange={onSelectedVersionChange}
          value={selectedVersion}>
          <Space direction={'vertical'} size={12}>
            {defaultActiveVersion &&
              <Radio key={defaultActiveVersion.name} value={defaultActiveVersion.name}>
                {getVersionLabel(intl, defaultActiveVersion)}
              </Radio>
            }
            { otherVersions.map(version => {
              return <Radio key={version.name} value={version.name}>
                {getVersionLabel(intl, version, isBetaFirmware(version.category))}
              </Radio>
            })
            }
          </Space>
        </Radio.Group>
      </div>
      <UI.TitleDate>
        {intl.$t({ defaultMessage: 'When do you want the update to run?' })}
      </UI.TitleDate>
      <UI.Title2Date>
        {// eslint-disable-next-line max-len
          intl.$t({ defaultMessage: 'Selected time will apply to each <venueSingular></venueSingular> according to own time-zone' })}
      </UI.Title2Date>
      <UI.DateContainer>
        <label>{intl.$t({ defaultMessage: 'Update date:' })}</label>
        <DatePicker
          showToday={false}
          disabledDate={disabledDate}
          onChange={onChange}
        />
      </UI.DateContainer>
      { selectedDate ?
        <UI.DateContainer>
          <label>{intl.$t({ defaultMessage: 'Update time:' })}</label>
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
    </UI.ScheduleModal>
  )
}
