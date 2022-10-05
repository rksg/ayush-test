import { Cascader as AntCascader } from 'antd'
import styled                      from 'styled-components/macro'

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

export const ButtonDiv = styled.div`
  margin-top: 4px;
  margin-bottom: -4px;
  background-color: var(--acx-neutrals-10);
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding: var(--acx-modal-footer-small-padding);
  gap: var(--acx-modal-footer-small-button-space);
`

export const Span = styled.span`
  margin-right: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 2px;
`
