import { Space } from 'antd'
import styled    from 'styled-components'

import { Drawer } from '@acx-ui/components'

export const Actions = styled(Space)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 20px;
`

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

export const Spacer = styled.div`
  height: var(--acx-descriptions-space);
`

export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`
