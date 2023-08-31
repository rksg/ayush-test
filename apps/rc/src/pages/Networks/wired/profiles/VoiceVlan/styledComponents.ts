import styled from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 12px;
  height: 14px;
  path {
    fill: var(--acx-primary-white);
  }
  position: absolute;
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 12px;
  height: 14px;
  path {
    fill: var(--acx-primary-white);
  }
  position: absolute;
`
export const PortSpan = styled.span`
  padding-left: 15px;
`

export const FormLabel = styled.div`
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-control {
    display: none;
  }
  .ant-form-item-label {
    padding-bottom: 0;
  }
`

export const FormChildren = styled.div`
  .ant-form-item-control-input {
    min-height: auto;
  }
  .ant-form-item-control-input-content div{
    margin-top: 3px
  }
`
