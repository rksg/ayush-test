import { Tag } from 'antd'
import styled  from 'styled-components/macro'

export const TagsContainer = styled.div`
  min-height: 100px;
  padding: 8px;
  border: 1px solid var(--acx-neutrals-50);
  border-radius: 4px;
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
  transition: all 0.3s;

  &.error {
    border: 1px solid var(--acx-semantics-red-50);
  }
  &.active {
    border: 1px solid var(--acx-primary-black);
  }
`

export const TagWrapper = styled.div`
  display: inline-block;
  .ant-tag {
    margin: 0 4px 8px 0;
    padding: 0 8px;
    cursor: move;
  }
  &:after {
    content: ':';
    display: inline-block;
    margin-right: 4px;
    width: 7px;
    text-align: center;
    color: var(--acx-primary-black);
  }
  &:last-child:after {
    content: '';
    width: 0px;
  }
  .ant-tag {
    border-radius: 4px;
    border-color: var(--acx-neutrals-20);
    background: var(--acx-neutrals-20);
    &.invalid {
      border-color: #FFCBCD;
      background: #FFCBCD;
    }
  }
  .ant-tag-close-icon {
    margin-left: 4px;
    color: var(--acx-primary-black);
  }
`

export const TagSelector = styled.div`
  display: inline-block;
  .ant-select-selector {
    border: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .ant-select-selection-search,
  .ant-select-selection-search-input {
    width: 80px;
    height: 18px !important;
    line-height: 18px;
  }
`

export const Placeholder = styled.span`
  padding: 4px;
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const AddTag = styled(Tag)`
  display: inline-flex;
  position: relative;
  top: -1px;   
  border: 0;
  padding: 0 !important;
  background: none;
  vertical-align: middle;
  align-items: center;
  cursor: pointer;
`