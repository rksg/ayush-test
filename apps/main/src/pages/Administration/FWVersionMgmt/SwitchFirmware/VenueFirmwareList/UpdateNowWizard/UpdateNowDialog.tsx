import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import { useForm }                              from 'antd/lib/form/Form'
import { useIntl }                              from 'react-intl'

import {
  Modal, Subtitle, useStepFormContext
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'


import { getSwitchVersionLabel } from '../../../FirmwareUtils'

import * as UI from '../styledComponents'

export interface UpdateNowDialogProps {
  visible: boolean,
  // onCancel: () => void,
  // onSubmit: () => void,
  // data: FirmwareSwitchVenue[],
  availableVersions?: FirmwareVersion[]
  nonIcx8200Count: number
  icx8200Count: number
  hasVenue: boolean
}

export function UpdateNowDialog (props: UpdateNowDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form } = useStepFormContext()
  const { availableVersions,hasVenue,
    nonIcx8200Count, icx8200Count } = props
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const enableSwitchTwoVersionUpgrade = useIsSplitOn(Features.SUPPORT_SWITCH_TWO_VERSION_UPGRADE)
  const [disableSave, setDisableSave] = useState(true)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)

  // eslint-disable-next-line max-len
  const firmware10AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => v.id.startsWith('100'))
  // eslint-disable-next-line max-len
  const firmware90AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => !v.id.startsWith('100'))

  useEffect(() => {
    if (enableSwitchTwoVersionUpgrade) {
      setDisableSave(!selectionChanged && !selectionAboveTenChanged)
    } else {
      setDisableSave(!selectionChanged)
    }
  }, [enableSwitchTwoVersionUpgrade, selectionChanged, selectionAboveTenChanged])

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectionChanged(e.target.value)
    setSelectedVersion(e.target.value)
    form.setFieldValue('switchVersion', e.target.value)
  }

  const onChangeRegularForVersionAboveTen = (e: RadioChangeEvent) => {
    setSelectionAboveTenChanged(e.target.value)
    setSelectedAboveTenVersion(e.target.value)
    form.setFieldValue('switchVersionAboveTen', e.target.value)
  }

  return (
    <div
      style={{
        minHeight: '50vh',
        marginBottom: '30px'
      }}>
      <Form.Item>
        {!enableSwitchTwoVersionUpgrade && <>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Choose which version to update the venue to:' })}
          </Subtitle>
          <Radio.Group
            style={{ margin: 12 }}
            // eslint-disable-next-line max-len
            defaultValue={availableVersions && availableVersions[0] ? availableVersions[0] : ''}
            onChange={onChangeRegular}
            value={selectedVersion}>
            <Space direction={'vertical'}>
              {availableVersions?.map(v =>
                <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
            </Space>
          </Radio.Group>
        </>
        }
        {enableSwitchTwoVersionUpgrade && <>
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
                onChange={onChangeRegular}
                value={selectedVersion}>
                <Space direction={'vertical'}>
                  {firmware90AvailableVersions?.map(v =>
                    <Radio value={v.id} key={v.id} disabled={v.inUse}>
                      {getSwitchVersionLabel(intl, v)}</Radio>)}
                  <Radio value='' key='0'>
                    {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </UI.Section>}
        </>}

        <UI.Section>
          <UI.Ul>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Please note that during the firmware update, the switches in this venue will reboot, and your network will be unavailable for customer operation.' })}
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
