import { Space as AntSpace, SpaceProps } from 'antd'
import styled                            from 'styled-components'

export const Space = styled((props: SpaceProps) =>
  <AntSpace {...props}/>
)`
  margin-bottom: 16px;
`

export const Div = styled.div``