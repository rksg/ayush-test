import { useEffect, useState } from 'react'

import { DatePicker, Form, Radio, RadioChangeEvent, Space } from 'antd'
import dayjs                                                from 'dayjs'
import _                                                    from 'lodash'
import { useIntl }                                          from 'react-intl'

import { Subtitle, useStepFormContext }            from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { useSwitchFirmwareUtils }                  from '@acx-ui/rc/components'
import { useBatchGetSwitchFirmwareListV1001Query } from '@acx-ui/rc/services'
import {
  AVAILABLE_SLOTS,
  compareSwitchVersion,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareVersion1002,
  SwitchFirmwareModelGroup,
  getSwitchModelGroup,
  SwitchFirmwareV1002,
  invalidVersionFor82Av,
  invalidVersionFor81X,
  isRodanAv,
  isBabyRodanX
} from '@acx-ui/rc/utils'

import * as UI                   from '../../styledComponents'
import { NotesEnum, SwitchNote } from '../SwitchNote'

import { PreDownload } from './PreDownload'

import type { DatePickerProps }  from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'

export interface ScheduleStepProps {
  visible: boolean,
  availableVersions?: SwitchFirmwareVersion1002[]
  hasVenue: boolean,
  data: FirmwareSwitchVenueV1002[],
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmwareV1002[],
  setShowSubTitle: (visible: boolean) => void
}

