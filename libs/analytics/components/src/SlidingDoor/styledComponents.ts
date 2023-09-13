import {
  Breadcrumb,
  List,
  Menu,
  Input
} from 'antd'
import { keyframes }   from 'styled-components'
import styled, { css } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'
export type SeveritySpanProps = {
  severity: string
}
const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`
const slideOut = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`

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
  font-size: var(--acx-headline-3-font-size);
  font-weight: var(--acx-headline-5-font-weight-bold);
  color: var(--acx-primary-black);
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
  font-size: var(--acx-subtitle-6-font-size);
  font-weight: var(--acx-headline-5-font-weight);
  padding-left: 20px;
  padding-right: 16px;
  .ant-breadcrumb-link {
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

`
export const ListItemSpan = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
`
export const ListItem = styled(List.Item)<{
  $isSelected?: boolean;
  $isAnimationSlideIn: boolean;
  $isSearchTriggerred: boolean;
}>`
  padding-left: 20px;
  padding-right: 16px;
  animation: ${(props) =>
    props.$isAnimationSlideIn
      ? slideIn
      : slideOut} 
    ${(props) =>
    props.$isSearchTriggerred
      ? '0s'
      : '0.3s'} ease-in-out;
  background-color: ${(props) =>
    props.$isSelected
      ? 'var(--acx-accents-orange-20)'
      : 'var(--acx-primary-white)'};
  &:hover {
    cursor: pointer;
    background-color: var(--acx-accents-orange-10);
  }
`
export const StyledList = styled(List)`
  max-height: 400px;
  .ant-list-header {
    position: sticky;
    top: 0;
    background-color: var(--acx-primary-white);
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
    background-color: var(--acx-primary-white);
    z-index: 1;
    padding-bottom: 0px;
  }
`
export const StyledMenu = styled(Menu)`
  padding-bottom: 0px !important;
  user-select: none;
  .ant-dropdown-menu-item {
  padding : 0;
  &.ant-dropdown-menu-item-active {
    background-color: var(--acx-primary-white) !important;
  }
  &:hover {
    background-color: var(--acx-primary-white) !important;
    cursor: default;  
  }
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