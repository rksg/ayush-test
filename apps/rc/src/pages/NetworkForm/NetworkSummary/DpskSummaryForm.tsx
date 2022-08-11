import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { NetworkSaveData, transformNetworkEncryption, transformDpskNetwork, DpskNetworkType } from '@acx-ui/rc/utils'

export function DpskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  const intl = useIntl()
  const $t = intl.$t
  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Security Protocol:' })}
        children={transformNetworkEncryption(summaryData.dpskWlanSecurity)}
      />
      {
        !summaryData.isCloudpathEnabled && (
          <>
            <Form.Item
              label={$t({ defaultMessage: 'Passphrase Format:' })}
              children={transformDpskNetwork(
                intl,
                DpskNetworkType.FORMAT,
                summaryData.passphraseFormat
              )}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Passphrase Length:' })}
              children={transformDpskNetwork(
                intl,
                DpskNetworkType.LENGTH,
                summaryData.passphraseLength
              )}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Passphrase Expiration:' })}
              children={transformDpskNetwork(
                intl,
                DpskNetworkType.EXPIRATION,
                summaryData.expiration
              )}
            />
          </>
        )
      }
    </>
  )
}

