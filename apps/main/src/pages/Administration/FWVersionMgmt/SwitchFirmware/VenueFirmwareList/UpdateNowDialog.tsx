import { useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import { useIntl }                                          from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
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
}

export function UpdateNowDialog (props: UpdateNowDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions } = props
  const [selectedVersion, setSelectedVersion] = useState<string>('')

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
  }

  const createRequest = (): UpdateScheduleRequest => {
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
    onCancel()
  }


  return (
    <Modal
      title={$t({ defaultMessage: 'Update Now' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Run Update' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
    >
      <Form
        form={form}
        name={'updateModalForm'}
      >
        <Form.Item>
          <Typography>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Choose which version to update the venue to:' })}
          </Typography>
          <Radio.Group
            style={{ margin: 12 }}
            // eslint-disable-next-line max-len
            defaultValue={availableVersions && availableVersions[0] ? availableVersions[0] : ''}
            onChange={onChangeRegular}
            value={selectedVersion}>
            <Space direction={'vertical'}>
              { availableVersions?.map(v =>
                <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(intl, v)}</Radio>)}
            </Space>
          </Radio.Group>
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
