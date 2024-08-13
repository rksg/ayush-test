import { useEffect, useState } from 'react'


import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import _                                        from 'lodash'
import { useIntl }                              from 'react-intl'

import {
  Subtitle,
  useStepFormContext
} from '@acx-ui/components'
import { useSwitchFirmwareUtils }             from '@acx-ui/rc/components'
import { useGetSwitchFirmwareListV1002Query } from '@acx-ui/rc/services'
import {
  compareSwitchVersion,
  SwitchFirmwareVersion1002,
  SwitchFirmwareModelGroup,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002
} from '@acx-ui/rc/utils'

import * as UI               from '../../styledComponents'
import { NoteButton }        from '../../styledComponents'
import { Switch7150C08Note } from '../Switch7150C08Note'

export interface UpdateNowStepProps {
  visible: boolean,
  availableVersions: SwitchFirmwareVersion1002[]
  hasVenue: boolean,
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmwareV1002[],
  setShowSubTitle: (visible: boolean) => void
}

export function UpdateNowStep (props: UpdateNowStepProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { availableVersions, hasVenue, setShowSubTitle,
    upgradeVenueList, upgradeSwitchList } = props
  const { getSwitchVersionLabelV1002,
    parseSwitchVersion,
    getSwitchVersionTagV1002 } = useSwitchFirmwareUtils()

  const [selectedICX71Version, setSelecteedICX71Version] = useState('')
  const [selectedICX7XVersion, setSelecteedICX7XVersion] = useState('')
  const [selectedICX82Version, setSelecteedICX82Version] = useState('')

  const ICX71Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.switchCount || 0
  const ICX7XCount = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0]?.switchCount || 0
  const ICX82Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0]?.switchCount || 0

  const [icx7150C08pGroupedData, setIcx7150C08pGroupedData] =
    useState([] as SwitchFirmwareV1002[][])

  const { data: getSwitchFirmwareList } = useGetSwitchFirmwareListV1002Query({
    payload: {
      venueIdList: upgradeVenueList.map(item => item.venueId),
      searchFilter: 'ICX7150-C08P',
      searchTargetFields: ['model']
    }
  }, { skip: upgradeVenueList.length === 0 })

  useEffect(() => {
    const upgradeSwitchListOfIcx7150C08p = upgradeSwitchList.filter(s =>
      s.model === 'ICX7150-C08P' || s.model === 'ICX7150-C08')
    if (upgradeVenueList.length === 0 || getSwitchFirmwareList?.data) {
      const switchList = upgradeSwitchListOfIcx7150C08p.concat(getSwitchFirmwareList?.data || [])
      const groupedObject = _.groupBy(switchList, 'venueId')
      setIcx7150C08pGroupedData(Object.values(groupedObject))
    }
  }, [getSwitchFirmwareList])


  const handleICX71Change = (value: RadioChangeEvent) => {
    setSelecteedICX71Version(value.target.value)
    form.setFieldValue('selectedICX71Version', value.target.value)
    form.validateFields()
  }
  const handleICX7XChange = (value: RadioChangeEvent) => {
    setSelecteedICX7XVersion(value.target.value)
    form.setFieldValue('selectedICX7XVersion', value.target.value)
    form.validateFields()
  }
  const handleICX82Change = (value: RadioChangeEvent) => {
    setSelecteedICX82Version(value.target.value)
    form.setFieldValue('selectedICX82Version', value.target.value)
    form.validateFields()
  }

  const getAvailableVersions =
    (modelGroup: SwitchFirmwareModelGroup) => {
      let firmwareAvailableVersions = availableVersions?.filter(
        (v: SwitchFirmwareVersion1002) => v.modelGroup === modelGroup
      )

      if (_.isArray(firmwareAvailableVersions) && firmwareAvailableVersions.length > 0) {
        return firmwareAvailableVersions[0].versions.sort((a, b) =>
          compareSwitchVersion(a.id, b.id))
      }

      return []
    }

  const icx71hasVersionStartingWith100 =
    getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.some(v => v.id.startsWith('100'))

  useEffect(() => {
    setShowSubTitle(false)
  }, [current])

  const scrollToTarget = () => {
    const targetElement = document.getElementById('note_1')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      data-testid='update-now-step'
      id='update-now-step'
      style={{
        minHeight: '50vh',
        marginBottom: '30px'
      }}>
      <Form.Item>
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
                  return Promise.reject('Please select at least 1 firmware version')
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
            style={{ margin: '5px 0 40px 0', fontSize: '14px' }}
            onChange={handleICX82Change}
            value={selectedICX82Version}>
            <Space direction={'vertical'}>
              { getAvailableVersions(SwitchFirmwareModelGroup.ICX82)?.map(v =>
                <Radio value={v.id} key={v.id} disabled={v.inUse}>
                  <span style={{ lineHeight: '20px', fontSize: 'var(--acx-body-3-font-size)' }}>
                    <span style={{ marginRight: '5px' }}>
                      {parseSwitchVersion(v?.name)}
                    </span>
                    {getSwitchVersionTagV1002(intl, v)}
                    <br />
                    <div style={{
                      marginTop: '5px',
                      fontSize: 'var(--acx-body-4-font-size)',
                      color: v.inUse ? 'inherit' : 'var(--acx-neutrals-60)'
                    }}>
                      {getSwitchVersionLabelV1002(intl, v)}
                    </div>
                  </span>
                </Radio>) }
              <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
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
            style={{ margin: '5px 0 40px 0', fontSize: '14px' }}
            onChange={handleICX7XChange}
            value={selectedICX7XVersion}>
            <Space direction={'vertical'}>
              {getAvailableVersions(SwitchFirmwareModelGroup.ICX7X)?.map(v =>
                <Radio value={v.id} key={v.id} disabled={v.inUse}>
                  <span style={{ lineHeight: '20px', fontSize: 'var(--acx-body-3-font-size)' }}>
                    <span style={{ marginRight: '5px' }}>
                      {parseSwitchVersion(v?.name)}
                    </span>
                    {getSwitchVersionTagV1002(intl, v)}
                    <br/>
                    <div style={{
                      marginTop: '5px',
                      fontSize: 'var(--acx-body-4-font-size)',
                      color: v.inUse ? 'inherit' : 'var(--acx-neutrals-60)'
                    }}>
                      {getSwitchVersionLabelV1002(intl, v)}
                    </div>
                  </span>
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
            style={{ margin: '5px 0 20px 0', fontSize: '14px' }}
            onChange={handleICX71Change}
            value={selectedICX71Version}>
            <Space direction={'vertical'}>
              { // eslint-disable-next-line max-len
                getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.map(v =>
                  <Radio value={v.id} key={v.id} disabled={v.inUse}>
                    <span style={{ lineHeight: '20px', fontSize: 'var(--acx-body-3-font-size)' }}>
                      <span style={{ marginRight: '5px' }}>
                        {parseSwitchVersion(v?.name)}
                      </span>
                      {icx7150C08pGroupedData.length > 0 && v.id.startsWith('100') &&
                          <NoteButton
                            size='small'
                            ghost={true}
                            onClick={scrollToTarget} >
                            {'[1]'}
                          </NoteButton>}
                      {getSwitchVersionTagV1002(intl, v)}
                      <br />
                      <div style={{
                        marginTop: '5px',
                        fontSize: 'var(--acx-body-4-font-size)',
                        color: v.inUse ? 'inherit' : 'var(--acx-neutrals-60)'
                      }}>
                        {getSwitchVersionLabelV1002(intl, v)}
                      </div>
                    </span>
                  </Radio>)}
              <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>
          {icx7150C08pGroupedData.length > 0 && icx71hasVersionStartingWith100 &&
            <div id='note_1'>
              <Switch7150C08Note icx7150C08pGroupedData={icx7150C08pGroupedData} />
            </div>}
        </>}

        <UI.Section>
          <UI.Ul>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Please note that during the firmware update, the switches in this <venueSingular></venueSingular> will reboot, and your network will be unavailable for customer operation.' })}
              </label>
            </li>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'This action cannot be canceled once initiated.' })}
              </label>
            </li>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'You will be notified once the update process has finished.' })}
              </label>
            </li>
          </UI.Ul>
        </UI.Section>
      </Form.Item>
    </div>
  )
}
