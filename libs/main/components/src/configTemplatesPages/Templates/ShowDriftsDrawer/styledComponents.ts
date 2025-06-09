import styled from 'styled-components/macro'

import { Collapse } from '@acx-ui/components'

export const DriftSetCollapse = styled(Collapse)`
  &.ant-collapse.ant-collapse-icon-position-start .ant-collapse-item .ant-collapse-header  {
    padding-bottom: 4px;
    padding-top: 8px;
    padding-left: 0;
    align-items: center;
    div.ant-collapse-expand-icon {
      svg {
        width: 18px;
        margin-right: 8px;
        padding-top: 4px;
        path {
          stroke: var(--acx-accents-blue-50);
        }
      }
    }
  }
`

export const BoldLabel = styled.span`
  font-weight: 600;
  word-break: break-all;
`

export const DriftInstanceCollapse = styled(Collapse)`
  width: 100%;
  &.ant-collapse.ant-collapse-icon-position-end .ant-collapse-item .ant-collapse-header {
    padding: 0;
    border-bottom: none;
    font-size: var(--acx-subtitle-4-font-size);
    .ant-collapse-expand-icon {
      svg {
        width: 12px;
        margin-right: 12px;
        top: 50%;
      }
    }
  }
  .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding-bottom: 4px;
  }
`
export const SelectedCustomersIndicator = styled.div`
  padding: 6px;
  background-color: var(--acx-accents-blue-10);
  border-radius: 4px;
  font-size: var(--acx-body-4-font-size);
  font-weight: normal;
`
