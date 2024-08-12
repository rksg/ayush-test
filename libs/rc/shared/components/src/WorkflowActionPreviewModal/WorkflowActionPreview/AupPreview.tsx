import { AupAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function AupPreview (props: GenericActionPreviewProps<AupAction>) {
  const { data, ...rest } = props

  return <ContentPreview
    title={data?.title}
    body={<div>AUP Preview Component</div>}
    {...rest}
  />
}
