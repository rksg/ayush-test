import { Typography, Space, Checkbox } from 'antd'
import { useIntl }                     from 'react-intl'

import { AupAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function AupPreview (props: GenericActionPreviewProps<AupAction>) {
  const { $t } = useIntl()
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
        <Checkbox>
          <Text>
            {$t({ defaultMessage: 'I agree to the' })}{' '}
            <Link>{$t({ defaultMessage: 'Terms & Conditions' })}</Link>
          </Text>
        </Checkbox>
      </Space>
    }
    {...rest}
  />
}
