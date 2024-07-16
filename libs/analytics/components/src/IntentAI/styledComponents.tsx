import styled, { createGlobalStyle } from 'styled-components/macro'

export const IntentAITableStyle = createGlobalStyle`
  .intentai-table {
    .ant-picker-suffix {
      margin: 0 !important;
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