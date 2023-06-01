import styled, { css } from 'styled-components/macro'

export const DropdownPortal = styled.div`
  > div {
    /** Forcefully reset the absolute positioning from the rc-cascader */
    position: static !important;
    width: auto !important;
  }

  border: 1px solid var(--acx-neutrals-30);
  border-radius: 4px;
  margin-block-start: 4px;
`

export const cascaderStyles = css`
  &.ant-select-dropdown {
    box-shadow: none;
    min-width: unset !important;
    position: static !important;
  }

  &:not(.ant-select-customize-input) .ant-select-selector {
    border-color: var(--acx-neutrals-30);
  }

  .ant-cascader-menu {
    &:last-child { border-right: none; }

    // show minimum 9 venues + partial of 10th to indicate scrollable
    // 4px for top padding
    height: calc(32px * 9.5 + 4px);
  }
`
