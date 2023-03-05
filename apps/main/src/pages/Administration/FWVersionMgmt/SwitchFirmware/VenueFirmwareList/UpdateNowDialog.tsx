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
                <Radio value={v.id} key={v.id}>{getSwitchVersionLabel(v)}</Radio>)}
            </Space>
          </Radio.Group>
          <UI.Section>
            <UI.Ul>
              { // eslint-disable-next-line max-len
                <UI.Li>Please note, during firmware update your network device(s) will reboot, and service may be interrupted for up to 15 minutes.</UI.Li>}
              <UI.Li>You will be notified once the update process has finished.</UI.Li>
            </UI.Ul>
          </UI.Section>
        </Form.Item>
      </Form>
    </Modal>
  )
}
