import styled from 'styled-components'

import { BulbOutlined, InformationSolid } from '@acx-ui/icons'

import { Subtitle }            from '../../IncidentDetails/Insights/styledComponents'
import { withDottedUnderline } from '../styledComponents'

export const DetailsHeader = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-3-font-size);
  line-height: var(--acx-headline-3-line-height);
  font-weight: var(--acx-headline-3-font-weight);
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
  &:first-child { margin-top: 0 }
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
  height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
`

export const RecommendationApImpacted = styled.span`
  cursor: pointer;
  ${withDottedUnderline}
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
