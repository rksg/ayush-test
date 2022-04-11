import AaaDiagram         from 'src/assets/images/network-wizard-diagrams/aaa.png'
import { Diagram, Title } from '../styledComponents'

export function NetworkDiagram () {

  return (
    <div style={{ marginTop: 24 }}>
      <Title>Enterprise AAA </Title>
      <Diagram>
        <img src={AaaDiagram} alt='Background'></img>
      </Diagram>
    </div>
  )
}