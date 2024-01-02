import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import { useIntl }                                          from 'react-intl'

import {
  Button,
  Modal
} from '@acx-ui/components'
import {
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel, isBetaFirmware
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

export interface DowngradeDialogProps {
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function DowngradeDialog (props: DowngradeDialogProps) {
  const intl = useIntl()
  const [form] = useForm()
  const { onSubmit, onCancel, data, availableVersions } = props
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [step, setStep] = useState(0)

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
    setStep(3)
    form.validateFields()
      .then(() => {
        onSubmit(createRequest())
      })
  }

  const onModalCancel = () => {
    form.resetFields()
    onCancel()
  }

  const onContinue = () => {
    setStep(1)
  }

  const onNext = () => {
    setStep(2)
  }

  const onBack = () => {
    setStep(1)
  }

  return (
    <Modal
      title={intl.$t({ defaultMessage: 'Firmware Downgrade' })}
      visible={true}
      width={560}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      footer={[
        <Button hidden={step !== 0} key='continue' onClick={onContinue}>
          {intl.$t({ defaultMessage: 'Continue' })}
        </Button>,
        <Button hidden={step !== 1} key='next' type='primary' onClick={onNext}>
          {intl.$t({ defaultMessage: 'Next' })}
        </Button>,
        <Button hidden={step !== 2} key='back' onClick={onBack}>
          {intl.$t({ defaultMessage: 'Back' })}
        </Button>,
        <Button
          hidden={step !== 2}
          key='downgrade'
          type='primary'
          onClick={triggerSubmit}
        >
          {intl.$t({ defaultMessage: 'Downgrade Firmware' })}
        </Button>,
        <Button
          key='cancel'
          onClick={onModalCancel}
        >
          { // eslint-disable-next-line max-len
            step === 3 ? intl.$t({ defaultMessage: 'Close' }) : intl.$t({ defaultMessage: 'Cancel' })}
        </Button>
      ]}
    >
      <Form
        form={form}
        name={'revertModalForm'}
      >
        {step === 0 &&
          <Form.Item>
            <Typography style={{ fontWeight: 700 }}>
              {intl.$t({ defaultMessage: 'Downgrading firmware:' })}
            </Typography>
            <UI.Ul>
              { // eslint-disable-next-line max-len
                <UI.Li>{intl.$t({ defaultMessage: 'Will cause network interruption and may impact service delivery;' })}</UI.Li>}
              { // eslint-disable-next-line max-len
                <UI.Li>{intl.$t({ defaultMessage: 'Newly delivered features may no longer work with older firmware versions;' })}</UI.Li>}
              { // eslint-disable-next-line max-len
                <UI.Li>{intl.$t({ defaultMessage: 'May reduce some functionality.' })}</UI.Li>}
            </UI.Ul>
            <Typography>
              { // eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'Are you sure you want to downgrade the firmware version on devices in selected venue?' })}
            </Typography>
          </Form.Item>
        }
        {step === 1 &&
          <Form.Item>
            <Typography style={{ fontWeight: 700 }}>
              {intl.$t({ defaultMessage: 'Available older firmware versions' })}
            </Typography>
            <Radio.Group
              style={{ margin: 12 }}
              // eslint-disable-next-line max-len
              defaultValue={availableVersions && availableVersions[0] ? availableVersions[0].name : ''}
              onChange={onChangeRegular}
              value={selectedVersion}>
              <Space direction={'vertical'}>
                { availableVersions?.map(v =>
                  <Radio value={v.name} key={v.name}>
                    {getVersionLabel(intl, v, isBetaFirmware(v.category))}
                  </Radio>)
                }
              </Space>
            </Radio.Group>
          </Form.Item>
        }
        {step === 2 &&
          <Form.Item>
            <Typography style={{ fontWeight: 700 }}>
              { // eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'The selected firmware version will be updated on all devices in the venue, except for the device models listed below. Firmware for these models is not supported and won’t be updated during downgrade.' })}
            </Typography>
            <UI.Ul>
              <UI.Li>R650</UI.Li>
              <UI.Li>R770</UI.Li>
            </UI.Ul>
            <Typography>
              { // eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'Are you sure you want to downgrade the firmware version on devices in this venue?' })}
            </Typography>
          </Form.Item>
        }
        {step === 3 &&
          <Form.Item>
            <Typography>
              { // eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'Firmware downgrade started on devices in the selected venue.' })}
            </Typography>
            <Typography>
              { // eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'When completed, the result will be posted in the notification panel.' })}
            </Typography>
          </Form.Item>
        }

      </Form>
    </Modal>
  )
}
