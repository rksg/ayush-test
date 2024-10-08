import styled, { createGlobalStyle } from 'styled-components/macro'

import { Alert as UIAlert } from '@acx-ui/components'

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

export const AlertNote = styled(UIAlert)`
  &.ant-alert-info {
    padding: 0px 0px;
    border-radius: 10px;
    background-color: var(--acx-accents-blue-10);
    border: 0px solid;
  }
`

export const BannerWrapper = styled.div`
  overflow: hidden;
  position: relative;
`

export const BannerBG = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  filter: invert(100%) opacity(0.8)
`

export const Banner = styled.div`
  position: relative;
  padding: 10px 15px;
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-4-font-weight);
  line-height: var(--acx-body-4-line-height);
  .title {
    font-family: var(--acx-accent-brand-font);
    font-size: var(--acx-headline-2-font-size);
    line-height: var(--acx-headline-2-line-height);
    font-weight: bolder;
  }
  .br-size {
    display: block;
    margin-bottom: 0.5em;
  }
`
