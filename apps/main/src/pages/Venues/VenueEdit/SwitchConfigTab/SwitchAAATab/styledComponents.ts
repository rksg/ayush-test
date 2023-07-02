import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const AAAServers = styled.div`
   &.ant-collapse-ghost
     > .ant-collapse-item
       > .ant-collapse-content
         > .ant-collapse-content-box {
           padding-left: 85px;
         }
`

export const TransferStyle = styled(Space)`
  .ant-transfer.ant-transfer-disabled {
    .ant-transfer-list-content-item-disabled {
      color: var(--acx-primary-black);
    }
  }
`