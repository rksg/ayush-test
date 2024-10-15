import { RocketOutlined, Size } from '@acx-ui/icons-new'

import * as UI from './styledComponents'

export function BetaIndicator ({ size = 'sm' }: { size?: Size }) {
  return (
    <UI.IconWrapper $size={size}>
      <RocketOutlined size={size} />
    </UI.IconWrapper>
  )
}

export function getTitleWithIndicator (title: string, isMultiLinesText?: boolean) {
  return <UI.IndicatorWrapper $isMultiLinesText={isMultiLinesText} >
    {title}
    <BetaIndicator />
  </UI.IndicatorWrapper>
}