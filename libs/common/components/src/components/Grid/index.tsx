import React from 'react'

import { Row as AntRow, Col as AntCol } from 'antd'
import styled                           from 'styled-components/macro'

import type { ColProps as AntColProps } from 'antd'

export {
  RowProps as GridRowProps
} from 'antd'

const ColInner = styled(AntCol)`
  // Appear in flex so allowed its children to
  // be able to take up full height of sibling col
  display: flex;
`

const Container = styled.div`
  // Appear in flex to take up full height
  display: flex;
  flex-direction: column;
  // Set flex to 1 for it to take up full width
  flex: 1;
`

export const GridRow = styled(AntRow).attrs({ gutter: [20, 20] })``

export type GridColProps = React.HTMLAttributes<HTMLDivElement> & {
  col: AntColProps
}

export function GridCol ({ col, ...props }: GridColProps) {
  return <ColInner {...col}>
    <Container {...props} />
  </ColInner>
}
