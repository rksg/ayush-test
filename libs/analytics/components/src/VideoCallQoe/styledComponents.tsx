import styled from 'styled-components'

import { Drawer as AntdDrawer } from '@acx-ui/components'

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`
export const WithDottedUnderline = styled.span`
  ${withDottedUnderline}
  color: red;
`
WithDottedUnderline.displayName = 'WithDottedUnderline'

export const Drawer = styled(AntdDrawer)`
  .ant-drawer-body {
    overflow-x: hidden;
  }
`