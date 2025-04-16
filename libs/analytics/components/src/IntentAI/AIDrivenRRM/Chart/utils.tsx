import { IntlShape } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

export const customTooltipText = (values: {
  xValue: string, yValue: number, xName: string, intl: IntlShape }) => {
  const { xValue, yValue, xName, intl } = values
  const count = formatter('countFormat')(yValue)

  return intl.formatMessage(
    {
      defaultMessage:
        '{xName} {xValue}: <b>{count} {count, plural, one {AP} other {APs}}</b>'
    },
    {
      xValue,
      xName,
      count,
      b: (chunks: React.ReactNode) => <b>{chunks}</b>
    }
  )
}
