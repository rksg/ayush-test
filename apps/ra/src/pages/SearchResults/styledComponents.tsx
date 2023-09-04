import styled from 'styled-components'

import { Collapse as AcxCollapse } from '@acx-ui/components'

export const Collapse = styled(AcxCollapse)`
  .ant-collapse-content {
    background-color: var(--acx-primary-white) !important;
  }
  .ant-collapse-content-box {
    padding: 0px 2px 2px 2px;
  }
`

export const Panel = styled(AcxCollapse.Panel)`
  .ant-collapse-header {
    padding: 13px 10px !important;
  }
  .ant-collapse-header > .ant-collapse-expand-icon > .ant-collapse-arrow {
    right: 18px !important;
  }
`

export const Ul = styled.div`
  display: flex;
  width: 100%;
`

export const Chevron = styled.div`
  padding: 0 10px;
  z-index: 2;
  color: rgba(83, 98, 105, 0.63)
`
export const Li = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
