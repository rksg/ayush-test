import { RocketOutlined } from '@acx-ui/icons-new'

import * as UI from './styledComponents'

export function BetaIndicator () {
  return <UI.IconWrapper>
    <RocketOutlined size='sm' />
  </UI.IconWrapper>
}

export function getTitleWithIndicator (title: string, isMultiLinesText?: boolean) {
  return <UI.IndicatorWrapper $isMultiLinesText={isMultiLinesText} >
    {title}
    <BetaIndicator />
  </UI.IndicatorWrapper>
}