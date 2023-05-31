/* eslint-disable max-len */
import { Checkbox, Cascader as AntCascader } from 'antd'
import styled, { createGlobalStyle }         from 'styled-components/macro'

import { InformationOutlined } from '@acx-ui/icons'

import type { BaseCascaderProps } from './BaseCascader'

export const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`
export const Label = styled.div<{ overrideMaxWidth?: boolean }>`
  ${props => props.overrideMaxWidth && 'max-width: 100% !important;'}
  overflow: hidden;
  text-overflow: ellipsis;
`
export const GlobalStyle = createGlobalStyle<{
  menuMaxWidth?: string
  labelMaxWidth?: string
}>`
  .ant-page-header-heading-extra {
    .ant-select-selector {
      border-color: var(--acx-primary-black) !important;
    }
    .ant-select-selection-placeholder {
      color: var(--acx-primary-black);
    }
  }

  .ant-cascader {
    width: 100%;
    // fixes extra space appearing when clicking on selected items
    > [aria-live='polite'] { display: none !important; }
    &-menus {
      max-width: ${(props) => props.menuMaxWidth ?? '100%'};
    }
    &-menu {
      overflow: auto;
      height: 215px;
      max-height: 100%;
      border-right: 1px solid var(--acx-neutrals-20);
      ${Label} {
        max-width: ${(props) => props.labelMaxWidth ?? '100%'};
      }
      &-item {
        &:hover {
          background-color: var(--acx-accents-orange-10);
        }
        &-active {
          &:not(:disabled) {
            background-color: var(--acx-accents-orange-20);
          }
        }
        &-content {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        &-expand {
          position: relative;
        }
        &-expand-icon {
          line-height: 1;
          span[role=img] {
            svg { display: none; }
            &::after {
              content: '';
              display: inline-block;
              width: 16px;
              height: 16px;
              background-color: var(--acx-neutrals-50);
              // encodeURIComponent(renderToStaticMarkup(<ChevronRight />))
              mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22currentColor%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M10%205.25%2016.75%2012%2010%2018.75%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
              -webkit-mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22currentColor%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M10%205.25%2016.75%2012%2010%2018.75%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
              mask-size: 16px 16px;
              -webkit-mask-size: 16px 16px;
            }
          }
        }
      }
    }
  }
`
export const Cascader = styled(AntCascader)<BaseCascaderProps>`
  .ant-select-focused {
    .ant-select-selection-placeholder {
      color: var(--acx-neutrals-50);
    }
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
