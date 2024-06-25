import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space } from 'antd'
import dayjs                                                from 'dayjs'
import _                                                    from 'lodash'
import { useIntl }                                          from 'react-intl'

import { Subtitle, useStepFormContext } from '@acx-ui/components'
import { useSwitchFirmwareUtils }       from '@acx-ui/rc/components'
import {
  AVAILABLE_SLOTS,
  compareSwitchVersion,
  FirmwareCategory,
  FirmwareSwitchVenue,
  FirmwareSwitchVenueV1002,
  FirmwareVersion,
  SwitchFirmwareVersion1002,
  SwitchFirmware,
  switchSchedule,
  SwitchFirmwareModelGroup
} from '@acx-ui/rc/utils'

import { DowngradeTag } from '../../../styledComponents'
import * as UI          from '../../styledComponents'

import { PreDownload } from './PreDownload'

import type { DatePickerProps }  from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ScheduleStepProps {
  visible: boolean,
  availableVersions?: SwitchFirmwareVersion1002[]
  hasVenue: boolean,
  data: FirmwareSwitchVenueV1002[],
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmware[],
  setShowSubTitle: (visible: boolean) => void
}

export function ScheduleStep (props: ScheduleStepProps) {
  const { availableVersions,
    hasVenue, upgradeVenueList, upgradeSwitchList,
    setShowSubTitle } = props

  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { getSwitchVersionLabel } = useSwitchFirmwareUtils()
  // const [selectedVersion, setSelectedVersion] = useState('')
  // const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')

  //Switch model group
  const [selectedICX71Version, setSelecteedICX71Version] = useState('')
  const [selectedICX7XVersion, setSelecteedICX7XVersion] = useState('')
  const [selectedICX82Version, setSelecteedICX82Version] = useState('')

  const ICX71Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0].switchCount || 0
  const ICX7XCount = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0].switchCount || 0
  const ICX82Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0].switchCount || 0

  const handleICX71Change = (value: RadioChangeEvent) => {
    setSelecteedICX71Version(value.target.value)
    form.setFieldValue('selectedICX71Version', value.target.value)
    form.validateFields(['selectVersionStep'])
  }
  const handleICX7XChange = (value: RadioChangeEvent) => {
    setSelecteedICX7XVersion(value.target.value)
    form.setFieldValue('selectedICX7XVersion', value.target.value)
    form.validateFields(['selectVersionStep'])
  }
  const handleICX82Change = (value: RadioChangeEvent) => {
    setSelecteedICX82Version(value.target.value)
    form.setFieldValue('selectedICX82Version', value.target.value)
    form.validateFields(['selectVersionStep'])
  }


  const [hasSelectedDate, setHasSelectedDate] = useState<boolean>(false)
  const getCurrentChecked = function () {
    if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
      return upgradeVenueList.length === 1 ?
        upgradeVenueList[0].preDownload : upgradeSwitchList[0].preDownload
    } return false
  }

  const [checked, setChecked] = useState(getCurrentChecked())

  // const getCurrentSchedule = function () {
  //   if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
  //     return upgradeVenueList.length === 1 ?
  //       upgradeVenueList[0].nextSchedule : upgradeSwitchList[0].switchNextSchedule
  //   }
  //   return {} as switchSchedule
  // }

  // const currentSchedule = getCurrentSchedule()
  // const currentScheduleVersion = currentSchedule?.version?.name ?? ''
  // const currentScheduleVersionAboveTen = currentSchedule?.versionAboveTen?.name ?? ''


  useEffect(()=>{
    setShowSubTitle(false)
  }, [current])

  // useEffect(() => {
  //   if ((hasVenue || nonIcx8200Count > 0)) {
  //     setSelectedVersion(currentScheduleVersion || '')
  //     form.setFieldValue('switchVersion', currentScheduleVersion)
  //   }

  //   if ((hasVenue || icx8200Count > 0)) {
  //     setSelectedAboveTenVersion(currentScheduleVersionAboveTen || '')
  //     form.setFieldValue('switchVersionAboveTen', currentScheduleVersionAboveTen)
  //   }

  //   form.setFieldValue('preDownloadChecked', getCurrentChecked())

  // }, [upgradeVenueList, upgradeSwitchList])

  // const getAvailableVersionsByPrefix = (availableVersions?: FirmwareVersion[],
  //   aboveTenPrefix?: boolean, currentScheduleVersion?: string) => {
  //   let firmwareAvailableVersions = availableVersions?.filter(
  //     (v: FirmwareVersion) => aboveTenPrefix ? v.id.startsWith('100') : !v.id.startsWith('100')
  //   )
  //   if (currentScheduleVersion) {
  //     const currentVersionInSchedule = firmwareAvailableVersions?.filter((v: FirmwareVersion) =>
  //       currentScheduleVersion === v.id)

  //     if (currentVersionInSchedule?.length === 0) {
  //       firmwareAvailableVersions?.push({
  //         id: currentScheduleVersion,
  //         name: currentScheduleVersion,
  //         category: FirmwareCategory.REGULAR
  //       } as FirmwareVersion)
  //     }
  //   }

  //   if (_.isArray(firmwareAvailableVersions)) {
  //     firmwareAvailableVersions =
  //       firmwareAvailableVersions.sort((a, b) => compareSwitchVersion(a.id, b.id))
  //   }

  //   return firmwareAvailableVersions
  // }

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

  const getAvailableVersions =
  (modelGroup: SwitchFirmwareModelGroup, currentScheduleVersion?: string) => {
    let firmwareAvailableVersions = availableVersions?.filter(
      (v: SwitchFirmwareVersion1002) => v.modelGroup === modelGroup
    )

    if (_.isArray(firmwareAvailableVersions) && firmwareAvailableVersions.length > 0) {
      return firmwareAvailableVersions[0].versions.sort((a, b) => compareSwitchVersion(a.id, b.id))
    }

    return []
  }

  return (
    <div
      data-testid='schedule-step'
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
                  const selectedVersions = [
                    form.getFieldValue('selectedICX82Version'),
                    form.getFieldValue('selectedICX71Version'),
                    form.getFieldValue('selectedICX7XVersion')
                  ]
                  if (selectedVersions.every(_.isEmpty)) {
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


          {(hasVenue || ICX71Count > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 7150 Series' })}
              &nbsp;
              ({ICX71Count} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={handleICX71Change}
              value={selectedICX71Version}>
              <Space direction={'vertical'}>
                { // eslint-disable-next-line max-len
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      <span style={{ lineHeight: '22px' }}>
                        {getSwitchVersionLabel(intl, v)}
                        {v.isDowngradeVersion && !v.inUse &&
                          <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                      </span>
                    </Radio>)}

                <Radio value='' key='0'>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

          {(hasVenue || ICX7XCount > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 7550-7850 Series' })}
              &nbsp;
              ({ICX7XCount} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={handleICX7XChange}
              value={selectedICX7XVersion}>
              <Space direction={'vertical'}>
                { // eslint-disable-next-line max-len
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX7X)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      <span style={{ lineHeight: '22px' }}>
                        {getSwitchVersionLabel(intl, v)}
                        {v.isDowngradeVersion && !v.inUse &&
                          <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                      </span>
                    </Radio>)}

                <Radio value='' key='0'>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

          {(hasVenue || ICX82Count > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
              &nbsp;
              ({ICX82Count} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={handleICX82Change}
              value={selectedICX82Version}>
              <Space direction={'vertical'}>
                { // eslint-disable-next-line max-len
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX82)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      <span style={{ lineHeight: '22px' }}>
                        {getSwitchVersionLabel(intl, v)}
                        {v.isDowngradeVersion && !v.inUse &&
                          <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                      </span>
                    </Radio>)}

                <Radio value='' key='0'>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

        </div>

      </Form.Item>
      <Subtitle level={4}>
        {intl.$t({ defaultMessage: 'When do you want the update to run?' })}
      </Subtitle>
      {<UI.TitleActive>
        {intl.$t({
          // eslint-disable-next-line max-len
          defaultMessage: '<VenueSingular></VenueSingular>\'s local time-zone is applied to the selection below.'
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
