import { useEffect, useState } from 'react'


import { Button, Form, Radio, RadioChangeEvent, Space } from 'antd'
import _ from 'lodash'
import { useIntl } from 'react-intl'

import {
  Subtitle,
  useStepFormContext
} from '@acx-ui/components'
import { useSwitchFirmwareUtils } from '@acx-ui/rc/components'
import {
  compareSwitchVersion,
  SwitchFirmwareVersion1002,
  SwitchFirmwareModelGroup,
  FirmwareSwitchVenueV1002,
  SwitchFirmware
} from '@acx-ui/rc/utils'

import { DowngradeTag } from '../../../styledComponents'
import * as UI from '../../styledComponents'
import { Switch7150C08Note } from '../Switch7150C08Note'

export interface UpdateNowStepProps {
  visible: boolean,
  availableVersions: SwitchFirmwareVersion1002[]
  hasVenue: boolean,
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmware[],
  setShowSubTitle: (visible: boolean) => void
}

export function UpdateNowStep(props: UpdateNowStepProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { availableVersions, hasVenue, setShowSubTitle,
    upgradeVenueList, upgradeSwitchList } = props
  const { getSwitchVersionLabelV1002 } = useSwitchFirmwareUtils()

  const [selectedICX71Version, setSelecteedICX71Version] = useState('')
  const [selectedICX7XVersion, setSelecteedICX7XVersion] = useState('')
  const [selectedICX82Version, setSelecteedICX82Version] = useState('')

  const ICX71Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.switchCount || 0
  const ICX7XCount = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0]?.switchCount || 0
  const ICX82Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0]?.switchCount || 0


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
        return firmwareAvailableVersions[0].versions.sort((a, b) => compareSwitchVersion(a.id, b.id))
      }

      return []
    }

  useEffect(() => {
    setShowSubTitle(false)
  }, [current])

  const scrollToTarget = () => {
    const targetElement = document.getElementById('target');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            style={{ margin: 12 }}
            onChange={handleICX82Change}
            value={selectedICX82Version}>
            <Space direction={'vertical'}>
              { // eslint-disable-next-line max-len
                getAvailableVersions(SwitchFirmwareModelGroup.ICX82)?.map(v =>
                  <Radio value={v.id} key={v.id} disabled={v.inUse}>
                    <span style={{ lineHeight: '22px' }}>
                      {getSwitchVersionLabelV1002(intl, v)}
                      {(v.isDowngradeVersion || v.isDowngraded10to90) && !v.inUse &&
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
                      {getSwitchVersionLabelV1002(intl, v)}
                      {(v.isDowngradeVersion || v.isDowngraded10to90) && !v.inUse &&
                        <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                    </span>
                  </Radio>)}

              <Radio value='' key='0'>
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
            style={{ margin: 12 }}
            onChange={handleICX71Change}
            value={selectedICX71Version}>
            <Space direction={'vertical'}>
              { // eslint-disable-next-line max-len
                getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.map(v =>
                  <Radio value={v.id} key={v.id} disabled={v.inUse}>
                    <span style={{ lineHeight: '22px' }}>
                      {getSwitchVersionLabelV1002(intl, v)}
                      {v.id.startsWith('090') && <Button
                        size='small'
                        color='blue'
                        ghost={true}
                        onClick={scrollToTarget}>
                        {$t({ defaultMessage: '[1]' })}
                      </Button>}
                      {(v.isDowngradeVersion || v.isDowngraded10to90) && !v.inUse &&
                        <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                    </span>
                  </Radio>)}

              <Radio value='' key='0'>
                {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>
          <div id="target">
            <Switch7150C08Note
              upgradeVenueList={upgradeVenueList}
              upgradeSwitchList={upgradeSwitchList}
            /> </div>
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
