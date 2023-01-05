import { Divider as AntDivider, Form as AntdForm } from 'antd'
import styled                                      from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
  margin-left: 6px;
`

export const FormItemLayout = styled(AntdForm.Item)`
  &.ant-form-item {
    margin-bottom: 10px;
    // label {
    //   font-size: 12px;
    // }
  }
  
  .ant-form-item-control-input-content {
    align-items: center;
    &:first-child {
      display: flex;
      width: 100%;
    }
  }

  .ant-checkbox-wrapper {
    align-items: center;
  }

  .ant-form-item {
    width: 248px;
  }

  label ~ .ant-form-item {
    margin-bottom: 10px;
  }

  label + .ant-form-item,
  label + div {
    // width: 248px;
    padding-left: 10px;
  }
`

export const SwitchLabel = styled('div')`
  display: inline-flex;
  width: 170px;
  font-size: var(--acx-body-4-font-size)
`

export const GroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 60px;
  overflow-y: scroll;
  label {
    display: flex;
    margin: 4px 0;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }
`
export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  background: var(--acx-neutrals-50);
  width: 1px;
  height: 14px;
`