import { ReactComponent as ArrowChevronLeft }  from 'src/assets/icons/ArrowChevronLeft.svg'
import { ReactComponent as ArrowChevronRight } from 'src/assets/icons/ArrowChevronRight.svg'
import styled, { css }                         from 'styled-components/macro'

export const Wrapper = styled.div`
  --acx-sider-width: 180px;
  --acx-sider-collapsed-width: 60px;
  --acx-header-height: 60px;

  .ant-pro-basicLayout {
    .ant-layout.ant-layout-has-sider {
      .ant-layout-sider {
        overflow: visible !important;
        .ant-layout-sider-children {
          .ant-pro-sider-logo {
            width: var(--acx-sider-width);
            padding: 18px 20px;
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
      .ant-menu-item {
        border-left: 2px solid transparent;
        padding-left: 16px;
        &-selected {
          font-weight: 700;
          border-left-color: var(--acx-accents-orange-50);
        }
        .ant-menu-title-content {
          text-overflow: clip;
          .ant-pro-menu-item-title {
            transition: opacity .2s ease-in-out;
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
  }
`

export const Content = styled.div`
  background-color: var(--acx-neutrals-5);
  padding: 20px 40px;
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
  margin-left: 16px;
`
