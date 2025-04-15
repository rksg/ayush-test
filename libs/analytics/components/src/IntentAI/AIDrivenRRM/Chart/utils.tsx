import { IntlShape } from 'react-intl'

export const customTooltipText = (values: {
  xValue: string, yValue: number, xName: string, intl: IntlShape }) => {
  const { xValue, yValue, xName, intl } = values

  return intl.formatMessage(
    {
      defaultMessage:
        '{xName} <b>{xValue}</b>: <b>{yValue}</b> {yValue, plural, one {AP} other {APs}}'
    },
    {
      xValue,
      xName,
      yValue,
      b: (chunks: React.ReactNode) => <b>{chunks}</b>
    }
  )
}
