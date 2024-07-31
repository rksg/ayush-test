
import { AupAction } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function AupPreview (props: { data?: AupAction }) {
  const { data } = props

  return <ContentPreview
    title={data?.title}
    body={data?.messageHtml}
  />
}
