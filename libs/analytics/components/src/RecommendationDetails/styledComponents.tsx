import styled from 'styled-components'

import { InformationSolid } from '@acx-ui/icons'

export const DetailsHeader = styled.div`
  color: var(--acx-primary-black);
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 13px;
`

export const ValueDetails = styled.div`
  font-weight: 700;
  font-style: normal;
`

export const DetailsWrapper = styled.div`
  height: 120px
`

export const RecommendationDivider = styled.div`
  border-top:  1px solid var(--acx-neutrals-30);
  margin: 10px 0px;
`

export const RecommendationTitle = styled.div`
  color: var(--acx-neutrals-50);
  font-weight: 700;
  font-size: 12px;
  margin-top: 20px;
`

export const RecommendationCardWrapper = styled.div`
  margin-bottom: 15px;
`

export const KpiTitle = styled.span`
  line-height: 16px;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
`

export const KpiInfoIcon = styled(InformationSolid)`
  color: var(--acx-neutrals-30);
`

export const KpiLabel = styled.div`
  text-align: center;
  font-weight: 700;
  font-size: 30px;
  line-height: 40px;
`

export const StatusTrailDateLabel = styled.span`
  color: var(--acx-neutrals-50)
`

export const StatusTrailWrapper = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 18px
`