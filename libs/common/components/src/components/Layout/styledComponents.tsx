/* eslint-disable max-len */
import {
  Button as AntButton,
  Divider as AntDivider,
  Space
} from 'antd'
import styled, { css, createGlobalStyle } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight, LogOut } from '@acx-ui/icons'

import modifyVars from '../../theme/modify-vars'

import bgImageUrl from './background.svg'

export const Wrapper = styled.div<{ showScreen: boolean }>`
  --acx-header-caret-width: 8px;
  --acx-header-item-margin: 20px;
  --acx-header-divider-margin: 5px;
  --acx-header-button-margin: 12px;
  --acx-header-company-name-width: 175px;
  --acx-header-company-name-min-width: 130px;
  --acx-header-company-name-right-space: 6px;
  --acx-sidebar-left-space: 10px;
  .ant-pro-basicLayout {
    .ant-layout {
      background: var(--acx-primary-white);
      &.ant-layout-has-sider {
        .ant-layout-sider {
          overflow: visible !important;
          ${({ showScreen }) => (!showScreen &&
            `@media screen and (max-width: 1279px) {
              height: var(--acx-header-height);
              position: fixed;
              top: 0;
              left: 0;
              z-index: 100;
            }`)}
          .ant-layout-sider-children {
            .ant-pro-sider-logo {
              padding: 0;
              width: var(--acx-sider-width);
              height: var(--acx-header-height);
              margin-bottom: 17px;
              align-items: center;
              justify-content: left;
              a {
                width: 100%;
                height: 100%;
                svg, img {
                  display: inline-block;
                  vertical-align: middle;
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
              }
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
            ${({ showScreen }) => (!showScreen &&
            `@media screen and (max-width: 1279px) {
              display: none;
            }`)}
          }
          &:after {
            background-color: var(--acx-primary-white);
            border-top-left-radius: 20px;
            ${({ showScreen }) => (!showScreen &&
            `@media screen and (max-width: 1279px) {
              display: none;
            }`)}
          }
        }
        .ant-menu {
          border: 0px;
          height: 100%;
          display: flex;
          flex-flow: column;
          transition: unset;
          a { text-decoration: none !important; }
        }
        .ant-menu-title-content { transition: all 0.2s !important; }
        .ant-menu-submenu {
          border-left: 2px solid transparent;
          .ant-menu-submenu-title {
            height: 48px;
            line-height: 48px;
            color: var(--acx-primary-white);
            font-family: var(--acx-accent-brand-font);
            font-size: var(--acx-headline-4-font-size);
            font-weight: var(--acx-headline-4-font-weight);
            padding-left: var(--acx-sidebar-left-space) !important;
            padding-right: 0;
            margin: 0;
            cursor: default;
            &:active { background: unset; }
          }
          &-open {
            background-color: var(--acx-neutrals-70);
          }
          &.menu-active {
            border-left: 2px solid var(--acx-accents-orange-50);
            background-color: var(--acx-neutrals-70);
            .ant-menu-submenu-title {
              font-weight: var(--acx-headline-4-font-weight-bold);
            }
          }
          &.menu-admin-item { margin-top: auto; }
        }
        .ant-menu-item {
          height: 48px;
          line-height: 48px;
          border-left: 2px solid transparent;
          padding-left: var(--acx-sidebar-left-space) !important;
          padding-right: 0;
          font-family: var(--acx-accent-brand-font);
          font-size: var(--acx-headline-4-font-size);
          font-weight: var(--acx-headline-4-font-weight);
          color: var(--acx-primary-white);
          margin: 0;
          flex-shrink: 0;
          &:active { background: unset; }
          &-active {
            background-color: var(--acx-neutrals-70);
          }
          .ant-menu-title-content {
            a { color: var(--acx-primary-white); }
          }
          &.menu-active {
            font-weight: var(--acx-headline-4-font-weight-bold);
            border-left: 2px solid var(--acx-accents-orange-50);
            background-color: var(--acx-neutrals-70);
          }
          &.menu-admin-item { margin-top: auto; }
          &.ant-pro-sider-collapsed-button {
            border: none;
            box-shadow: none;
            ${({ showScreen }) => (!showScreen &&
            `@media screen and (max-width: 1279px) {
              display: none;
            }`)}
          }
        }
        > div:first-child, .ant-layout-sider {
          flex: 0 0 var(--acx-sider-width) !important;
          max-width: var(--acx-sider-width) !important;
          min-width: var(--acx-sider-width) !important;
          width: var(--acx-sider-width) !important;
          transition: all 0.2s !important;
        }
        .ant-menu-submenu-popup { visibility: hidden; }
        .ant-menu-submenu-open .ant-menu-submenu-popup {
          height: auto;
          border-left: unset;
          visibility: visible;
          transition: visibility 1s;
          &.layout-group-horizontal .ant-menu {
            display: flex;
            flex-flow: row;
          }
          .ant-menu {
            margin-left: -4px;
            box-shadow: none;
            border-radius: 0;
            background-color: var(--acx-neutrals-70);
            padding-top: 8px;
            .ant-menu-item {
              cursor: default;
              height: 40px;
              width: 100%;
              border-left: unset;
              margin: auto;
              font-family: var(--acx-accent-brand-font);
              line-height: var(--acx-headline-5-line-height);
              font-size: var(--acx-headline-5-font-size);
              font-weight: var(--acx-headline-5-font-weight);
              padding: 8px 16px 16px !important;
              &:active { background: unset; }
              &.menu-active > .ant-menu-title-content a {
                &, &:hover {
                  color: var(--acx-accents-orange-50);
                  font-weight: var(--acx-headline-4-font-weight-bold);
                }
              }
              .ant-menu-title-content {
                padding-left: unset;
                font-family: var(--acx-accent-brand-font);
                font-size: var(--acx-headline-4-font-size);
                line-height: var(--acx-headline-4-line-height);
                font-weight: var(--acx-headline-4-font-weight);
                color: var(--acx-neutrals-20);
                a {
                  font-family: var(--acx-accent-brand-font);
                  font-size: var(--acx-headline-4-font-size);
                  line-height: var(--acx-headline-4-line-height);
                  font-weight: var(--acx-headline-4-font-weight);
                  color: var(--acx-neutrals-20);
                  // https://css-tricks.com/bold-on-hover-without-the-layout-shift/
                  display: inline-flex;
                  flex-direction: column;
                  &:after {
                    content: attr(data-label);
                    height: 0;
                    visibility: hidden;
                    overflow: hidden;
                    user-select: none;
                    pointer-events: none;
                    @media speech { display: none; }
                  }
                  &:after, &:hover {
                    color: var(--acx-neutrals-10);
                    font-weight: var(--acx-headline-4-font-weight-bold);
                  }
                }
              }
              &-selected { background-color: unset; }
            }
            .ant-menu-item-group {
              min-width: 180px;
              margin-top: -8px; // cancel off 8px top padding of .ant-menu
              &-title {
                height: 28px;
                font-family: var(--acx-neutral-brand-font);
                font-size: var(--acx-subtitle-5-font-size);
                line-height: var(--acx-subtitle-5-line-height);
                font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
                color: var(--acx-neutrals-20);
                opacity: 0.6;
                padding: 8px 16px 4px;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
    &.sider-collapsed {
      .ant-layout.ant-layout-has-sider {
        > div:first-child {
          flex: 0 0 var(--acx-sider-collapsed-width) !important;
          max-width: var(--acx-sider-collapsed-width) !important;
          min-width: var(--acx-sider-collapsed-width) !important;
          width: var(--acx-sider-collapsed-width) !important;
          ${({ showScreen }) => (!showScreen &&
          `@media screen and (min-width: 1279px) {
            display: none;
          }`)}
        }
        .ant-layout-sider {
          flex: 0 0 var(--acx-sider-collapsed-width) !important;
          max-width: var(--acx-sider-collapsed-width) !important;
          min-width: var(--acx-sider-collapsed-width) !important;
          width: var(--acx-sider-collapsed-width) !important;
        }
        .ant-menu {
          &.ant-menu-inline-collapsed { width: unset; }
        }
        .ant-menu-submenu-title {
          color: transparent;
        }
        .ant-menu-title-content { padding-left: 8px; }
        .ant-menu-item {
          .ant-menu-title-content {
            color: transparent;
            a {
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              color: transparent;
            }
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
        gap: var(--acx-header-item-margin);
      }
    }

    .ant-layout-content {
      margin: 0;
      background-color: var(--acx-primary-white);
      ${({ showScreen }) => (!showScreen &&
      `@media screen and (max-width: 1279px) {
        background-image: url('${bgImageUrl}');
        background-size: cover;
        background-repeat: no-repeat;
      }`)}
    }
  }
`

