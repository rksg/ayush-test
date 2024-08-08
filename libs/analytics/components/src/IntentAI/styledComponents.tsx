import styled, { createGlobalStyle } from 'styled-components/macro'

export const IntentAITableStyle = createGlobalStyle`
  .intentai-table {
    .ant-picker-suffix {
      margin: 0 !important;
    }
  }
`
export const ActionsText = styled.span`
  color: var(--acx-accents-blue-50);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`
export const ApplyModalStyle = createGlobalStyle`
  .intent-ai-optimize-modal {
    .ant-modal-confirm-content > span {
      display: inline-block;
    }
  }
`
export const FeatureIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  > svg {
    width: 16px;
    height: 16px;
  }
`
