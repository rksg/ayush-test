import { ReactNode, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps }                                                              from '@acx-ui/components'
import {
  useLazyGetPropertyUnitByIdQuery, useLazySearchPersonaGroupListQuery, useLazyVenuesListQuery
} from '@acx-ui/rc/services'
import { Persona } from '@acx-ui/rc/utils'

import { PersonaDetailsLink, PropertyUnitLink, VenueLink } from '../LinkHelper'

const defaultVenueListPayload = {
  fields: [
    'id',
    'name'
  ],
  filters: { id: [] }
}

export interface ConnectionMeteringInstanceItem {
  unitId: string,
  personas: Persona[],  // contains UnitPersona and GuestPersona
  groupId: string,      // use the group id of the UnitPersona
  segment?: number      // use the vni of the UnitPersona
}

export function ConnectionMeteringInstanceTable (props: { data: Persona[] }) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [datasource, setDatasource] = useState<ConnectionMeteringInstanceItem[]>()

  const [propertyUnitMap, setPropertyUnitMap] = useState(new Map<string, string>())
  const [groupVenueMap, setGroupVenueMap] = useState(new Map<string, string>())
  const [venueMap, setVenueMap] = useState(new Map<string, string>())

  const [searchPersonaGroups, { isLoading: isGroupLoading }] = useLazySearchPersonaGroupListQuery()
  const [getVenues, { isLoading: isVenueLoading }] = useLazyVenuesListQuery()
  const [getUnitById, { isLoading: isPropertyUnitLoading }] = useLazyGetPropertyUnitByIdQuery()

  useEffect(() => {
    setDatasource(toInstance(props.data))
  }, [props.data])

  useEffect(() => {
    if (groupVenueMap.size === 0) return
    fetchVenueData([...groupVenueMap.values()])
    fetchPropertyUnits()
  }, [groupVenueMap])

  const toInstance = (personas: Persona[]): ConnectionMeteringInstanceItem[] => {
    const personaGroupSet = new Set<string>()
    const unitPersonaMap = new Map<string, Persona[]>()

    personas.forEach(p => {
      if (p.identityId) {
        unitPersonaMap.set(p.identityId, [...unitPersonaMap?.get(p.identityId) ?? [], p])
      }

      personaGroupSet.add(p.groupId)
    })

    fetchPersonaGroups([...personaGroupSet])

    const instanceItems: ConnectionMeteringInstanceItem[] = []

    unitPersonaMap.forEach((personas, unitId) => {
      instanceItems.push({
        unitId,
        personas,
        groupId: personas[0]?.groupId,
        segment: personas[0]?.vni
      })
    })

    return instanceItems
  }

  const fetchPersonaGroups = (groupIds: string[]) => {
    if (groupIds.length === 0) return
    searchPersonaGroups({
      params: { size: `${groupIds.length}`, page: '0' },
      payload: { groupIds }
    }).then(result => {
      if (result.data?.data) {
        result.data.data.forEach(group => {
          if (group.propertyId) {
            setGroupVenueMap(map => new Map(map.set(group.id, group.propertyId!)))
          }
        })
      }
    })
  }

  const fetchVenueData = (venueIds: string[]) => {
    const payload = { ...defaultVenueListPayload, filters: { id: venueIds } }
    getVenues({ params: { tenantId }, payload })
      .then(result => {
        if (result.data?.data) {
          setVenueMap(new Map(result.data?.data?.map(v => [v.id, v.name])))
        }
      })
  }

  const fetchPropertyUnits = () => {
    datasource?.forEach(({ unitId, groupId }) => {
      getUnitById({ params: { venueId: groupVenueMap.get(groupId), unitId } })
        .then(result => {
          if (result.data) {
            const { name } = result.data
            setPropertyUnitMap(map => new Map(map.set(unitId, name)))
          }
        })
    })
  }

  const columns: TableProps<ConnectionMeteringInstanceItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'Unit' }),
      dataIndex: 'unitId',
      key: 'unitId',
      render: (_, { unitId, groupId }) =>
        <PropertyUnitLink
          id={unitId}
          venueId={groupVenueMap.get(groupId)}
          name={propertyUnitMap.get(unitId)}
        />
    },
    {
      title: $t({ defaultMessage: 'Persona' }),
      dataIndex: 'personas',
      key: 'personas',
      render: (_, { personas })=>
        personas
          .map<ReactNode>(persona=> <PersonaDetailsLink key={persona.id} {...persona}/>)
          .reduce((prev, curr) => [prev, ', ', curr])
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueId',
      key: 'venueId',
      render: (_, { groupId }) => {
        const venueId = groupVenueMap.get(groupId)
        return (
          <VenueLink
            venueId={venueId}
            name={venueId ? venueMap.get(venueId) : undefined}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Segment #' }),
      dataIndex: 'segment',
      key: 'segment'
    }
  ]

  return (
    <>
      <Card.Title>
        {$t({ defaultMessage: 'Instances' })} ({propertyUnitMap.size})
      </Card.Title>
      <Table<ConnectionMeteringInstanceItem>
        loading={isGroupLoading || isVenueLoading || isPropertyUnitLoading}
        columns={columns}
        dataSource={datasource}
        rowKey='unitId'
      />
    </>
  )
}
