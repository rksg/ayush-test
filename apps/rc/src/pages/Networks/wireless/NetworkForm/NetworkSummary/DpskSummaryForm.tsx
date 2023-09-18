import { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { useDpskNewConfigFlowParams }   from '@acx-ui/rc/components'
import { useGetDpskListQuery }          from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  transformNetworkEncryption,
  transformDpskNetwork,
  DpskNetworkType,
  DpskSaveData,
  transformAdvancedDpskExpirationText
} from '@acx-ui/rc/utils'

export function DpskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  const intl = useIntl()
  const $t = intl.$t
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const { data: dpskList } = useGetDpskListQuery({ params: dpskNewConfigFlowParams })
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
      {!summaryData.isCloudpathEnabled && selectedDpsk &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'DPSK Service:' })}
            children={
              selectedDpsk.name
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Format:' })}
            children={
              transformDpskNetwork(intl, DpskNetworkType.FORMAT, selectedDpsk.passphraseFormat)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Length:' })}
            children={
              transformDpskNetwork(intl, DpskNetworkType.LENGTH, selectedDpsk.passphraseLength)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Passphrase Expiration:' })}
            children={
              transformAdvancedDpskExpirationText(intl, {
                expirationType: selectedDpsk.expirationType,
                expirationDate: selectedDpsk.expirationDate,
                expirationOffset: selectedDpsk.expirationOffset
              })
            }
          />
        </>
      }
    </>
  )
}

