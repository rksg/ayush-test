import { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { useGetDpskListQuery } from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  transformNetworkEncryption,
  transformDpskNetwork,
  DpskNetworkType,
  DpskSaveData
} from '@acx-ui/rc/utils'

export function DpskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  const intl = useIntl()
  const $t = intl.$t
  const { data: dpskList } = useGetDpskListQuery({})
  const [ selectedDpsk, setSelectedDpsk ] = useState<DpskSaveData>()

  useEffect(() => {
    if (dpskList?.data) {
      setSelectedDpsk(dpskList.data.find(dpsk => dpsk.id === summaryData.dpskServiceProfileId))
    }
  }, [summaryData.dpskServiceProfileId, dpskList])

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Security Protocol:' })}
        children={transformNetworkEncryption(summaryData.dpskWlanSecurity)}
      />
      {!summaryData.isCloudpathEnabled &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'DPSK Service:' })}
            children={
              selectedDpsk && selectedDpsk.name
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Format:' })}
            children={
              selectedDpsk &&
              transformDpskNetwork(intl, DpskNetworkType.FORMAT, selectedDpsk.passphraseFormat)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Length:' })}
            children={
              selectedDpsk &&
              transformDpskNetwork(intl, DpskNetworkType.LENGTH, selectedDpsk.passphraseLength)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Expiration:' })}
            children={<p>TODO</p>}
            // TODO
            // children={
            //   transformAdvancedDpskExpirationText(
            //     intl,
            //     {
            //       expirationType: data.expirationType,
            //       expirationDate: data.expirationDate,
            //       expirationOffset: data.expirationOffset
            //     }
            //   )
            // }
          />
        </>
      }
    </>
  )
}

