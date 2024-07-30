import { DisplayMessageAction } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'

export function DisplayMessagePreview (props: { data?: DisplayMessageAction }) {
  const { data } = props

  return <ContentPreview
    title={data?.title}
    body={data?.messageHtml}
  />
}
