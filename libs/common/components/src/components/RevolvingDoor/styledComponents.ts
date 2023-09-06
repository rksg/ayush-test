import {
  Breadcrumb,
  List,
  Menu,
  Input
} from 'antd'
import styled, { css } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'
export type SeveritySpanProps = {
  severity: string
}

export const ButtonDiv = styled.div`
  background-color: var(--acx-neutrals-10);
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: var(--acx-modal-footer-small-padding);
  gap: var(--acx-modal-footer-small-button-space);
`
export const ListHeader = styled.span`
  padding-left: 20px;
  padding-right: 16px;
  margin-left: -8px;
`
const arrowStyle = css`
  path {
    stroke: var(--acx-primary-black);
  }
  vertical-align: middle;
`
export const LeftArrow = styled(ArrowChevronLeft)`
  ${arrowStyle}
  stroke-width: 2px;
  &:hover {
    cursor: pointer;
  }
  `
export const RightArrow = styled(ArrowChevronRight)`
  ${arrowStyle}
  `
export const LeftArrowText = styled.span<{ hasLeftArrow: boolean }>`
  display: inline-block;
  vertical-align: middle;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  padding-left: ${(props) => props.hasLeftArrow ? '8px' : '0px'};
`
export const StyledBreadcrumb = styled(Breadcrumb)`
  overflow-wrap: break-word;
  width: 240px;
  margin-top: 5px;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 400;
  padding-left: 20px;
  padding-right: 16px;
  &:hover {
    cursor: pointer;
  }
`
export const ListItemSpan = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
`
export const ListItem = styled(List.Item)<{ isSelected?: boolean }>`
  height: 54px;
  padding-left: 20px;
  padding-right: 16px;
  background-color:  ${(props) => props.isSelected ? 'var(--acx-accents-orange-20)' : 'white'};
  &:hover {
    cursor: pointer;
    background-color: var(--acx-accents-orange-10);
  }
  &:active {
    background-color: var(--acx-accents-orange-20);
  }
`
export const StyledList = styled(List)`
  max-height: 400px;
  .ant-list-header {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
    padding-bottom: 0px;
  }
  .ant-list-items {
    min-height: 200px;
    max-height: 300px;
    overflow: auto;
  }
  .ant-list-footer {
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 1;
    padding-bottom: 0px;
  }
`
export const StyledMenu = styled(Menu)`
  padding-bottom: 0px !important;
  user-select: none;
  .ant-dropdown-menu-item {
  padding : 0;
  &:hover {
    background-color: #fff !important;
    cursor: default;  }
}
}
`
export const StyledInput = styled(Input)`
  border-color: var(--acx-primary-black);
  color: var(--acx-primary-black);
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .ant-input::placeholder {
    color: var(--acx-primary-black) !important;
  }
`
export const DropdownWrapper = styled.div`
`