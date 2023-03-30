import { Checkbox, Cascader as AntCascader } from 'antd'
import styled                                from 'styled-components/macro'

import { InformationOutlined } from '@acx-ui/icons'

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
  .ant-cascader-menu {
    overflow: auto;
    height: 215px;
    max-height: 100%;
  }
  .ant-select-selection-overflow-item-rest > .ant-select-selection-item {
    border: none;
    background: var(--acx-primary-white);
    min-width: 110px;
    padding-right: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
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
export const RadioBandsWrapper = styled.div`
  margin-top: 4px;
  border-top: 1px solid var(--acx-neutrals-20);
  padding: 10px;
  width: 350px;
`
export const RadioBandLabel = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
`
export const CheckboxGroup = styled(Checkbox.Group)`
  .ant-checkbox-wrapper {
    > span {
      &:first-child {
        /* do nothing */
      }
      &:last-child {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
      }
    }
  }
`

export const InfoIcon = styled(InformationOutlined)`
  margin-bottom: -5px;
`
