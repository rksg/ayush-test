import { calculateSeverity } from '@acx-ui/analytics/utils'

import { ApOrSwitch } from './services'
import * as UI        from './styledComponents'

import { NodesWithSeverity } from '.'

type LabelProps = {
  nodes: ApOrSwitch[];
  nodesWithSeverities: NodesWithSeverity[];
  name: string;
  nodeType?: string;
}
const getSeverityCircles = (
  data: ApOrSwitch[],
  venueWiseSeverities: NodesWithSeverity[],
  sliceType?: string
) => {
  if (!venueWiseSeverities) return
  let severityArray = data.reduce((acc: string[], val: ApOrSwitch) => {
    venueWiseSeverities.forEach((apOrSwitchWithSeverity: NodesWithSeverity) => {
      const severity = calculateSeverity(apOrSwitchWithSeverity.severity[val?.mac])
      if (severity && !acc.includes(severity)) acc.push(severity)
    })
    return acc
  }, [])
  if (sliceType === 'venue')
    venueWiseSeverities.forEach((venue: NodesWithSeverity) => {
      if (venue.sliceType === 'zone') {
        const severity = calculateSeverity(venue?.severity[venue.venueName])
        if (severity && !severityArray.includes(severity)) severityArray.push(severity)
      }
    })
  return severityArray.sort()
}

export const LabelWithSeverityCicle = (props: LabelProps) => {
  const { nodes, nodesWithSeverities, name, nodeType } = props
  const severityCircles = getSeverityCircles(
    nodes,
    nodesWithSeverities,
    nodeType
  )

  return (
    <UI.LabelContainer>
      <UI.Label>{name}</UI.Label>
      <UI.SeverityContainer>
        {severityCircles?.map((severityCircle, index) => (
          <UI.SeveritySpan severity={severityCircle} key={index}/>
        ))}
      </UI.SeverityContainer>
    </UI.LabelContainer>
  )
}
