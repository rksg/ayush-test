import { Typography } from 'antd'
import styled         from 'styled-components'

import { incidentSeverities }                                     from '@acx-ui/analytics/utils'
import { IncidentSeverities, cssStr, Subtitle, GridCol, GridRow } from '@acx-ui/components'

type SeveritySpanProps = {
  severity: IncidentSeverities
}

export const SeverityDot = styled.div.attrs((props: SeveritySpanProps) => props)`
  background-color: ${(props) => cssStr(incidentSeverities[props.severity]?.color)};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 10px 4px 0 0;
`
export const Count = styled(Typography.Title).attrs({ level: 2 })`
  font-size: 20px !important;
  font-weight: 600 !important;
  margin: 0 0 4px 2px !important;
`
export const Title = styled(Subtitle).attrs({ level: 5 })`
  margin: 0 !important;
  font-weight: 600 !important;
`
export const Impact = styled(Subtitle).attrs({ level: 5 })`
  font-size: 10px !important;
  font-weight: 400 !important;
  line-height: 10px !important;
  margin-top: 0 !important;
`
export const SeverityContainer = styled(GridCol).attrs({ col: { span: 12 } })`
  flex-direction: row;
  justify-content: center;
`
export const SeveritiesContainer = styled(GridRow).attrs({ gutter: [10, 10] })`
  margin: 0;
`
export const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`
