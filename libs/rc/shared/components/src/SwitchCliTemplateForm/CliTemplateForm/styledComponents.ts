import {
  Collapse as AntCollapse
} from 'antd'
import styled from 'styled-components/macro'

export const CustomizedSection = styled('div')`
  background: var(--acx-neutrals-10);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`

export const Collapse = styled(AntCollapse)`
  .ant-collapse-item .ant-collapse-header {
    align-items: center;
    .ant-collapse-expand-icon {
      display: flex;
      svg {
        width: 17px;
        path {
          stroke: var(--acx-accents-blue-50);
        }
      }
    }
    .ant-collapse-header-text {
      width: 100%;
      > .ant-space {
        display: grid;
        grid-template-columns: 325px 1fr;
      }
    }
  }
`