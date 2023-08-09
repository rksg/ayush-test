import * as UI from './styledComponents'

export const SeverityCircles = (props: { severityCircles?: string[] }) => {
  const { severityCircles } = props
  return (<UI.SeverityContainer>
    {severityCircles?.map((severityCircle, index) => (
      <UI.SeveritySpan severity={severityCircle} key={index} />
    ))}
  </UI.SeverityContainer>)
}
