import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.div`
  .description {
    padding: 12px;
    background-color: var(--acx-neutrals-15);
  }
`

export const Spacer = styled.div`
  height: var(--acx-descriptions-space);
`

export const dialogStyles = css`
  .email_mobile_help .ant-form-item-control {
    display: none;
  }
`