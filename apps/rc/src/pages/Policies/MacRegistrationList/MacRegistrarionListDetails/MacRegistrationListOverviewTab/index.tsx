import { useEffect, useState } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { SummaryCard }                from '@acx-ui/components'
import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetMacRegListQuery,
  useLazyGetAdaptivePolicySetQuery
} from '@acx-ui/rc/services'

import { returnExpirationString } from '../../MacRegistrationListUtils'

import { NetworkTable } from './NetworkTable'

export function MacRegistrationListOverviewTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })
  const data = macRegistrationListQuery.data
  const [ policySetName, setPolicySetName ] = useState('')

  const [ getAdaptivePolicySet ] = useLazyGetAdaptivePolicySetQuery()

  const policyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  useEffect(() => {
    if(policyEnabled && data?.policySetId) {
      getAdaptivePolicySet({ params: { policySetId: data.policySetId } })
        .then(result => {
          if (result.data) {
            setPolicySetName(result.data.name)
          }
        })
    }
  }, [data])

  const macRegistrationInfo = [
    {
      title: $t({ defaultMessage: 'Name' }),
      content: data?.name,
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'List Expiration' }),
      content: returnExpirationString(data ?? {}) ?? '',
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Automatically clean expired entries' }),
      content: data?.autoCleanup ? $t({ defaultMessage: 'Yes' }) :
        $t({ defaultMessage: 'No' }),
      colSpan: 5
    },
    {
      title: $t({ defaultMessage: 'Default Access' }),
      content: data?.policySetId ? data?.defaultAccess : '',
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Adaptive Policy Set' }),
      content: policySetName,
      colSpan: 3
    }
  ]

  return (
    <Space direction={'vertical'}>
      <SummaryCard
        data={macRegistrationInfo}
        isLoading={macRegistrationListQuery.isLoading}
        isFetching={macRegistrationListQuery.isFetching}
      />
      <NetworkTable networkIds={data?.networkIds}/>
    </Space>
  )
}
