import { Space, Row, Input } from 'antd'
import styled                from 'styled-components/macro'

export const RowStyle = styled(Row)`
  .ant-form-item-label > label {
    color: var(--acx-primary-black);
  }
  .ant-form-item {
    color: var(--acx-neutrals-60)
  }
`

export const Notification = styled.div`
  background: var(--acx-neutrals-10);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
  padding: 20px;
  margin-bottom: 10px;
  ul {
    padding-inline-start: 20px;
    margin: 0;
  }
`

export const Picker = styled.div`
  width: 188px;
  height: 248px;
  border: 1px solid var(--acx-neutrals-30);
  border-radius: 4px;
  margin: 4px 0;

  .ant-radio-group {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  .ant-radio-wrapper {
    display: flex;
    font-size: 12px;
    padding: 4px 8px;
    margin: 0;
    user-select: none;
    &.ant-radio-wrapper-checked {
      background: var(--acx-accents-orange-10);
    }
    &.highlight {
      color: var(--acx-semantics-red-50)
    }
  }
  .ant-radio {
    display:none;
  }
`

export const ButtonWrapper = styled(Space)`
  .ant-space-item button {
    font-size: var(--acx-body-4-font-size);
  }
  .ant-divider-vertical {
    margin: 0 4px;
    background: var(--acx-primary-black);
  }
`

export const CliConfiguration = styled(Input.TextArea)`
  width: 100%;
  height: 250px;
  background: var(--acx-neutrals-10);
  border: 1px solid var(--acx-neutrals-30);
  font-size: var(--acx-body-4-font-size);
  line-height: 1.5;
  padding: 12px;
  resize: none;
  &:hover,
  &:focus {
    border-color: var(--acx-neutrals-30) !important;
    box-shadow: none
  }  
`