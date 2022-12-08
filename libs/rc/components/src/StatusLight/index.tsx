import { Badge } from 'antd'

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

export function StatusLight (props: StatusLightProps) {
  return (
    <Badge
      color={props.config[props.data]?.color}
      text={props.config[props.data]?.text || props.data}
    />
  )
}
