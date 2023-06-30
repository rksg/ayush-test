import * as UI from './styledComponents'

export function ClientHealthIcon (props: {
    type: string
    height?: string
  }) {
  const height = props.height || '20px'

  return <UI.HealthIcon $type={props.type} $height={height}/>
}
