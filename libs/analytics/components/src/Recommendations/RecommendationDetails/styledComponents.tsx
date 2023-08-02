import styled from 'styled-components'

import { BulbOutlined, InformationSolid } from '@acx-ui/icons'

import { Subtitle }            from '../../IncidentDetails/Insights/styledComponents'
import { withDottedUnderline } from '../styledComponents'

export const DetailsHeader = styled.div`
  color: var(--acx-primary-black);
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
`

export const ValueDetails = styled.div`
  font-weight: 700;
  font-style: normal;
`

export const ValueDetailsWithIcon = styled.span`
  vertical-align: middle;
`

export const DetailsWrapper = styled.div`
  height: auto;
`

export const Title = styled(Subtitle).attrs({ level: 2 })`
  margin-top: 40px;
`

export const KpiTitle = styled.span`
  line-height: 16px;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
`

export const InfoIcon = styled(InformationSolid)`
  color: var(--acx-neutrals-30);
  vertical-align: middle;
  margin-left: 4px;
`

export const KpiLabelWrapper = styled.div`
  display: block;
  text-align: center;
  font-weight: 700;
  font-size: 30px;
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
  font-size: 12px;
  font-weight: 400;
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

export const CrrmTitle = styled(Subtitle).attrs({ level: 2 })``

export const CrrmDiv = styled.div`
  padding-top: 20px;
`

export const LabelSpan = styled.span`
  font-weight: 700;
`

