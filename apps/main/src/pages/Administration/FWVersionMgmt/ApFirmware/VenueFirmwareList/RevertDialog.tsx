import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import { useIntl }                                          from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import {
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

export interface RevertDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function RevertDialog (props: RevertDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data, availableVersions } = props
  // eslint-disable-next-line max-len
  const [selectedVersion, setSelectedVersion] = useState<string>('')

  useEffect(() => {
    if (availableVersions && availableVersions[0]) {
      setSelectedVersion(availableVersions[0].name)
    }
  }, [availableVersions])

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
  }

  const createRequest = (): UpdateNowRequest[] => {
    const venuesData = data as FirmwareVenue[]
    const request = [{
      firmwareCategoryId: 'active',
      firmwareVersion: selectedVersion,
      venueIds: venuesData.map(venue => venue.id)
    }]
    return request
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
      title={$t({ defaultMessage: 'Revert Now' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Run Revert' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
    >
      <Form
        form={form}
        name={'revertModalForm'}
      >
        <Form.Item>
          <Typography style={{ fontWeight: 700 }}>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Are you sure you wish to revert to previous firmware version?' })}
          </Typography>
          <Typography style={{ fontWeight: 700 }}>
            {$t({ defaultMessage: 'Select one previous version:' })}
          </Typography>
          <Radio.Group
            style={{ margin: 12 }}
            // eslint-disable-next-line max-len
            defaultValue={availableVersions && availableVersions[0] ? availableVersions[0].name : ''}
            onChange={onChangeRegular}
            value={selectedVersion}>
            <Space direction={'vertical'}>
              { availableVersions?.map(v =>
                <Radio value={v.name} key={v.name}>{getVersionLabel(intl, v)}</Radio>)}
            </Space>
          </Radio.Group>
          <UI.Section>
            <UI.Ul>
              { // eslint-disable-next-line max-len
                <UI.Li>{$t({ defaultMessage: 'This action will cause network interruption and impact service delivery.' })}</UI.Li>}
              { // eslint-disable-next-line max-len
                <UI.Li>{$t({ defaultMessage: 'Some features may no longer be availabe with previous versions of device firmware.' })}</UI.Li>}
            </UI.Ul>
          </UI.Section>
        </Form.Item>
      </Form>
    </Modal>
  )
}
