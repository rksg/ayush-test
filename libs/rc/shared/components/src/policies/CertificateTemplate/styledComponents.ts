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

export const TabLabel = styled.div`
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

export const Title = styled(Typography.Title).attrs({ level: 3 })`
  font-size: var(--acx-steps-form-form-title-font-size);
  line-height: var(--acx-steps-form-form-title-line-height);
  font-weight: var(--acx-steps-form-form-title-font-weight);
`