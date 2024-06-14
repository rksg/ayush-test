import  { ReactNode } from 'react'

import { Form, Radio, Space, Col, Row, RadioProps } from 'antd'
import { NamePath }                                 from 'antd/es/form/interface'
import { defineMessage, useIntl }                   from 'react-intl'

import {
  useStepFormContext
} from '@acx-ui/components'

import { TradeOffWrapper, HeaderWrapper, RowWrapper, DividerWrapper } from './styledComponents'

const defaultTitle = defineMessage({ defaultMessage: 'Trade-off' })
const defaultLabel =
defineMessage({ defaultMessage: 'What\'s more important to you for this network?' })

export type TradeOffRadio = RadioProps & {
  columns: ReactNode[]
  key: string
}

export type TradeOffProps = {
    key: string
    title?: string
    label?: string
    name: NamePath
    required?: boolean
    headers: string[]
    radios: TradeOffRadio[]
}

export function TradeOff (props: TradeOffProps) {
  const { $t } = useIntl()
  const { key, title = $t(defaultTitle), label=$t(defaultLabel), name='tradeOff',
    headers=[], radios = [], required = true } = props
  const { form } = useStepFormContext()
  const fieldName = name as unknown as NamePath

  const selectedValue = Form.useWatch(fieldName, form)

  const renderOptionRows =
  (radio: TradeOffRadio, rowIndex: number) => {
    const { key: radioKey, value, columns } = radio
    return (
      <RowWrapper key={`tradeR_${radioKey}_${rowIndex}`}
        className={value === selectedValue? 'highlight' : ''}>
        {columns.map((column, colIndex) => (
          <Col span={12} key={`tradeC_${radioKey}_${colIndex}`}>
            {column}
          </Col>))}
      </RowWrapper>
    )
  }

  return (
    <TradeOffWrapper key={key}>
      <Space>
        <Row>
          <Col span={24}><h2>{title}</h2></Col>
        </Row>
      </Space>
      <Form.Item
        name={fieldName}
        label={label}
        rules={[{ required }]}
      >
        <Radio.Group>
          {radios.map((radioProps) => (<div><Radio {...radioProps} /></div>))}
        </Radio.Group>
      </Form.Item>
      <HeaderWrapper>
        {headers.map((header, hIndex) => (
          <Col span={12} key={`tradeH_${hIndex}`}><span>{header}</span></Col>
        ))}
      </HeaderWrapper>
      <DividerWrapper />
      {radios.map((radio, rowIndex) =>
        renderOptionRows(radio, rowIndex))}
    </TradeOffWrapper>
  )
}