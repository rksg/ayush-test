/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'


import { Form, Radio, RadioChangeEvent, Space, Tag } from 'antd'
import _                                             from 'lodash'
import { useIntl }                                   from 'react-intl'

import {
  Button,
  Subtitle, useStepFormContext
} from '@acx-ui/components'
import { useSwitchFirmwareUtils } from '@acx-ui/rc/components'
import {
  compareSwitchVersion,
  FirmwareVersion
} from '@acx-ui/rc/utils'

import { DowngradeTag } from '../../../styledComponents'
import * as UI          from '../../styledComponents'

export interface UpdateNowStepProps {
  visible: boolean,
  availableVersions?: FirmwareVersion[]
  nonIcx8200Count: number
  icx8200Count: number
  hasVenue: boolean,
  setShowSubTitle: (visible: boolean) => void
}

export function UpdateNowStep (props: UpdateNowStepProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { availableVersions,hasVenue,
    nonIcx8200Count, icx8200Count, setShowSubTitle } = props
  const { getSwitchVersionLabel } = useSwitchFirmwareUtils()
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const [disableSave, setDisableSave] = useState(true)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)

  const firmware10AvailableVersions =
    availableVersions?.filter((v: FirmwareVersion) => v.id.startsWith('100'))
      .sort((a, b) => compareSwitchVersion(a.id, b.id))
  const firmware90AvailableVersions =
    availableVersions?.filter((v: FirmwareVersion) => !v.id.startsWith('100'))
      .sort((a, b) => compareSwitchVersion(a.id, b.id))

  useEffect(()=>{
    setShowSubTitle(false)
  }, [current])

  useEffect(() => {
    setDisableSave(!selectionChanged && !selectionAboveTenChanged)
  }, [selectionChanged, selectionAboveTenChanged])

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectionChanged(e.target.value)
    setSelectedVersion(e.target.value)
    form.setFieldValue('switchVersion', e.target.value)
    form.validateFields()
  }

  const onChangeRegularForVersionAboveTen = (e: RadioChangeEvent) => {
    setSelectionAboveTenChanged(e.target.value)
    setSelectedAboveTenVersion(e.target.value)
    form.setFieldValue('switchVersionAboveTen', e.target.value)
    form.validateFields()
  }

  return (
    <div
      data-testid='update-now-step'
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
                const switchVersionAboveTen = form.getFieldValue('switchVersionAboveTen')
                const switchVersion = form.getFieldValue('switchVersion')
                if (_.isEmpty(switchVersionAboveTen) && _.isEmpty(switchVersion)) {
                  return Promise.reject('Please select at least 1 firmware version')
                }

                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={<> </>}
        />
        { (hasVenue || icx8200Count > 0) && <>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
              &nbsp;
              ({icx8200Count} {$t({ defaultMessage: 'switches' })})
          </Subtitle>

          <Radio.Group
            style={{ margin: 12 }}
            onChange={onChangeRegularForVersionAboveTen}
            value={selectedAboveTenVersion}>
            <Space direction={'vertical'}>
              {firmware10AvailableVersions?.map(v =>
                <Radio value={v.id} key={v.id} disabled={v.inUse}>
                  <span style={{ lineHeight: '22px' }}>
                    {getSwitchVersionLabel(intl, v)}
                    {v.isDowngradeVersion && !v.inUse &&
                      <DowngradeTag>{$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                  </span>
                </Radio>)}
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
                onChange={onChangeRegular}
                value={selectedVersion}>
                <Space direction={'vertical'}>
                  {firmware90AvailableVersions?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      <span style={{ lineHeight: '22px' }}>
                        {getSwitchVersionLabel(intl, v)}
                        {v.isDowngradeVersion && !v.inUse &&
                          <DowngradeTag>{$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
                      </span>
                    </Radio>)}
                  <Radio value='' key='0'>
                    {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>}

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
