import { RocketOutlined16 as RocketOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

export function BetaIndicator () {
  return <UI.IconWrapper>
    <RocketOutlined />
  </UI.IconWrapper>
}

export function getTitleWithIndicator (title: string) {
  return <UI.IndicatorWrapper>
    {title}
    <BetaIndicator />
  </UI.IndicatorWrapper>
}