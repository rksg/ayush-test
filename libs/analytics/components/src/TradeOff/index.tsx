import { Form, Radio, Col, Row, RadioProps } from 'antd'
import { NamePath }                          from 'antd/es/form/interface'

import { TradeOffWrapper, HeaderWrapper, RowWrapper, DividerWrapper } from './styledComponents'
declare type RawValue = string | number
export type TradeOffRadio = RadioProps & {
  columns: React.ReactNode[]
  key: string,
  value: RawValue
}

export type TradeOffProps = {
    key: string,
    title: React.ReactNode
    label: React.ReactNode
    name: NamePath
    headers: React.ReactNode[]
    radios: TradeOffRadio[],
    currentValue: RawValue,
    onChange: (value: RawValue) => void
}

export function TradeOff (props: TradeOffProps) {
  const { key: tradeOffKey, title, label, name,
    headers=[], radios = [], currentValue, onChange } = props
  const fieldName = name as unknown as NamePath
  const selectIndex = radios?.map(radios => radios.value).indexOf(currentValue)

  const renderOptionRows =
  (radio: TradeOffRadio, rowIndex: number) => {
    const { key: radioKey, value: selectValue, columns } = radio
    return (
      <RowWrapper key={`tradeR_${radioKey}_${rowIndex}`}
        className={selectValue === currentValue? 'highlight' : ''}>
        {columns.map((column, colIndex) => (
          <Col span={12} key={`tradeC_${radioKey}_${colIndex}`}>
            {column}
          </Col>))}
      </RowWrapper>
    )
  }

  return (
    <TradeOffWrapper key={tradeOffKey}>
      <Row>
        <Col span={24}><h2>{title}</h2></Col>
      </Row>
      <Form.Item
        name={fieldName}
        label={label}
        initialValue={currentValue}
      >
        <Radio.Group onChange={e => onChange(e.target.value)}>
          {radios.map((radioProps) =>
            (<div key={`tradeR_${radioProps.key}`}><Radio {...radioProps} /></div>))}
        </Radio.Group>
      </Form.Item>
      <HeaderWrapper>
        {headers.map((header, hIndex) => (
          <Col span={12} key={`tradeH_${hIndex}`}><span>{header}</span></Col>
        ))}
      </HeaderWrapper>
      <DividerWrapper style={selectIndex === 0 ? { borderColor: 'transparent' } : {}}/>
      {radios.map((radio, rowIndex) =>
        renderOptionRows(radio, rowIndex))}
    </TradeOffWrapper>
  )
}