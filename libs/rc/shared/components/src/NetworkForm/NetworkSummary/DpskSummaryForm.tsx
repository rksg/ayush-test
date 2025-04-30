import { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }   from '@acx-ui/feature-toggle'
import { useGetDpskListQuery, useGetEnhancedDpskTemplateListQuery } from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  transformNetworkEncryption,
  transformDpskNetwork,
  DpskNetworkType,
  DpskSaveData,
  transformAdvancedDpskExpirationText,
  TableResult,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplate,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

import { AaaSummary } from './AaaSummary'

export function DpskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  const intl = useIntl()
  const $t = intl.$t

  const { isTemplate } = useConfigTemplate()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const { data: dpskList } = useConfigTemplateQueryFnSwitcher<TableResult<DpskSaveData>>({
    useQueryFn: useGetDpskListQuery,
    useTemplateQueryFn: useGetEnhancedDpskTemplateListQuery
  })
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
      {summaryData?.dpskWlanSecurity !== WlanSecurityEnum.WPA23Mixed && <Form.Item
        label={$t({ defaultMessage: 'Use RADIUS Server:' })}
        children={
          (summaryData.isCloudpathEnabled || summaryData.wlan?.macAddressAuthentication) &&
          summaryData.authRadius
            ? $t({ defaultMessage: 'Yes' })
            : $t({ defaultMessage: 'No' })
        }
      />}
      {supportRadsec && summaryData.isCloudpathEnabled &&
         (summaryData.authRadius && !summaryData.wlan?.macRegistrationListId) &&
       <AaaSummary summaryData={summaryData} />
      }
    </>
  )
}

