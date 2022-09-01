import {
  Cascader as AntCascader,
  Divider as AntDivider,
  Space as AntSpace
} from 'antd'
import styled from 'styled-components/macro'

export const Cascader = styled(AntCascader)`
  .ant-select-selector {
    border-color: var(--acx-primary-black) !important;
  }
  .ant-select-selection-placeholder {
    color: var(--acx-primary-black);
  }
  .ant-select-focused {
    .ant-select-selection-placeholder {
      color: var(--acx-neutrals-50);
    }
  }
`

export const Space = styled(AntSpace)`
  padding: 8;
`

export const Divider = styled(AntDivider)`
  margin: 0;
`
export const ButtonDiv = styled.div`
  background-color: var(--acx-neutrals-10);
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 8px 24px;
  gap: 12px;
`

export const Span = styled.span`
  margin-right: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 2px;
`
