import { Space, Radio, Col, RadioProps, RadioGroupProps } from 'antd'
import _                                                  from 'lodash'

import { TradeOffWrapper, HeaderWrapper, RowWrapper, DividerWrapper } from './styledComponents'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawValue = string | number | boolean

export type TradeOffRadio = RadioProps & {
  columns: React.ReactNode[]
  key: string
  value: RawValue
}

export type TradeOffProps <Value extends string | number = string> = {
  headers: React.ReactNode[]
  radios: TradeOffRadio[]
  onChange?: (value: Value) => void
} & Pick<RadioGroupProps, 'name' | 'value' | 'defaultValue'>

export function TradeOff <Value extends string | number = string> (props: TradeOffProps<Value>) {
  const { headers=[], radios = [], onChange } = props
  const value = typeof props.value === 'undefined' ? props.defaultValue : props.value
  const selectIndex = radios?.map(radios => radios.value).indexOf(value)

  const inputProps = _.pick(props, ['name', 'value', 'defaultValue'])

  const renderOptionRows =
  (radio: TradeOffRadio, rowIndex: number) => {
    const { key: radioKey, value: selectValue, columns } = radio
    return (
      <RowWrapper key={`tradeR_${radioKey}_${rowIndex}`}
        className={selectValue === value ? 'highlight' : ''}
        onClick={() => onChange?.(selectValue as Value)}>
        {columns.map((column, colIndex) => (
          <Col span={12} key={`tradeC_${radioKey}_${colIndex}`}>
            {column}
          </Col>))}
      </RowWrapper>
    )
  }

  return (
    <TradeOffWrapper>
      <Radio.Group {...inputProps} onChange={e => onChange?.(e.target.value)}>
        <Space direction='vertical'>
          {radios.map((radioProps) =>
            (<div key={`tradeR_${radioProps.key}`}><Radio {...radioProps} /></div>))
          }
        </Space>
      </Radio.Group>
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
