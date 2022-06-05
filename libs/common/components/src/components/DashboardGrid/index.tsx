import React from 'react'

import {
  Row as AntRow,
  Col as AntCol
} from 'antd'
import styled from 'styled-components/macro'

import type { ColProps as AntColProps } from 'antd'

export { RowProps as DashboardRowProps } from 'antd'

export const DashboardRow = styled(AntRow)`
  margin-top: 20px;
`

const ColInner = styled(AntCol)`
  // Appear in flex so allowed its children to
  // be able to take up full height of sibling col
  display: flex;
`

const WidgetContainer = styled.div`
  // Appear in flex to take up full height
  display: flex;
  flex-direction: column;
  // Set flex to 1 for it to take up full width
  flex: 1;
`

export type DashboardColProps = React.HTMLAttributes<HTMLDivElement> & {
  col: AntColProps
}

export function DashboardCol ({ col, ...props }: DashboardColProps) {
  return <ColInner {...col}>
    <WidgetContainer {...props} />
  </ColInner>
}
