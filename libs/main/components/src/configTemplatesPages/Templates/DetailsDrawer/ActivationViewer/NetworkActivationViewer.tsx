import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { useGetAAAPolicyTemplateListQuery, useGetDpskTemplateQuery, useGetNetworkTemplateListQuery, useGetVenuesTemplateListQuery } from '@acx-ui/rc/services'
import { ConfigTemplateType }                                                                                                       from '@acx-ui/rc/utils'

import { DetailsItemList } from '../DetailsContent'

import { ActivationViewerProps } from '.'

export function NetworkActivationViewer ({ type, templateId }: ActivationViewerProps) {
  const { $t } = useIntl()
  const { names, isLoading } = useNetworkActivationNames(type, templateId)

  return <DetailsItemList
    title={$t({ defaultMessage: 'Active on Networks' })}
    items={names}
    isLoading={isLoading}
  />
}

function useNetworkActivationNames (type: ConfigTemplateType, templateId: string) {
  const [ networkIds, setNetworkIds ] = useState<string[]>([])
  const { data: venuesList, isLoading: isVenuesListLoading } = useGetVenuesTemplateListQuery({
    payload: { fields: ['id', 'networks'], filters: { id: [templateId] } },
    enableRbac: true
  }, { skip: type !== ConfigTemplateType.VENUE })

  const { data: dpskDetail, isLoading: isDpskDetailLoading } = useGetDpskTemplateQuery({
    params: { serviceId: templateId }
  }, { skip: type !== ConfigTemplateType.DPSK })

  const { data: aaaList, isLoading: isAaaListLoading } = useGetAAAPolicyTemplateListQuery({
    payload: { filters: { id: [templateId] } },
    enableRbac: true
  }, { skip: type !== ConfigTemplateType.RADIUS })

  const { data: networkList, isLoading: isNetworkListLoading } = useGetNetworkTemplateListQuery({
    payload: { fields: ['id', 'name'], filters: { id: networkIds } },
    enableRbac: true
  }, { skip: networkIds.length === 0 })

  useEffect(() => {
    if (dpskDetail) {
      setNetworkIds(dpskDetail.networkIds || [])
    }
  }, [dpskDetail])

  useEffect(() => {
    if (aaaList) {
      setNetworkIds(aaaList.data[0]?.networkIds || [])
    }
  }, [aaaList])

  if (type === ConfigTemplateType.VENUE) {
    return {
      names: venuesList?.data[0]?.networks?.names || [],
      isLoading: isVenuesListLoading
    }
  } else {
    return {
      names: networkIds.length === 0 ? [] : networkList?.data?.map((network) => network.name) || [],
      isLoading: isNetworkListLoading || isAaaListLoading || isDpskDetailLoading
    }
  }
}
