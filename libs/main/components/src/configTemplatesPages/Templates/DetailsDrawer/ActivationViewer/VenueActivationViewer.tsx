import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  useGetApGroupsTemplateListQuery, useGetNetworkTemplateListQuery,
  useGetSyslogPolicyTemplateListQuery, useGetVenuesTemplateListQuery
} from '@acx-ui/rc/services'
import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { DetailsItemList } from '../DetailsContent'

import { ActivationViewerProps } from '.'

export function VenueActivationViewer ({ type, templateId }: ActivationViewerProps) {
  const { $t } = useIntl()
  const { names, isLoading } = useVenueActivationNames(type, templateId)

  return <DetailsItemList
    title={$t({ defaultMessage: 'Active on <VenuePlural></VenuePlural>' })}
    items={names}
    isLoading={isLoading}
  />
}

export function useVenueActivationNames (type: ConfigTemplateType, templateId: string) {
  const [ venueIds, setVenueIds ] = useState<string[]>([])

  const { data: networkList, isLoading: isNetworkListLoading } = useGetNetworkTemplateListQuery({
    payload: { fields: ['id', 'venueApGroups'], filters: { id: [templateId] } },
    enableRbac: true
  }, { skip: type !== ConfigTemplateType.NETWORK })


  const { data: syslogList, isLoading: isSyslogListLoading } = useGetSyslogPolicyTemplateListQuery({
    payload: { fields: ['id', 'venueIds'], filters: { id: [templateId] } },
    enableRbac: true
  }, { skip: type !== ConfigTemplateType.SYSLOG })

  const { data: apGroupList, isLoading: isApGroupListLoading } = useGetApGroupsTemplateListQuery({
    payload: { fields: ['id', 'venueId'], searchTargetFields: ['id'], searchString: templateId },
    enableRbac: true
  }, { skip: type !== ConfigTemplateType.AP_GROUP })

  const { data: venuesList, isLoading: isVenuesListLoading } = useGetVenuesTemplateListQuery({
    params: {}, payload: { fields: ['id', 'name'], filters: { id: venueIds } },
    enableRbac: true
  }, { skip: venueIds.length === 0 })

  useEffect(() => {
    if (networkList) {
      setVenueIds(networkList.data[0]?.venues.ids || [])
    }
  }, [networkList])

  useEffect(() => {
    if (syslogList) {
      setVenueIds(syslogList.data[0]?.venueIds || [])
    }
  }, [syslogList])

  useEffect(() => {
    if (apGroupList) {
      setVenueIds(apGroupList.data[0]?.venueId ? [apGroupList.data[0].venueId] : [])
    }
  }, [apGroupList])

  return {
    names: venueIds.length === 0 ? [] : venuesList?.data?.map(venue => venue.name) || [],
    isLoading: isVenuesListLoading
      || isNetworkListLoading
      || isSyslogListLoading
      || isApGroupListLoading
  }
}
