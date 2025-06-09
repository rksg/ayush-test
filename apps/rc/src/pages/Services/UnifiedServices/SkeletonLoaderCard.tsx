import { Card, Skeleton } from 'antd'
import styled             from 'styled-components'

import { GridCol, GridRow } from '@acx-ui/components'

const SkeletonCard = styled(Card)`
  position: relative;
  border: solid 1px var(--acx-neutrals-30);
  box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
  height: 100%;
  cursor: pointer;
  .ant-card-body {
    padding: 16px 12px 4px 12px;
  }
`

export function SkeletonLoaderCard () {
  return <GridRow>
    <GridCol key='skeleton-loader-1' col={{ span: 6 }}>
      <SkeletonCard><Skeleton active /></SkeletonCard>
    </GridCol>
    <GridCol key='skeleton-loader-2' col={{ span: 6 }}>
      <SkeletonCard><Skeleton active /></SkeletonCard>
    </GridCol>
    <GridCol key='skeleton-loader-3' col={{ span: 6 }}>
      <SkeletonCard><Skeleton active /></SkeletonCard>
    </GridCol>
    <GridCol key='skeleton-loader-4' col={{ span: 6 }}>
      <SkeletonCard><Skeleton active /></SkeletonCard>
    </GridCol>
  </GridRow>
}
