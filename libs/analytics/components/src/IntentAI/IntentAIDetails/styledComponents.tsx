import styled, { css } from 'styled-components'

import { GridCol, TrendPill as Pill }                                  from '@acx-ui/components'
import { AIDrivenRRM, BulbOutlined, DeleteOutlined, InformationSolid } from '@acx-ui/icons'

import { Subtitle } from '../../IncidentDetails/Insights/styledComponents'

export const detailsHeaderFontStyles = css`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-3-font-size);
  line-height: var(--acx-headline-3-line-height);
  font-weight: var(--acx-headline-3-font-weight);
`

export const DetailsHeader = styled.div`
  ${detailsHeaderFontStyles}
  margin-bottom: 12px;
`

export const ValueDetails = styled.div`
  font-weight: var(--acx-body-font-weight-bold);
`

export const ValueDetailsWithIcon = styled.span`
  vertical-align: middle;
`

export const DetailsWrapper = styled.div`
  height: auto;
`

export const Title = styled(Subtitle).attrs({ level: 2 })`
  margin-top: 40px;
  &:first-child { margin-top: 0; }
`

export const KpiTitle = styled.span`
  text-align: center;
  vertical-align: middle;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const InfoIcon = styled(InformationSolid)`
  color: var(--acx-neutrals-30);
  vertical-align: middle;
  margin-left: 4px;
`

export const KpiLabelWrapper = styled.div`
  display: block;
  text-align: center;
  font-weight: var(--acx-body-font-weight-bold);
  font-size: 30px; // exceptional, not in DS
  line-height: 40px;
`

export const KpiLabelValue = styled.span`
  position: relative;
`

export const KpiLabelExtra = styled.span`
  position: absolute;
  margin-left: 5px;
  margin-top: -8px;
`

export const StatusTrailDateLabel = styled.span`
  color: var(--acx-neutrals-50);
  margin-right: 10px;
`

export const StatusTrailItemWrapper = styled.div`
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: 18px;
`

export const StatusTrailWrapper = styled.div`
  max-height: 150px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: -30px;
`

export const KpiContentWrapper = styled.div`
  text-align: center;
`

export const KpiWrapper = styled.div`
  padding-bottom: 10px;
`

export const BulbOutlinedIcon = styled(BulbOutlined)`
  width: 24px;
  height: 24px;
  margin-top: 2px;
`

export const CrrmValuesText = styled.div`
  padding-top: 20px;
`

export const DeleteOutlinedIcon = styled(DeleteOutlined)`
  height: 24px;
  width: 24px;
  cursor: pointer;
`

export const AIDrivenRRMHeader = styled(GridCol).attrs({ col: { span: 24 } })`
  ${detailsHeaderFontStyles}
  margin-bottom: 12px;
  display: flex;
  justify-items: center;
  flex-direction: row;
  align-items: center;
`

export const AIDrivenRRMIcon = styled(AIDrivenRRM)`
  height: 48px;
  width: 48px;
  min-width: 48px;
  margin-right: 10px;
`

export const BenefitsHeader = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight-bold);
  margin-bottom: 12px;
`

export const BenefitsBody = styled.div`
  display: flex;
  align-items: center;
`

export const BenefitsValue = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: var(--acx-headline-2-font-weight-bold);
`

export const Wrapper = styled.div`
  position: relative;
  margin-top: 40px;
`

export const TrendPill = styled(Pill)`
  width: 40px;
  text-align: center;
  margin-left: 6px;
`
