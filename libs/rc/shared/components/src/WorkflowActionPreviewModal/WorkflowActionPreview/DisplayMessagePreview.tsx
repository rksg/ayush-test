import { Typography, Space } from 'antd'

import { DisplayMessageAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function DisplayMessagePreview (props: GenericActionPreviewProps<DisplayMessageAction>) {
  const { data, ...rest } = props
  const { Text } = Typography

  return <ContentPreview
    title={data?.title}
    body={
      <Space direction='vertical'
        align='center'>
        <br/>
        <Text >{data?.messageHtml}</Text>
      </Space>
    }
    {...rest}
  />
}
