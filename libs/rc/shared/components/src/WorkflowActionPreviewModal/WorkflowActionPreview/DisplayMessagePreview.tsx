import { DisplayMessageAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'


export function DisplayMessagePreview (props: GenericActionPreviewProps<DisplayMessageAction>) {
  const { data, ...rest } = props

  return <ContentPreview
    title={data?.title}
    body={<div>DisplayMessage Preview Component</div>}
    {...rest}
  />
}
