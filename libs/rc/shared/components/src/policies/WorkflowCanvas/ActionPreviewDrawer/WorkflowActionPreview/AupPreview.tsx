import { Typography } from 'antd'

import { GenericActionData } from '@acx-ui/rc/utils'

import * as UI from './styledComponent'


export function AupPreview (props: { data?: GenericActionData }) {
  const { data } = props

  return (
    <UI.PreviewContainer>
      <Typography.Title>
        {data?.title}
      </Typography.Title>
      <Typography.Paragraph>
        {data?.messageHtml}
      </Typography.Paragraph>
    </UI.PreviewContainer>
  )
}