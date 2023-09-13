import styled from 'styled-components'

import { Drawer as AntdDrawer } from '@acx-ui/components'

export const Invalid = styled.span`
  color: var(--acx-semantics-red-50);
`

export const Drawer = styled(AntdDrawer)`
  .ant-drawer-body {
    overflow-x: hidden;
  }
`
