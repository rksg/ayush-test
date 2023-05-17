
import * as UI from './styledComponents'


type LabelProps = {
  name: string,
  severityCircles?: string[],
  maxWidth?: string
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
  const { name, severityCircles, maxWidth } = props
  return (
    <UI.LabelContainer>
      <UI.Label title={name} maxWidth={maxWidth}>
        {name}
      </UI.Label>
      <SeverityCircles severityCircles={severityCircles} />
    </UI.LabelContainer>
  )
}
