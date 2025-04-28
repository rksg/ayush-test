import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { useGetVenuesQuery, useGetVenuesTemplateListQuery }                     from '@acx-ui/rc/services'
import { ProfileLanVenueActivations, defaultSort, sortProp, useConfigTemplate } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                from '@acx-ui/react-router-dom'

interface VenueTableProps {
  venueActivations: ProfileLanVenueActivations[]
}

const useGetVenueNameMap = (venueGrouping: Record<string, string[]> ) => {
  const { tenantId } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { isTemplate } = useConfigTemplate()

  const payload = {
    fields: ['name', 'id'],
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 2048,
    filters: { id: Object.keys(venueGrouping) }
  }

  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: tenantId },
    enableRbac: isWifiRbacEnabled,
    payload
  }, {
    skip: !Object.keys(venueGrouping).length || isTemplate,
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data.reduce((venues, venue) => {
        venues[venue.id] = venue.name
        return venues
      }, {} as Record<string, string>)
    })
  } )

  const { tempVenueNameMap } = useGetVenuesTemplateListQuery({
    params: { tenantId: tenantId },
    enableRbac: isWifiRbacEnabled,
    payload
  }, {
    skip: !Object.keys(venueGrouping).length || !isTemplate,
    selectFromResult: ({ data }) => ({
      tempVenueNameMap: data?.data.reduce((venues, venue) => {
        venues[venue.id] = venue.name
        return venues
      }, {} as Record<string, string>)
    })
  } )

  return isTemplate? tempVenueNameMap : venueNameMap
}

export const VenueTable = (props: VenueTableProps) => {
  const { $t } = useIntl()
  const { venueActivations } = props

  const venueGrouping = useMemo(()=>{
    if(venueActivations.length > 0) {

      return venueActivations.reduce((acc, activation) => {
        const { venueId, apModel } = activation
        if (venueId !== undefined && apModel !== undefined) {
          if (!acc[venueId]) {
            acc[venueId] = []
          }
          acc[venueId].push(apModel)
        }

        return acc
      }, {} as Record<string, string[]>)
    }


    return {}
  }, [venueActivations])

  const venueNameMap = useGetVenueNameMap(venueGrouping)

  const tableResult = useMemo(() => {
    if (venueNameMap && venueGrouping) {
      return Array.from(Object.entries(venueGrouping)).map(([id, apModels]) => ({
        id,
        name: venueNameMap[id],
        apModels
      }))
    }
    return []
  }, [venueNameMap])

  const columns: TableProps<{ id: string; name: string; apModels: string[] }>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, row) => {
        return <TenantLink to={`/venues/${row.id}/venue-details/overview`}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'apModel',
      dataIndex: 'apModel',
      render: (_, row) => {
        return row.apModels.join(', ')
      }
    }
  ]

  return (
    <Table
      rowKey='name'
      columns={columns}
      dataSource={tableResult}
    />
  )
}
