import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from './styledComponents'

export function WifiSignal (props: {
    snr?: number
    text: string
    showText?: boolean
  }) {
  const { $t } = useIntl()
  const { snr, showText = true, text } = props

  const snrStatus = (value?: number | string) => {
    const snr = Number(value)
    if (snr > 40) {
      return {
        status: 'excellent',
        tooltip: $t({ defaultMessage: 'Excellent' })
      }
    } else if (snr >= 26) {
      return {
        status: 'good',
        tooltip: $t({ defaultMessage: 'Good' })
      }
    } else if (snr >= 16) {
      return {
        status: 'low',
        tooltip: $t({ defaultMessage: 'Low' })
      }
    } else if (snr >= 10) {
      return {
        status: 'poor',
        tooltip: $t({ defaultMessage: 'Poor' })
      }
    }
    return {
      status: 'nosignal',
      tooltip: $t({ defaultMessage: 'No signal' })
    }
  }

  return <UI.WifiSignal>
    <Tooltip
      placement='bottom'
      title={snrStatus(snr)?.tooltip as string}
    >
      { showText && text ? text : '' }
      <UI.SNRSolidIcon $status={snrStatus(snr)?.status} />
    </Tooltip>
  </UI.WifiSignal>
}