import { useContext, useEffect, useState } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'

import { StepsForm, FormValidationItem } from '@acx-ui/components'
import { useNetworkListQuery }           from '@acx-ui/rc/services'
import { NetworkTypeEnum }               from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

import { NetworkTypeDescription, NetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                           from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                           from '../NetworkFormContext'
import { RadioDescription }                         from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm (props: any) {
  const type = useWatch<string>('type')
  const { setNetworkType: setSettingStepTitle } = useContext(NetworkFormContext)
  const onChange = (e: RadioChangeEvent) => {
    setSettingStepTitle(e.target.value as NetworkTypeEnum)
  }
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
          <Radio.Group onChange={onChange}>
            <Space direction='vertical'>
              <Radio value={NetworkTypeEnum.PSK} disabled>
                {NetworkTypeLabel.psk}
                <RadioDescription>
                  {NetworkTypeDescription.psk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.DPSK}>
                {NetworkTypeLabel.dpsk}
                <RadioDescription>
                  {NetworkTypeDescription.dpsk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.AAA}>
                {NetworkTypeLabel.aaa}
                <RadioDescription>
                  {NetworkTypeDescription.aaa}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.CAPTIVEPORTAL} disabled>
                {NetworkTypeLabel.guest}
                <RadioDescription>
                  {NetworkTypeDescription.guest}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.OPEN}>
                {NetworkTypeLabel.open}
                <RadioDescription>
                  {NetworkTypeDescription.open}
                </RadioDescription>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram type={type}/>
      </Col>
    </Row>
  )
}
