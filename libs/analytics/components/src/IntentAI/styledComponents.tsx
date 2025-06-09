import styled, { createGlobalStyle } from 'styled-components/macro'

import { SettingsSolid } from '@acx-ui/icons'

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
export const SummaryFeatureIcon = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  > svg {
    width: 24px;
    height: 24px;
  }
  margin-right: 10px;
`

export const FeatureTooltip = styled.div`
  display: flex;
  gap: 10px;
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-4-font-weight);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-neutrals-30);
  .title {
    font-family: var(--acx-accent-brand-font);
    font-size: var(--acx-headline-3-font-size);
    line-height: var(--acx-headline-3-line-height);
    font-weight: bolder;
  }
  svg {
    height: 40px;
    width: 40px;
  }
  .br-size {
    display: block;
    margin-bottom: 0.5em;
  }
`

export const DownloadWrapper = styled.div`
  width: fit-content;
`

export const Setting = {
  Icon: styled(SettingsSolid)`
    width: 16px;
    height: 16px;
  `,
  Line: styled.div`
    border-bottom: 1px solid var(--acx-neutrals-25);
    margin: 16px 0;
    display: block;
    width: 100%;
    height: 2px;
  `
}