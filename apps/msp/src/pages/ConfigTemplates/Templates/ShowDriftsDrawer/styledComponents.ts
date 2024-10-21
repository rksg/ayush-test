import styled from 'styled-components/macro'

import { Collapse } from '@acx-ui/components'

export const DriftSetCollapse = styled(Collapse)`
  .ant-collapse-item .ant-collapse-header {
    padding-bottom: 4px;
    padding-top: 8px;
    padding-left: 0;
    align-items: center;
    .ant-collapse-expand-icon {
      svg {
        width: 18px !important;
        margin-right: 8px !important;
        top: 60% !important;
        path {
          stroke: var(--acx-accents-blue-50);
        }
      }
    }
  }
`
export const DriftInstanceCollapse = styled(Collapse)`
  width: 100%;
  .ant-collapse-item .ant-collapse-header {
    border-bottom: none !important;
    font-size: var(--acx-subtitle-4-font-size) !important;
    .ant-collapse-expand-icon {
      svg {
        width: 12px;
        margin-right: 12px;
        top: 57%;
      }
    }
  }
  .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding-bottom: 4px;
  }
`
export const DriftInstanceHeader = styled.div`
  backgroundColor: #F2F2F2;
  padding: 8px 30px 8px 16px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  border-top: 1px solid #D7D7D7;
  border-bottom: 1px solid #D7D7D7
`
