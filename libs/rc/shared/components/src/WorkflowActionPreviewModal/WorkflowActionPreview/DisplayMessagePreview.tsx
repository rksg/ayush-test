
import { GridCol, GridRow }                                from '@acx-ui/components'
import { DisplayMessageAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'

export function DisplayMessagePreview (props: GenericActionPreviewProps<DisplayMessageAction>) {
  const { data, ...rest } = props

  return <ContentPreview
    title={<GridRow justify={'center'}
      align={'middle'}>
      <GridCol col={{ span: 24 }}
        style={{ alignItems: 'center' }}>
        <span dangerouslySetInnerHTML={{ __html: data?.title || '' }} />
      </GridCol>
    </GridRow>}
    body={<GridRow justify={'center'}
      align={'middle'}>
      <GridCol col={{ span: 24 }}
        style={{ alignItems: 'center' }}>
        <span dangerouslySetInnerHTML={{ __html: data?.messageHtml || '' }} />
      </GridCol>
    </GridRow>}
    {...rest}
  />
}
