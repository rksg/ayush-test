import { Typography } from 'antd'
import styled         from 'styled-components'

export const RadioItemDescription = styled.div`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  margin-bottom: 4px;
  `

export const Description = styled.div`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  margin-bottom: 8px;
  `
export const InlineWarningDescription = styled.div`
  color: var(--acx-accents-orange-50);
  font-size: var(--acx-body-4-font-size);
  display: inline-block;
  `

export const ErrorDescription = styled.div`
  color: var(--acx-semantics-red-60);
  font-size: var(--acx-body-4-font-size);
  margin-bottom: 8px;
  `

export const DescriptionRow = styled.div`
  margin-bottom: 16px;
  `

export const TabLable = styled.div`
  display: flex;
  justify-content: center;
  max-width: 70px;
`

export const TabItem = styled.div`
  height: 400px;
`
export const Section = styled.div`
  margin-bottom: 40px;
  `

export const SettingsSectionTitle = styled.div`
  line-height: var(--acx-subtitle-3-line-height);
  font-size: var(--acx-subtitle-3-font-size);
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-3-font-weight);
  margin-bottom: 12px !important;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--acx-neutrals-30);
  `

export const RawInfo = styled.div`
  overflow-wrap: break-word;
  `

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
`
export const TooltipTitle = styled(Typography.Text)`
  color: var(--acx-neutrals-30);
  display: block;
`

export const CollapseTitle = styled.div`
  font-size: var(--acx-body-4-font-size);
  `

export const DescriptionText = styled(Typography.Text)`
  font-size: var(--acx-subtitle-5-font-size);
  display: block;
`

export const ButtonWrapper = styled.div`
 .ant-btn.ant-btn-default {
  &, &:hover {
    border-color: var(--acx-accents-orange-50) !important;
    color: var(--acx-accents-orange-50);
  }
 }
`

export const CollapseWrapper = styled.div`
.ant-collapse-content-box {
  padding-left: 0;
  padding-right: 0;
}
.ant-collapse-item {
  margin-bottom: 20px;
}
`

export const CollapsePanelContentWrapper = styled.div`
  margin-top: 10px;

`