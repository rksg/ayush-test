
import * as UI from './styledComponents'


type LabelProps = {
  severityCircles? : string[],
  name : string
}

export const LabelWithSeverityCicle = (props: LabelProps) => {
  const { name, severityCircles } = props
  return (
    <UI.LabelContainer>
      <UI.Label>
        {name}
      </UI.Label>
      <UI.SeverityContainer>
        {severityCircles?.map((severityCircle, index) => (
          <UI.SeveritySpan severity={severityCircle} key={index} />
        ))}
      </UI.SeverityContainer>
    </UI.LabelContainer>
  )
}
