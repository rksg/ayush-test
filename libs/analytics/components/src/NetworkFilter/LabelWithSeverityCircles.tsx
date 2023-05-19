
import * as UI from './styledComponents'


type LabelProps = {
  severityCircles? : string[],
  name : string
}

export const SeverityCircles = (props: { severityCircles?: string[] }) => {
  const { severityCircles } = props
  return (<UI.SeverityContainer>
    {severityCircles?.map((severityCircle, index) => (
      <UI.SeveritySpan severity={severityCircle} key={index} />
    ))}
  </UI.SeverityContainer>)
}

export const LabelWithSeverityCircle = (props: LabelProps) => {
  const { name, severityCircles } = props
  return (
    <UI.LabelContainer>
      <UI.Label title={name}>
        {name}
      </UI.Label>
      <SeverityCircles severityCircles={severityCircles} />
    </UI.LabelContainer>
  )
}
