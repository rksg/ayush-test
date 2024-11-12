import { Typography, Input, Form }    from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { GridCol, GridRow }                                                from '@acx-ui/components'
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
    title={data?.displayTitle ? data?.title : undefined}
    body={
      <GridRow justify={'center'} align={'middle'}>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Form layout='vertical' style={{ width: '250px' }}>
            {data?.displayMessageHtml &&
            <Form.Item>
              <Text>{data?.messageHtml}</Text>
            </Form.Item>
            }
            {data?.variables?.map((formField:DataPromptVariable) => {
              return <Form.Item
                key={getFormFieldLabel(formField)}
                label={getFormFieldLabel(formField)}
                style={formField.type === 'PHONE' ? { marginBottom: '0' } : {}}
                children={
                  formField.type === 'PHONE' ?
                    <PhoneInput
                      name={getFormFieldLabel(formField)}
                      onTop={true}
                    /> :
                    <Input />
                }
              />})
            }
          </Form>
        </GridCol>
      </GridRow>
    }
    {...rest}
  />
}
