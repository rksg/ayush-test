import {
  Button as AntButton,
  Divider as AntDivider,
  Space
} from 'antd'
import styled, { css } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

import modifyVars from '../../theme/modify-vars'

export const Wrapper = styled.div`
  --acx-header-item-margin: 20px;
  --acx-header-divider-margin: 5px;
  --acx-header-button-margin: 12px;

  .ant-pro-basicLayout {
    .ant-layout.ant-layout-has-sider {
      .ant-layout-sider {
        overflow: visible !important;
        &.ant-layout-sider-collapsed {
          .ant-menu-item-disabled {
            .ant-pro-menu-item-title {
              display: none;
            }
          }
        }
        .ant-layout-sider-children {
          .ant-pro-sider-logo {
            width: var(--acx-sider-width);
            padding: 18px 20px;
          }
          .ant-menu-submenu-arrow {
            display: none;
          }
        }
        &:before, &::after {
          content: '';
          position: absolute;
          top: var(--acx-header-height);
          right: -20px;
          width: 20px;
          height: 20px;
        }
        &:before {
          background-color: var(--acx-primary-black);
        }
        &:after {
          background-color: var(--acx-primary-white);
          border-top-left-radius: 20px;
        }
      }
      .ant-menu-title-content {
        a {
          color: var(--acx-primary-white);
        }
      }
      .ant-menu-submenu {
        .ant-menu-submenu-title {
          font-family: var(--acx-accent-brand-font);
          font-size: var(--acx-headline-4-font-size);
          font-weight: var(--acx-headline-4-font-weight);
          border-left: 2px solid transparent;
          padding-left: 18px !important;
          padding-right: 0;
          .ant-pro-menu-item {
            transition: opacity 0.2s ease-in-out;
          }
        }
        &-selected {
          background-color: transparent;
          .ant-menu-submenu-title {
            font-weight: var(--acx-headline-4-font-weight-bold);
            border-left-color: var(--acx-accents-orange-50);
            background-color: var(--acx-neutrals-70);
          }
        }
        &-open {
          background-color: var(--acx-neutrals-80);
        }
        .ant-menu-sub {
          background-color: var(--acx-neutrals-80);
          padding-bottom: 4px;
          .ant-menu-item {
            height: 32px;
            margin: auto;
            display: flex;
            align-items: center;
            background-color: var(--acx-neutrals-80);
            border-left-color: transparent;
            padding-left: 18px !important;
            padding-right: 0;
            font-size: var(--acx-headline-5-font-size);
            font-weight: var(--acx-headline-5-font-weight);
            opacity: 60%;
            &-selected {
              opacity: 100%;
              font-weight: var(--acx-headline-5-font-weight-semi-bold);
            }
          }
        }
      }
      .ant-menu-item {
        border-left: 2px solid transparent;
        padding-left: 18px !important;
        padding-right: 0;
        font-family: var(--acx-accent-brand-font);
        font-size: var(--acx-headline-4-font-size);
        font-weight: var(--acx-headline-4-font-weight);
        line-height: 38px;
        &-disabled {
          .ant-pro-menu-item-title {
            color: var(--acx-primary-white);
            opacity: 0.35;
          }
        }
        &-selected {
          font-weight: var(--acx-headline-4-font-weight-bold);
          border-left-color: var(--acx-accents-orange-50);
        }
        .ant-menu-title-content {
          .ant-pro-menu-item-title {
            transition: opacity 0.2s ease-in-out;
            vertical-align: middle;
          }
        }
        &.ant-pro-sider-collapsed-button {
          border: none;
          box-shadow: none;
        }
      }
      .ant-menu-item[data-menu-id$="/placeholder"] {
        pointer-events: none;
        height: 10px;
      }
      > div:first-child, .ant-layout-sider {
        flex: 0 0 var(--acx-sider-width) !important;
        max-width: var(--acx-sider-width) !important;
        min-width: var(--acx-sider-width) !important;
        width: var(--acx-sider-width) !important;
        transition: all 0.2s !important;
      }
    }
    &.sider-collapsed {
      .ant-layout.ant-layout-has-sider {
        > div:first-child, .ant-layout-sider {
          flex: 0 0 var(--acx-sider-collapsed-width) !important;
          max-width: var(--acx-sider-collapsed-width) !important;
          min-width: var(--acx-sider-collapsed-width) !important;
          width: var(--acx-sider-collapsed-width) !important;
        }
        .ant-menu-submenu {
          &-open {
            background-color: unset;
          }
          &-title {
            .ant-pro-menu-item {
              opacity: 0;
            }
          }
        }
        .ant-menu-item {
          .ant-pro-menu-item-title {
            opacity: 0;
          }
        }
        .ant-menu-submenu-popup {
          .ant-menu-sub {
            background-color: var(--acx-neutrals-80);
          }
      }
    }
  }

  .ant-layout-header {
    width: 100% !important;
    height: var(--acx-header-height) !important;
    line-height: var(--acx-header-height) !important;
    .ant-pro-global-header {
      background-color: var(--acx-primary-black);
      color: var(--acx-primary-white);
      padding: 0 20px 0 var(--acx-sider-width);
      font-size: var(--acx-body-4-font-size);
    }
  }

  .ant-layout-content {
    margin: 0;
    background-color: var(--acx-primary-white);
  }
`

