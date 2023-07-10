import { Badge } from 'antd'

type StatusLightProps = {
  config: {
    [key: string]: StatusLightConfig
  }
  data: string,
  showText?: boolean
}

type StatusLightConfig = {
  color: string
  text: string
}

export function StatusLight ({ config, data, showText = true }: StatusLightProps) {
  return (
    <Badge
      color={config[data]?.color}
      text={showText ? (config[data]?.text || data) : ''}
    />
  )
}
