import styled from 'styled-components'

import { cssStr } from '@acx-ui/components'

type StatusLightProps = {
  config: {
    [key: string]: StatusLightConfig
  }
  data: string
}

type StatusLightConfig = {
  color: string
  text: string
}

type DotProps = {
  color: string
}

const Dot = styled.div.attrs((props: DotProps) => props)`
  &:before {
    background-color: ${(props) => cssStr(props.color)};
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: 10px 4px 0 0;
    content: "";
    display:inline-block;
  }
`

const StatusLight = (props: StatusLightProps) => {
  return (
    <Dot color={props.config[props.data]?.color}>
      {props.config[props.data]?.text}
    </Dot>
  )
}

export default StatusLight