export const Content = styled.div`
  margin: var(--acx-content-vertical-space) var(--acx-content-horizontal-space);
  min-width: calc(${modifyVars['@screen-xl']}
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  );
  min-height: calc(100vh - var(--acx-header-height));
  position: relative;
  display: flex;
  flex-direction: column;
  &:before {
    content: '';
    position: fixed;
    left: 0;
    top: var(--acx-header-height);
    height: var(--acx-content-vertical-space);
    width: 100%;
    background-color: var(--acx-primary-white);
    z-index: 5;
  }
`

export const LeftHeaderContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--acx-header-item-margin);
  height: 100%;
`
export const LogoDivider = styled(AntDivider).attrs({ type: 'vertical' })`
  border-right: 1px solid var(--acx-neutrals-70);
  height: 32px;
  top: 0;
  margin: 0;
`

export const RightHeaderContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--acx-header-button-margin);
  height: 100%;

  .ant-tooltip-disabled-compatible-wrapper{
    display: flex !important;
    svg {
      fill: none;
      stroke: var(--acx-neutrals-40);
    }
  }
`

const MenuIcon = styled.span`
  margin-right: 8px;
  > svg {
    vertical-align: middle;
    height: 20px;
    width: 20px;
  }
`
export const MenuIconOutlined = styled(MenuIcon)`
  > svg {
    path {
      stroke: var(--acx-primary-white);
    }
    circle {
      stroke: var(--acx-primary-white);
    }
  }
`
export const MenuIconSolid = styled(MenuIcon)`
  > svg {
    stroke: var(--acx-neutrals-70);
  }
`

const arrowStyle = css`
  path {
    stroke: var(--acx-primary-white);
  }
  vertical-align: middle;
`
export const Arrow = styled(ArrowChevronLeft)`
  ${arrowStyle}
`
export const ArrowCollapsed = styled(ArrowChevronRight)`
  ${arrowStyle}
`
export const CollapseText = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-left: 5px;
`

const Button = styled(AntButton).attrs({ type: 'primary' })`
  background-color: var(--acx-neutrals-70);
  border: none;
  &:hover, &:focus {
    border-color: var(--acx-accents-orange-55);
    background-color: var(--acx-accents-orange-55);
  }
  > svg {
    width: 16px;
    height: 100%;
  }
`
export const LayoutUI = {
  iconOutlinedOverride: css`
    path { stroke: none !important; }
  `,
  iconSolidOverride: css`
    stroke: none !important;
  `,
  Icon: styled.span`
    > svg {
      width: 16px;
      height: 16px;
      vertical-align: text-bottom;
      path {
        stroke: var(--acx-primary-white);
      }
    }
  `,
  DropdownText: styled.span.attrs(props => ({ children: <Space>{props.children}</Space> }))`
    font-size: var(--acx-body-3-font-size);
    line-height: 1;
  ` as React.FC<React.PropsWithChildren>,
  ButtonOutlined: styled(Button)`
    > svg path {
      stroke: var(--acx-primary-white);
    }
  `,
  ButtonSolid: styled(Button)`
    > svg {
      stroke: var(--acx-neutrals-70);
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    &:hover, &:focus {
      > svg {
        stroke: var(--acx-accents-orange-55);
      }
    }
  `,
  Divider: styled(LogoDivider)`
    margin: 0 var(--acx-header-divider-margin) 0
      calc(var(--acx-header-divider-margin) - 1px);
  `
}
