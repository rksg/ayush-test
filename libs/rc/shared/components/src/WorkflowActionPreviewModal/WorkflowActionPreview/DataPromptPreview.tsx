import { Typography, Space, Input, Form } from 'antd'
import { MessageDescriptor, useIntl }     from 'react-intl'

import { DataPromptAction, DataPromptVariable, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import PhoneInput from '../../PhoneInput'

import { ContentPreview } from './ContentPreview'


export function DataPromptPreview (props: GenericActionPreviewProps<DataPromptAction>) {

  const { $t } = useIntl()
  const { Text } = Typography
  const { data, ...rest } = props

  const getFormFieldLabel = function (formField:DataPromptVariable):string {

    if(formField?.label && typeof formField.label === 'string') {
      return formField.label
    } else if (formField?.label) {
      return $t(formField.label as MessageDescriptor)
    }
    return ''
  }

  return <ContentPreview
    title={data?.title}
    body={
      <Space direction='vertical' align='center'>
        <Text>{data?.messageHtml}</Text>
        <Form layout='vertical' style={{ width: '250px' }}>
          {data?.variables?.map((formField:DataPromptVariable) => {
            if(formField.type === 'PHONE') {
              return <Form.Item
                style={{ marginBottom: '0' }}
                key={getFormFieldLabel(formField)}
                label={getFormFieldLabel(formField)}
                children={
                  <PhoneInput
                    name={getFormFieldLabel(formField)}
                    onTop={false}
                  />}
              />
            } else {
              return <Form.Item key={getFormFieldLabel(formField)} label={getFormFieldLabel(formField)}>
                <Input></Input>
              </Form.Item>
            }})
          }
        </Form>
      </Space>
    }
    {...rest}
  />
}
