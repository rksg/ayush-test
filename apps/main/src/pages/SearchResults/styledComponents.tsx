import { Collapse as AntCollapse } from 'antd'
import styled                      from 'styled-components'

export const Collapse = styled(AntCollapse)`

  .ant-collapse-header-text {
    padding-left: 10px;
    padding-bottom: 10px;
  }

  .ant-collapse-content-box {
    padding: 0px;
    padding-top: 0px;
    padding-bottom: 5px;
  }
`

export const Panel = styled(AntCollapse.Panel)``