import { Typography } from 'antd'
import styled         from 'styled-components'


export const Description = styled.div`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  margin-bottom: 8px;
  `

export const DescriptionRow = styled.div`
  margin-bottom: 16px;
  `

export const Section = styled.div`
  margin-bottom: 40px;
  `

export const RawInfo = styled.div`
  overflow-wrap: break-word;
  `

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
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