export const MenuGlobalStyle = createGlobalStyle`
  .ant-tooltip.ant-menu-inline-collapsed-tooltip {
    .ant-tooltip-inner {
      font-family: var(--acx-accent-brand-font);
      font-size: var(--acx-headline-4-font-size);
      padding: 10px 10px 10px 3px;
      svg { display: none; }
    }
  }

  .ant-menu-vertical.ant-menu-sub,
  .ant-menu-vertical-left.ant-menu-sub,
  .ant-menu-vertical-right.ant-menu-sub {
    min-width: 180px;
  }
`

export const MenuIcon = styled.span`
  margin-right: 8px;
  color: var(--acx-primary-white) !important;
  > svg {
    height: 20px;
    width: 20px;
    vertical-align: middle;
    margin-top: -3px;

    .invert { color: var(--acx-primary-black); }
  }
`

export const Content = styled.div`
  margin: var(--acx-content-vertical-space) var(--acx-content-horizontal-space);
  min-width: calc(
    ${modifyVars['@screen-xl']}
    - var(--acx-sider-width)
    - var(--acx-content-horizontal-space) * 2
  );
  min-height: calc(100vh - var(--acx-header-height) - var(--acx-content-vertical-space) * 2);
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
    z-index: 6;
  }

  > .ant-alert {
    position: sticky;
    top: calc(var(--acx-header-height) + var(--acx-content-vertical-space));
    z-index: 6;
    box-shadow: var(--acx-primary-white) 0px 5px 0 15px;
  }
`

