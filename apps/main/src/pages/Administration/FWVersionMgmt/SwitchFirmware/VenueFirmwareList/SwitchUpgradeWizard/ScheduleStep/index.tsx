import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space } from 'antd'
import dayjs                                                from 'dayjs'
import _                                                    from 'lodash'
import { useIntl }                                          from 'react-intl'

import { Subtitle, useStepFormContext } from '@acx-ui/components'
import { useSwitchFirmwareUtils }       from '@acx-ui/rc/components'
import {
  AVAILABLE_SLOTS,
  FirmwareCategory,
  FirmwareSwitchVenue,
  FirmwareVersion,
  SwitchFirmware,
  switchSchedule
} from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'

import { PreDownload } from './PreDownload'

import type { DatePickerProps }  from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ScheduleStepProps {
  visible: boolean,
  availableVersions?: FirmwareVersion[]
  nonIcx8200Count: number
  icx8200Count: number
  hasVenue: boolean,
  data: FirmwareSwitchVenue[],
  upgradeVenueList: FirmwareSwitchVenue[],
  upgradeSwitchList: SwitchFirmware[],
  setShowSubTitle: (visible: boolean) => void
}

export function ScheduleStep (props: ScheduleStepProps) {
  const { availableVersions, nonIcx8200Count, icx8200Count,
    hasVenue, upgradeVenueList, upgradeSwitchList,
    setShowSubTitle } = props

  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { getSwitchVersionLabel } = useSwitchFirmwareUtils()
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const [hasSelectedDate, setHasSelectedDate] = useState<boolean>(false)
  const getCurrentChecked = function () {
    if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
      return upgradeVenueList.length === 1 ?
        upgradeVenueList[0].preDownload : upgradeSwitchList[0].preDownload
    } return false
  }

  const [checked, setChecked] = useState(getCurrentChecked())

  const getCurrentSchedule = function () {
    if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
      return upgradeVenueList.length === 1 ?
        upgradeVenueList[0].nextSchedule : upgradeSwitchList[0].switchNextSchedule
    }
    return {} as switchSchedule
  }

  const currentSchedule = getCurrentSchedule()
  const currentScheduleVersion = currentSchedule?.version?.name ?? ''
  const currentScheduleVersionAboveTen = currentSchedule?.versionAboveTen?.name ?? ''


  useEffect(()=>{
    setShowSubTitle(false)
  }, [current])

  useEffect(() => {
    if ((hasVenue || nonIcx8200Count > 0)) {
      setSelectedVersion(currentScheduleVersion || '')
      form.setFieldValue('switchVersion', currentScheduleVersion)
    }

    if ((hasVenue || icx8200Count > 0)) {
      setSelectedAboveTenVersion(currentScheduleVersionAboveTen || '')
      form.setFieldValue('switchVersionAboveTen', currentScheduleVersionAboveTen)
    }

    form.setFieldValue('preDownloadChecked', getCurrentChecked())

  }, [upgradeVenueList, upgradeSwitchList])

  const getAvailableVersionsByPrefix = (availableVersions?: FirmwareVersion[],
    aboveTenPrefix?: boolean, currentScheduleVersion?: string) => {
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
          category: FirmwareCategory.REGULAR
        } as FirmwareVersion)
      }
    }
    return firmwareAvailableVersions
  }

  const handleChange = (value: RadioChangeEvent) => {
    setSelectedVersion(value.target.value)
    form.setFieldValue('switchVersion', value.target.value)
    form.validateFields(['selectVersionStep'])
  }

  const handleChangeForVersionAboveTen = (value: RadioChangeEvent) => {
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

  const onChange: DatePickerProps['onChange'] = (date) => {
    setHasSelectedDate(true)
    form.setFieldValue('selectDateStep', date)
    form.validateFields(['selectDateStep'])
  }

  const onChangeRegular = (e: RadioChangeEvent) => {
    form.setFieldValue('selectTimeStep', e.target.value)
    form.validateFields(['selectTimeStep'])
  }

  const onPreDownloadChange = (checked: boolean) => {
    setChecked(checked)
    form.setFieldValue('preDownloadChecked', checked)
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
            style={{ position: 'fixed', marginTop: '-25px' }}
            name='selectVersionStep'
            rules={[
              {
                validator: () => {
                  const switchVersionAboveTen = form.getFieldValue('switchVersionAboveTen')
                  const switchVersion = form.getFieldValue('switchVersion')
                  if (_.isEmpty(switchVersionAboveTen) && _.isEmpty(switchVersion)) {
                    return Promise.reject(
                      intl.$t({ defaultMessage: 'Please select at least 1 version.' }))
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
              {intl.$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
              &nbsp;
              ({icx8200Count} {intl.$t({ defaultMessage: 'switches' })})
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
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}
          {(hasVenue || nonIcx8200Count > 0) &&
            <UI.Section>
              <Subtitle level={4}>
                {intl.$t({
                  defaultMessage:
                    'Firmware available for ICX 7150/7550/7650/7850 Series'
                })}
                &nbsp;
                ({nonIcx8200Count} {intl.$t({ defaultMessage: 'switches' })})
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
                    {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>
          }
        </div>

      </Form.Item>
      <Subtitle level={4}>
        {intl.$t({ defaultMessage: 'When do you want the update to run?' })}
      </Subtitle>
      {<UI.TitleActive>
        {intl.$t({
          defaultMessage: 'Venue\'s local time-zone is applied to the selection below.'
        })}
      </UI.TitleActive>}

      <Form.Item
        label={intl.$t({ defaultMessage: 'Update date' })}
        name='selectDateStep'
        validateFirst
        rules={[
          { required: true }
        ]}
        children={
          <DatePicker
            showToday={false}
            allowClear={false}
            disabledDate={disabledDate}
            onChange={onChange}
          />
        }
      />

      {hasSelectedDate &&
        <Form.Item
          name='selectTimeStep'
          label={intl.$t({ defaultMessage: 'Update time' })}
          rules={[
            { required: true }
          ]}
          validateFirst
          children={
            <Radio.Group
              onChange={onChangeRegular}
            >
              <Space direction={'vertical'}>
                {AVAILABLE_SLOTS.map(v =>
                  <Radio value={v.value} key={v.value}>{v.label}</Radio>)}
              </Space>
            </Radio.Group>
          }
        />
      }

      <PreDownload
        checked={checked}
        setChecked={onPreDownloadChange}
      />

    </div>
  )
}
