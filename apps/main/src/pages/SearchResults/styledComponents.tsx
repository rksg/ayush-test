import { Collapse as AntCollapse } from 'antd'
import styled                      from 'styled-components'

export const Collapse = styled(AntCollapse)`

  .ant-collapse-header-text {
    padding-left: 6px;
    padding-bottom: 10px;
  }

  .ant-collapse-content-box {
    padding: 0px;
    padding-top: 0px;
    padding-bottom: 2px;
  }
`

export const Panel = styled(AntCollapse.Panel)`
`

export const StyledPageHeader = styled.div`
  .ant-page-header-heading {
    margin-top: var(--acx-content-horizontal-space);
    margin-bottom: var(--acx-content-horizontal-space);
  }
`