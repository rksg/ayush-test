import { CSSProperties, ReactNode } from 'react'

import { Form, FormItemProps, Radio, Space } from 'antd'
import { NamePath }                          from 'antd/lib/form/interface'
import { defineMessage, useIntl }            from 'react-intl'

import { MdnsFencingService } from '@acx-ui/rc/utils'

import { FixedFieldet } from './styledComponents'


export const updateRowId = (data: MdnsFencingService) => {
  const { service, customServiceName='' } = data

  const rowId = (service === 'OTHER')
    ? `Other_${customServiceName}`
    : service as string

  return { ...data, rowId }
}

export const updateRowIds = (data: MdnsFencingService[]) => {
  return data.map((d) => {
    return updateRowId(d)
  })
}

export interface RadioGroupProps {
  fieldName: NamePath,
  style?: CSSProperties
}

interface BaseRadioGroupProps extends RadioGroupProps {
  required?: boolean,
  label: string,
  options: {
    label: { defaultMessage: string },
    value: string
  }[]
}

export const VerticalRadioGroup = (props: BaseRadioGroupProps) => {
  const { $t } = useIntl()
  const { fieldName, label, options, style, required } = props

  return (
    <Form.Item
      required={required}
      style={style}
      label={label}
      name={fieldName}
      initialValue={options[0].value}
      children={
        <Radio.Group>
          <Space direction='vertical'>
            {
              options.map(o => {
                const { value, label } = o
                return <Radio key={value} value={value} children={$t(label)} />
              })
            }
          </Space>
        </Radio.Group>
      }
    />
  )
}

export function FencingRangeRadioGroup (props: RadioGroupProps) {
  const { $t } = useIntl()
  const { fieldName, style } = props

  const options = [
    { label: defineMessage({ defaultMessage: 'Same AP' }), value: 'SAME_AP' },
    { label: defineMessage({ defaultMessage: '1-hop AP neighbors' }), value: 'ONE_HOP_AP' }
  ]

  return (
    <VerticalRadioGroup
      required
      style={style}
      label={$t({ defaultMessage: 'Fencing Range' })}
      fieldName={fieldName}
      options={options}
    />
  )
}

export function ProtocolRadioGroup (props: RadioGroupProps) {
  const { $t } = useIntl()
  const { fieldName, style } = props

  const options = [
    { label: defineMessage({ defaultMessage: 'TCP' }), value: 'tcp' },
    { label: defineMessage({ defaultMessage: 'UDP' }), value: 'udp' }
  ]

  return (
    <VerticalRadioGroup
      style={style}
      label={$t({ defaultMessage: 'Protocol' })}
      fieldName={fieldName}
      options={options}
    />
  )
}

export const FieldsetItem = ({ children, label, switchStyle, ...props }: FormItemProps &
  { label: string, children: ReactNode, switchStyle: CSSProperties }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <FixedFieldet {...{ label, children }} switchStyle={switchStyle}/>
</Form.Item>

