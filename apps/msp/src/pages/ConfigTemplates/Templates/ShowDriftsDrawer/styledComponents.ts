import styled from 'styled-components/macro'

import { Collapse } from '@acx-ui/components'

export const DriftSetCollapse = styled(Collapse)`
  .ant-collapse-item .ant-collapse-header {
    padding-bottom: 0;
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
  .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding-top: 4px;
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
`
