import { Typography, Space, Checkbox } from 'antd'

import { AupAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function AupPreview (props: GenericActionPreviewProps<AupAction>) {
  const { Text, Link } = Typography
  const { data, ...rest } = props
  return <ContentPreview
    title={data?.title}
    body={
      <Space direction='vertical'
        align='center'>
        <br/>
        <Text >{data?.messageHtml}</Text>
        <br/>
        <Checkbox><Text>I agree to the <Link>Terms & Conditions</Link></Text></Checkbox>
      </Space>
    }
    {...rest}
  />
}
