import { useEffect, useState } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, SummaryCard }        from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
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

  const policyEnabled = useIsSplitOn(Features.POLICY_MANAGEMENT)

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
      title: $t({ defaultMessage: 'Access Policy Set' }),
      content: policySetName,
      colSpan: 3
    }
  ]

  return (
    <Space direction={'vertical'}>
      <Loader states={[
        macRegistrationListQuery,
        { isLoading: false }
      ]}>
        <SummaryCard data={macRegistrationInfo} />
      </Loader>
      <NetworkTable networkIds={data?.networkIds}/>
    </Space>
  )
}
