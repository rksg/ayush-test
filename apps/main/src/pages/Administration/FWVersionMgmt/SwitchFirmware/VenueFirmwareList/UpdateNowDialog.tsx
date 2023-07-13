import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import { useIntl }                                          from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getSwitchVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

export interface UpdateNowDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[],
  availableVersions?: FirmwareVersion[]
  nonIcx8200Count: number
  icx8200Count: number
}

export function UpdateNowDialog (props: UpdateNowDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions,
    nonIcx8200Count, icx8200Count } = props
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [selectedAboveTenVersion, setSelectedAboveTenVersion] = useState<string>('')
  const enableSwitchTwoVersionUpgrade = useIsSplitOn(Features.SUPPORT_SWITCH_TWO_VERSION_UPGRADE)
  const [disableSave, setDisableSave] = useState(enableSwitchTwoVersionUpgrade)
  const [selectionChanged, setSelectionChanged] = useState(false)
  const [selectionAboveTenChanged, setSelectionAboveTenChanged] = useState(false)

  // eslint-disable-next-line max-len
  const firmware10AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => v.id.startsWith('100'))
  // eslint-disable-next-line max-len
  const firmware90AvailableVersions = availableVersions?.filter((v: FirmwareVersion) => !v.id.startsWith('100'))

  useEffect(() => {
    if (enableSwitchTwoVersionUpgrade) {
      setDisableSave( !selectionChanged && !selectionAboveTenChanged)
    }
  }, [enableSwitchTwoVersionUpgrade, selectionChanged, selectionAboveTenChanged])

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectionChanged(e.target.value)
    setSelectedVersion(e.target.value)
  }

  const onChangeRegularForVersionAboveTen = (e: RadioChangeEvent) => {
    setSelectionAboveTenChanged(e.target.value)
    setSelectedAboveTenVersion(e.target.value)
  }

  const createRequest = (): UpdateScheduleRequest => {
    if (enableSwitchTwoVersionUpgrade) {
      return {
        // eslint-disable-next-line max-len
        venueIds: data ? (data as FirmwareSwitchVenue[]).map((d: FirmwareSwitchVenue) => d.id) : null,
        switchVersion: selectedVersion,
        switchVersionAboveTen: enableSwitchTwoVersionUpgrade ? selectedAboveTenVersion : ''
      }
    }
    return {
      venueIds: data ? (data as FirmwareSwitchVenue[]).map((d: FirmwareSwitchVenue) => d.id) : null,
      switchVersion: selectedVersion
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
    resetValues()
    onCancel()
  }

  const resetValues = () => {
    setSelectionChanged(false)
    setSelectionAboveTenChanged(false)
    setSelectedVersion('')
    setSelectedAboveTenVersion('')
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Update Now' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Run Update' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <Form
        form={form}
        name={'updateModalForm'}
      >
        <Form.Item>
          {!enableSwitchTwoVersionUpgrade && <Typography>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Choose which version to update the venue to:' })}
          </Typography>}
          {!enableSwitchTwoVersionUpgrade && <Radio.Group
            style={{ margin: 12 }}
            // eslint-disable-next-line max-len
            defaultValue={availableVersions && availableVersions[0] ? availableVersions[0] : ''}
            onChange={onChangeRegular}
            value={selectedVersion}>
            <Space direction={'vertical'}>
              { availableVersions?.map(v =>
                <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
            </Space>
          </Radio.Group>}
          {enableSwitchTwoVersionUpgrade && <Typography>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Firmware available for ICX-8200 Series' })} ({icx8200Count} {$t({ defaultMessage: 'switches' })})
          </Typography>}
          {enableSwitchTwoVersionUpgrade && <Radio.Group
            style={{ margin: 12 }}
            onChange={onChangeRegularForVersionAboveTen}
            value={selectedAboveTenVersion}>
            <Space direction={'vertical'}>
              { firmware10AvailableVersions?.map(v =>
                <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
              <Radio value='' key='0'>
                {$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>}
          {enableSwitchTwoVersionUpgrade && <UI.Section>
            <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Firmware available for ICX 7150/7550/7650/7850 Series Models' })} ({nonIcx8200Count} {$t({ defaultMessage: 'switches' })})
            </Typography>
            <Radio.Group
              style={{ margin: 12 }}
              onChange={onChangeRegular}
              value={selectedVersion}>
              <Space direction={'vertical'}>
                { firmware90AvailableVersions?.map(v =>
                  <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
                <Radio value='' key='0'>
                  {$t({ defaultMessage: 'Do not update firmware on these switches' })}
                </Radio>
              </Space>
            </Radio.Group>
          </UI.Section>}
          <UI.Section>
            <UI.Ul>
              { // eslint-disable-next-line max-len
                <UI.Li>{$t({ defaultMessage: 'Please note that during the firmware update, the switches in this venue will reboot, and your network will be unavailable for customer operation.' })}</UI.Li>}
              { // eslint-disable-next-line max-len
                <UI.Li>{$t({ defaultMessage: 'This action cannot be canceled once initiated.' })}</UI.Li>}
              { // eslint-disable-next-line max-len
                <UI.Li>{$t({ defaultMessage: 'You will be notified once the update process has finished.' })}</UI.Li>}
            </UI.Ul>
          </UI.Section>
        </Form.Item>
      </Form>
    </Modal>
  )
}
