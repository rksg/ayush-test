import styled, { css } from 'styled-components/macro'

export const StyledWrapper = styled.div`
  .ddosRateLimitingRulesFormItem .ant-form-item-control-input {
    min-height: 0;
  }

  .changeBtn.ant-btn-link {
    height: auto !important;
    padding-left: var(--acx-modal-footer-small-button-space) !important;
  }
`

export const ModalStyles = css`
  .ant-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`