export function ScheduleStep (props: ScheduleStepProps) {
  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)
  const isSupport81Or81X = isSupport8100 || isSupport8100X
  const { availableVersions,
    hasVenue, upgradeVenueList, upgradeSwitchList,
    setShowSubTitle } = props

  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { getVersionOptionV1002 } = useSwitchFirmwareUtils()

  const getCurrentSchedule = function () {
    if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
      if (upgradeVenueList.length === 1) {
        const nextScheduleModelGroup =
          upgradeVenueList[0].nextSchedule?.supportModelGroupVersions || []
        return {
          [SwitchFirmwareModelGroup.ICX71]: nextScheduleModelGroup.filter(
            v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.version || '',
          [SwitchFirmwareModelGroup.ICX7X]: nextScheduleModelGroup.filter(
            v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0]?.version || '',
          [SwitchFirmwareModelGroup.ICX81]: nextScheduleModelGroup.filter(
            v => v.modelGroup === SwitchFirmwareModelGroup.ICX81)[0]?.version || '',
          [SwitchFirmwareModelGroup.ICX82]: nextScheduleModelGroup.filter(
            v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0]?.version || ''
        }
      } else {
        const modelGroup = getSwitchModelGroup(upgradeSwitchList[0].model)
        return {
          [modelGroup]: upgradeSwitchList[0].switchNextSchedule?.version || ''
        }
      }
    }
    return {}
  }
  const currentSchedule = getCurrentSchedule()

  const [selectedICX71Version, setSelecteedICX71Version] = useState(
    currentSchedule[SwitchFirmwareModelGroup.ICX71] || '')
  const [selectedICX7XVersion, setSelecteedICX7XVersion] = useState(
    currentSchedule[SwitchFirmwareModelGroup.ICX7X] || '')
  const [selectedICX81Version, setSelecteedICX81Version] = useState(
    currentSchedule[SwitchFirmwareModelGroup.ICX81] || '')
  const [selectedICX82Version, setSelecteedICX82Version] = useState(
    currentSchedule[SwitchFirmwareModelGroup.ICX82] || '')

  const ICX71Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.switchCount || 0
  const ICX7XCount = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0]?.switchCount || 0
  const ICX81Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX81)[0]?.switchCount || 0
  const ICX82Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0]?.switchCount || 0

  const [switch82AvNoteEnable, setSwitch82AvNoteEnable] = useState(false)
  const [switch81XNoteEnable, setSwitch81XNoteEnable] = useState(false)

  const payload = {
    venueIdList: upgradeVenueList.map(item => item.venueId),
    searchTargetFields: ['model']
  }

  const { data: getSwitchFirmwareList } = useBatchGetSwitchFirmwareListV1001Query(
    [{ payload: {
      ...payload,
      searchFilter: 'ICX8200-24PV'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8200-C08PFV'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8100-24-X'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8100-24P-X'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8100-48-X'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8100-48P-X'
    } },
    { payload: {
      ...payload,
      searchFilter: 'ICX8100-C08PF-X'
    } } ]
    , { skip: upgradeVenueList.length === 0 })

  const icxRodanAvGroupedData = (): SwitchFirmwareV1002[][] => {
    const upgradeSwitchListOfRodanAv = upgradeSwitchList.filter(s => isRodanAv(s.model))
    const switch82AvFirmwareList = getSwitchFirmwareList?.data.filter(s => isRodanAv(s.model))
    if (upgradeVenueList.length === 0 || switch82AvFirmwareList) {
      const switchList = upgradeSwitchListOfRodanAv.concat(switch82AvFirmwareList || [])
      const groupedObject = _.groupBy(switchList, 'venueId')
      return Object.values(groupedObject)
    } else {
      return []
    }
  }

  const icxBabyRodanXGroupedData = (): SwitchFirmwareV1002[][] => {
    const upgradeSwitchListOfBabyRodanX = upgradeSwitchList.filter(s => isBabyRodanX(s.model))
    const switch81XFirmwareList = getSwitchFirmwareList?.data.filter(s => isBabyRodanX(s.model))
    if (upgradeVenueList.length === 0 || switch81XFirmwareList) {
      const switchList = upgradeSwitchListOfBabyRodanX.concat(switch81XFirmwareList || [])
      const groupedObject = _.groupBy(switchList, 'venueId')
      return Object.values(groupedObject)
    } else {
      return []
    }
  }

  const exist82AvAndInvalidVersion = (version: string): boolean => {
    return invalidVersionFor82Av(version) && icxRodanAvGroupedData().length > 0
  }

  const exist81XAndInvalidVersion = (version: string): boolean => {
    return invalidVersionFor81X(version) && icxBabyRodanXGroupedData().length > 0
  }

  const updateSwitch82AvNoteEnable = (version: string) => {
    setSwitch82AvNoteEnable(exist82AvAndInvalidVersion(version))
  }

  const updateSwitch81XNoteEnable = (version: string) => {
    setSwitch81XNoteEnable(exist81XAndInvalidVersion(version))
  }

  const setVersionFieldValue = function () {
    form.setFieldValue('selectedICX71Version', selectedICX71Version)
    form.setFieldValue('selectedICX7XVersion', selectedICX7XVersion)
    form.setFieldValue('selectedICX81Version', selectedICX81Version)
    form.setFieldValue('selectedICX82Version', selectedICX82Version)
  }

  useEffect(() => {
    setShowSubTitle(false)

    setVersionFieldValue()
    // NotesEnum.NOTE8200_1
    if (isSupport8200AV) {
      updateSwitch82AvNoteEnable(form.getFieldValue('selectedICX82Version'))
    }
    if (isSupport8100X) {
      updateSwitch81XNoteEnable(form.getFieldValue('selectedICX81Version'))
    }
  }, [current])

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
  const handleICX81Change = (value: RadioChangeEvent) => {
    setSelecteedICX81Version(value.target.value)
    form.setFieldValue('selectedICX81Version', value.target.value)
    form.validateFields(['selectVersionStep'])
    if (isSupport8100X) {
      updateSwitch81XNoteEnable(value.target.value)
    }
  }
  const handleICX82Change = (value: RadioChangeEvent) => {
    setSelecteedICX82Version(value.target.value)
    form.setFieldValue('selectedICX82Version', value.target.value)
    form.validateFields(['selectVersionStep'])
    if (isSupport8200AV) {
      updateSwitch82AvNoteEnable(value.target.value)
    }
  }

  const [hasSelectedDate, setHasSelectedDate] = useState<boolean>(false)
  const getCurrentChecked = function () {
    if (upgradeVenueList.length + upgradeSwitchList.length === 1) {
      return upgradeVenueList.length === 1 ?
        upgradeVenueList[0].preDownload : upgradeSwitchList[0].preDownload
    } return false
  }

  const [checked, setChecked] = useState(getCurrentChecked())

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
    (modelGroup: SwitchFirmwareModelGroup) => {
      let firmwareAvailableVersions = availableVersions?.filter(
        (v: SwitchFirmwareVersion1002) => v.modelGroup === modelGroup
      )

      if (_.isArray(firmwareAvailableVersions) && firmwareAvailableVersions.length > 0) {
        return firmwareAvailableVersions[0].versions
          .filter(v => v.id !== '10010f_rc537') //ACX-79104: Firmware 10.0.10f has security issues. UI workaround to hide the option.
          .sort((a, b) =>
            compareSwitchVersion(a.id, b.id))
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
                    form.getFieldValue('selectedICX7XVersion'),
                    form.getFieldValue('selectedICX81Version')
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
          {(hasVenue || ICX82Count > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
              &nbsp;
              ({ICX82Count} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{
                margin: (isSupport8200AV && switch82AvNoteEnable) ? '5px 0 12px 0' : '5px 0 40px 0',
                fontSize: 'var(--acx-body-3-font-size)'
              }}
              onChange={handleICX82Change}
              value={selectedICX82Version}>
              <Space direction={'vertical'}>
                {
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX82)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      {getVersionOptionV1002(intl, v,
                        (isSupport8200AV && exist82AvAndInvalidVersion(v.id) ? ' *' : null))}
                    </Radio>)
                }
                <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

          {isSupport8200AV && switch82AvNoteEnable && <SwitchNote
            type={NotesEnum.NOTE8200_1}
            data={icxRodanAvGroupedData()} />}

          { isSupport81Or81X && (hasVenue || ICX81Count > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 8100 Series' })}
              &nbsp;
              ({ICX81Count} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{
                margin: (isSupport8100X && switch81XNoteEnable) ? '5px 0 12px 0' : '5px 0 40px 0',
                fontSize: 'var(--acx-body-3-font-size)'
              }}
              onChange={handleICX81Change}
              value={selectedICX81Version}>
              <Space direction={'vertical'}>
                {
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX81)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      {getVersionOptionV1002(intl, v,
                        (isSupport8100X && exist81XAndInvalidVersion(v.id) ? ' *' : null))}
                    </Radio>)}
                <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

          {isSupport8100X && switch81XNoteEnable && <SwitchNote
            type={NotesEnum.NOTE8100_1}
            data={icxBabyRodanXGroupedData()} />}

          {(hasVenue || ICX7XCount > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 7550-7850 Series' })}
              &nbsp;
              ({ICX7XCount} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: '5px 0 40px 0', fontSize: 'var(--acx-body-3-font-size)' }}
              onChange={handleICX7XChange}
              value={selectedICX7XVersion}>
              <Space direction={'vertical'}>
                {getAvailableVersions(SwitchFirmwareModelGroup.ICX7X)?.map(v =>
                  <Radio value={v.id} key={v.id} disabled={v.inUse}>
                    {getVersionOptionV1002(intl, v)}
                  </Radio>)}
                <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                  {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </>}

          {(hasVenue || ICX71Count > 0) && <>
            <Subtitle level={4}>
              {intl.$t({ defaultMessage: 'Firmware available for ICX 7150 Series' })}
              &nbsp;
              ({ICX71Count} {intl.$t({ defaultMessage: 'switches' })})
            </Subtitle>
            <Radio.Group
              style={{ margin: '5px 0 20px 0', fontSize: 'var(--acx-body-3-font-size)' }}
              onChange={handleICX71Change}
              value={selectedICX71Version}>
              <Space direction={'vertical'}>
                {
                  getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      {getVersionOptionV1002(intl, v)}
                    </Radio>)}
                <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
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
