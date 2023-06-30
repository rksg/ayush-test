import styled, { css } from 'styled-components/macro'

export const WrapperStyle = css`
  &.ant-tabs.ant-tabs-top {
    position: relative;
  }
`
export const ActionsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: var(--acx-modal-footer-small-button-space);
`