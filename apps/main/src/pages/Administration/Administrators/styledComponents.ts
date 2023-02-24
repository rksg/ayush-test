import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Wrapper = styled(Space)`
  .ant-pro-table-list-toolbar-title {
    padding: 15px;
  }
`

export const TableTitleWrapper = styled(Space)`
  background-color: var(--acx-neutrals-15);
  padding: 12px;
  & h4.ant-typography, & h5.ant-typography {
    font-weight: var(--acx-subtitle-6-font-weight);
  }

  h5 {
    font-size: var(--acx-subtitle-6-font-size);
  }
`