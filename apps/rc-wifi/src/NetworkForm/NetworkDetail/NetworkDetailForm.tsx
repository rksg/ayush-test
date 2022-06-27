import { useEffect, useState } from 'react'

import { Form, Col, Radio, Row, Space } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'

import { StepsForm, FormValidationItem } from '@acx-ui/components'
import { useNetworkListQuery }           from '@acx-ui/rc/services'
import { NetworkTypeEnum }               from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

import { NetworkDiagram }   from '../NetworkDiagram/NetworkDiagram'
import { RadioDescription } from '../styledComponents'

enum NetworkTypeDescription {
  PSK = 'Require users to enter a passphrase (that you have defined for the network) to connect',
  DPSK = 'Require users to enter a passphrase to connect. The passphrase is unique per device',
  AAA = `Use 802.1X standard and WPA2 security protocols to authenticate users using an
         authentication server on thenetwork`,
  CAPTIVEPORTAL = 'Users are authorized through a captive portal in various methods',
  OPEN = `Allow users to access the network without any authentication/security
          (not recommended)`,
}

enum NetworkTypeLabel {
  PSK = 'Pre-Shared Key (PSK)',
  DPSK = 'Dynamic Pre-Shared Key (DPSK)',
  AAA = 'Enterprise AAA (802.1X)',
  CAPTIVEPORTAL = 'Captive portal',
  OPEN = 'Open Network',
}

export function NetworkDetailForm (props: any) {
  const payload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [defaultPayload, setDefaultPayload] = useState(payload)
  const networkListQuery = useNetworkListQuery({
    params: useParams(),
    payload: defaultPayload
  })
  useEffect(() => {
    const triggerValidation = !networkListQuery.isFetching && defaultPayload.searchString
    if (triggerValidation) {
      props.formRef.current.validateFields(['name'])
    }
  }, [networkListQuery])

  const remoteValidation = {
    listQuery: networkListQuery,
    payload: defaultPayload,
    message: 'A Network with that name already exists',
    updateQuery: (value: string) => {
      const payload = {
        ...defaultPayload,
        searchString: value
      }
      setDefaultPayload(payload)
    }
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Network Details</StepsForm.Title>
        <FormValidationItem
          name='name'
          label='Network Name'
          rules={[{ required: true }, { min: 2 }, { max: 32 }]}
          remoteValidation={remoteValidation}
        />
        <Form.Item
          name='description'
          label='Description'
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item
          name='type'
          label='Network Type'
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={NetworkTypeEnum.PSK} disabled>
                {NetworkTypeLabel.PSK}
                <RadioDescription>
                  {NetworkTypeDescription.PSK}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.DPSK} disabled>
                {NetworkTypeLabel.DPSK}
                <RadioDescription>
                  {NetworkTypeDescription.DPSK}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.AAA}>
                {NetworkTypeLabel.AAA}
                <RadioDescription>
                  {NetworkTypeDescription.AAA}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.CAPTIVEPORTAL} disabled>
                {NetworkTypeLabel.CAPTIVEPORTAL}
                <RadioDescription>
                  {NetworkTypeDescription.CAPTIVEPORTAL}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.OPEN} disabled>
                {NetworkTypeLabel.OPEN}
                <RadioDescription>
                  {NetworkTypeDescription.OPEN}
                </RadioDescription>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}
