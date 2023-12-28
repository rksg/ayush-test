import React from 'react'

import { Row as AntRow, Col as AntCol } from 'antd'
import styled, { css }                  from 'styled-components/macro'

import type {
  RowProps as AntRowProps,
  ColProps as AntColProps
} from 'antd'

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
  // Prevent content from overflowing
  min-width: 0;
`

export const gridGap = 20

export const GridRow = styled(AntRow).attrs({ gutter: [gridGap, gridGap] })<
  AntRowProps & { $divider?: boolean }
>`${props => props.$divider
  ? css`
    padding-bottom: ${gridGap}px;
    &:not(:last-of-type)::after {
      content: '';
      margin: 0 10px;
      width: 100%;
      height: 1px;
      background-color: var(--acx-neutrals-30);
    }
  `
  : ''
}`

type GridColProps = React.HTMLAttributes<HTMLDivElement> & {
  col: AntColProps
}
export function GridCol ({ col, ...props }: GridColProps) {
  return <ColInner {...col}>
    <Container {...props} />
  </ColInner>
}
