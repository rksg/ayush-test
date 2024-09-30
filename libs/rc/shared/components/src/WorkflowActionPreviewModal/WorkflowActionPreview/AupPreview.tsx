import { Typography, Checkbox } from 'antd'
import { useIntl }              from 'react-intl'

import { GridCol, GridRow }                     from '@acx-ui/components'
import { AupAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function AupPreview (props: GenericActionPreviewProps<AupAction>) {
  const { $t } = useIntl()
  const { Text, Link } = Typography
  const { data, ...rest } = props

  return <ContentPreview
    title={data?.title}
    body={
      <GridRow justify={'center'} align={'middle'}>
        <GridCol col={{ span: 24 }}>
          <Typography.Paragraph>
            {data?.messageHtml}
          </Typography.Paragraph>
        </GridCol>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Checkbox>
            <Text>
              {$t({ defaultMessage: 'I agree to the' })}{' '}
              <Link>{$t({ defaultMessage: 'Terms & Conditions' })}</Link>
            </Text>
          </Checkbox>
        </GridCol>
      </GridRow>
    }
    {...rest}
  />
}
