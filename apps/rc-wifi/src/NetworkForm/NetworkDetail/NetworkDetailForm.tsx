import { useContext, useEffect, useState } from 'react'

import { Form, Col, Radio, Row, Space } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'

import { StepsForm, StepsFormProps, FormValidationItem } from '@acx-ui/components'
import { useNetworkListQuery, Network }                  from '@acx-ui/rc/services'
import { NetworkTypeEnum, checkObjectNotExists }         from '@acx-ui/rc/utils'
import { useParams }                                     from '@acx-ui/react-router-dom'

import { NetworkTypeDescription, NetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                           from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                           from '../NetworkFormContext'
import { RadioDescription }                         from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm (props: { formRef: StepsFormProps['formRef'] }) {
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
  const [validating, setValidating] = useState(false)
  const [remoteQueryResult, setRemoteQueryResult] = useState<Network[]>([])
  const networkListQuery = useNetworkListQuery({
    params: useParams(),
    payload: defaultPayload
  })

  useEffect(() => {
    const triggerValidation = !networkListQuery.isFetching && defaultPayload.searchString
    if (triggerValidation) {
      const result: Network[] = networkListQuery?.data?.data || []
      setValidating(false)
      setRemoteQueryResult(result)
      props.formRef?.current?.validateFields(['name'])
    }
  }, [networkListQuery, validating])

  const remoteValidation = {
    queryResult: remoteQueryResult,
    message: 'A Network with that name already exists',
    isValidating: validating,
    validator: checkObjectNotExists,
    updateQuery: (value: string) => {
      const payload = {
        ...defaultPayload,
        searchString: value
      }
      setValidating(true)
      setDefaultPayload(payload)
    }
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Network Details</StepsForm.Title>
        <FormValidationItem<Pick<Network, 'name'>>
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
