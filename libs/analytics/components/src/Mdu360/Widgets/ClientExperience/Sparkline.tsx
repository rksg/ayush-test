import { cssStr, SparklineChart } from '@acx-ui/components'

import {
  SparklineBadge,
  SparklineItemContainer,
  SparklineText,
  ShortText
} from './styledComponents'

interface SparklineProps {
  name: string;
  percentageText: string;
  sparklineData: number[];
  shortText?: string;
}

const sparklineChartStyle = { height: 30, width: 120, display: 'inline' }

const getBadgeColor = (data: number[]) => {
  const first = data[0]
  const last = data[data.length - 1]
  const color =
    first > last
      ? cssStr('--acx-semantics-red-50')
      : cssStr('--acx-semantics-green-50')

  return color
}

const Sparkline = ({
  name,
  percentageText,
  sparklineData,
  shortText
}: SparklineProps) => {
  return (
    <SparklineItemContainer>
      <SparklineText>
        {name}
        <ShortText>{shortText}</ShortText>
      </SparklineText>
      <SparklineBadge
        color={getBadgeColor(sparklineData)}
        text={percentageText}
      />
      <SparklineChart
        data={sparklineData}
        style={sparklineChartStyle}
        isTrendLine
      />
    </SparklineItemContainer>
  )
}

export default Sparkline
