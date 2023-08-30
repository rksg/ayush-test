import {
  Breadcrumb,
  List,
  Menu
} from 'antd'
import styled, { css } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'
export type SeveritySpanProps = {
  severity: string
}

export const ButtonDiv = styled.div`
  margin-bottom: -28px;
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
  &:hover {
    cursor: pointer;
  }
`
const arrowStyle = css`
  path {
    stroke: var(--acx-primary-black);
  }
  vertical-align: middle;
`
export const LeftArrow = styled(ArrowChevronLeft)`
  ${arrowStyle},
  stroke-width: 2px;
  path {
    opacity: 0.2;
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
export const ListItem = styled(List.Item)`
  height: 54px;
  padding-left: 20px;
  padding-right: 16px;
  &:hover {
    cursor: pointer;
    background-color: var(--acx-accents-orange-20);
  }
`
export const StyledList = styled(List)`
  .ant-list-header {
    padding : 0px !important;
  }
`
export const StyledMenu = styled(Menu)`
.ant-dropdown-menu-item {
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 4px;
  max-height: 400px;
  overflow: auto;
  &:hover {
    background-color: #fff !important;
    cursor: default;  }
}
}
`