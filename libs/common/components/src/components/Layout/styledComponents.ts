import styled, { css } from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

import modifyVars from '../../theme/modify-vars'

export const Wrapper = styled.div`
  .ant-pro-basicLayout {
    .ant-layout.ant-layout-has-sider {
      .ant-layout-sider {
        overflow: visible !important;
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
          background-color: var(--acx-neutrals-5);
          border-top-left-radius: 20px;
        }
      }
      .ant-menu-submenu{
        .ant-menu-submenu-title{
          border-left: 2px solid transparent;
          .ant-pro-menu-item {
            color: var(--acx-primary-white);
          }
        }
        &-selected {
          background-color: transparent;
          .ant-menu-submenu-title{
            font-weight: 600;
            border-left-color: var(--acx-accents-orange-50);
            background-color: var(--acx-neutrals-70);
          }
        }
        &-open {
          background-color: var(--acx-neutrals-80);
        }
        .ant-menu-sub {
          background-color: var(--acx-neutrals-80);
          .ant-menu-item{
            height: 32px;
            margin: auto;
            display: flex;
            align-items: center;
            background-color: var(--acx-neutrals-80);
            border-left-color: transparent;
            padding-left: 16px !important;
            font-size: var(--acx-headline-5-font-size);
            opacity: 60%;
            font-weight: 400;
            &-selected {
              opacity: 100%;
              font-weight: 600;
            }
          }
        }
      }
      .ant-menu-item {
        border-left: 2px solid transparent;
        padding-left: 16px;
        font-family: var(--acx-accent-brand-font);
        font-size: var(--acx-headline-4-font-size);
        line-height: 38px;
        &-selected {
          font-weight: 600;
          border-left-color: var(--acx-accents-orange-50);
        }
        .ant-menu-title-content {
          text-overflow: clip;
          .ant-pro-menu-item-title {
            transition: opacity .2s ease-in-out;
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
        .ant-menu-submenu{
          background-color: var(--acx-primary-black);
          .ant-menu-submenu-title {
            padding-left: 16px;
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
      }
    }
  }

  .ant-layout-header {
    width: 100% !important;
    height: var(--acx-header-height) !important;
    line-height: var(--acx-header-height) !important;
    .ant-pro-global-header {
      background-color: var(--acx-primary-black);
      padding: 0 20px 0 var(--acx-sider-width);
    }
  }

  .ant-layout-content {
    margin: 0;
    background-color: var(--acx-neutrals-5);
  }
`

export const Content = styled.div`
  margin: var(--acx-content-vertical-space) var(--acx-content-horizontal-space);
  min-width: calc(${modifyVars['@screen-xl']} - var(--acx-sider-width));
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
    background-color: var(--acx-neutrals-5);
    z-index: 2;
  }
`

const arrowStyle = css`
  path {
    stroke: var(--acx-primary-white);
  }
  vertical-align: middle;
`

export const ArrowCollapsed = styled(ArrowChevronRight)`
  ${arrowStyle}
`

export const Arrow = styled(ArrowChevronLeft)`
  ${arrowStyle}
`

export const TextWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-left: 12px;
`