export const IframeContent = styled(Content)`
  margin: 15px 20px 25px 20px !important;
`

export const ResponsiveContent = styled.div`
  min-width: 100%;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
`

export const LeftHeaderContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: var(--acx-header-item-margin);
  gap: var(--acx-header-item-margin);
  height: 100%;
`

export const RightHeaderContentWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: end;
  flex-direction: row;
  align-items: center;
  gap: var(--acx-header-button-margin);
  height: 100%;
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
  &&& {
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
  }
`
const ButtonSolid = styled(Button)`
  > svg {
    stroke: var(--acx-neutrals-70);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  &:hover, &:focus {
    > svg {
      stroke: var(--acx-accents-orange-55);
    }
  }
`
export const LayoutUI = {
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
  DropdownCaretIcon: styled.span`{
    svg {
      width: var(--acx-header-caret-width);
      height: 100%;
      vertical-align: baseline;
      path {
        stroke: var(--acx-primary-white);
        fill: var(--acx-primary-white);
      }
    }
  }`,
  DropdownText: styled.span.attrs(props => ({ children: <Space>{props.children}</Space> }))`
    font-size: var(--acx-body-3-font-size);
    line-height: 1;
  ` as React.FC<React.PropsWithChildren>,
  ButtonOutlined: styled(Button)`
    > svg path {
      stroke: var(--acx-primary-white);
    }
  `,
  ButtonSolid,
  Divider: styled(AntDivider).attrs({ type: 'vertical' })`
    border-right: 1px solid var(--acx-neutrals-70);
    height: 32px;
    top: 0;
    margin: 0 var(--acx-header-divider-margin) 0
      calc(var(--acx-header-divider-margin) - 1px);
  `,
  CompanyName: styled.div`
    line-height: var(--acx-body-4-line-height);
    font-size: var(--acx-body-4-font-size);
    font-weight: var(--acx-body-font-weight);
    text-align: right;
    flex-shrink: 0;
    max-width: var(--acx-header-company-name-width);
    min-width: var(--acx-header-company-name-min-width);
    max-height: calc(2 * var(--acx-body-4-line-height));
    overflow: hidden;
    margin-right: calc(var(--acx-header-company-name-right-space) - 9px);
    padding-right: 9px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  `,
  UserNameButton: styled(ButtonSolid)`
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: var(--acx-headline-5-font-weight-bold);
    font-family: var(--acx-accent-brand-font);
    font-size: var(--acx-headline-5-font-size);
  `,
  LogOutIcon: styled(LogOut)`
    width: 16px;
    height: 16px;
  `
}
