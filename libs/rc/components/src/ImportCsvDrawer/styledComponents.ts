import styled from 'styled-components/macro'

import {  Drawer } from '@acx-ui/components'

export const ImportFileDrawer = styled(Drawer)`
  .ant-drawer-body > span {
    margin: 15px 0 20px;
    .ant-typography {
      font-size: 11px;
      display: inline-block;
      min-width: 60px;
    }
  }

  .ant-drawer-body > ul {
    padding-left: 20px;

    > li {
      margin: 8px 0;

      &::marker {
        font-size: 8px;
      }
    }
  }
`