import { ReactNode, useEffect, useState } from 'react'

import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Card, Table, TableProps } from '@acx-ui/components'
import { formatter }               from '@acx-ui/formatter'
import {
  useLazyGetPropertyUnitByIdQuery,
  useLazySearchPersonaGroupListQuery,
  useLazyVenuesListQuery,
  useLazyGetQosStatsQuery
} from '@acx-ui/rc/services'
import { Persona, PersonaGroup, QosStats } from '@acx-ui/rc/utils'

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
  expirationDate?: string | null
}




export function ConnectionMeteringInstanceTable (props: { data: Persona[] }) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [datasource, setDatasource] = useState<ConnectionMeteringInstanceItem[]>()

  const [propertyUnitMap, setPropertyUnitMap] = useState(new Map<string, string>())
  const [groupMap, setGroupMap] = useState(new Map<string, PersonaGroup>())
  const [venueMap, setVenueMap] = useState(new Map<string, string>())
  const [statsMap, setStatsMap] = useState(new Map<string, QosStats>())

  const [searchPersonaGroups, { isLoading: isGroupLoading }] = useLazySearchPersonaGroupListQuery()
  const [getVenues, { isLoading: isVenueLoading }] = useLazyVenuesListQuery()
  const [getUnitById, { isLoading: isPropertyUnitLoading }] = useLazyGetPropertyUnitByIdQuery()
  const [getQosStats, { isLoading: isQosStatsLoading }] = useLazyGetQosStatsQuery()
  const bytesFormatter = formatter('bytesFormat')
  useEffect(() => {
    setDatasource(toInstance(props.data))
    fetchQosStats(props.data)
  }, [props.data])

  useEffect(() => {
    if (groupMap.size === 0) return
    fetchVenueData([...groupMap.values()]
      .filter((group)=> group.propertyId !== undefined)
      .map((group)=> group.propertyId!!))
    fetchPropertyUnits()
  }, [groupMap])

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
        segment: personas[0]?.vni,
        expirationDate: personas[0]?.expirationDate
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
            setGroupMap(map => new Map(map.set(group.id, group as PersonaGroup)))
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
      getUnitById({ params: { venueId: groupMap.get(groupId)?.propertyId, unitId } })
        .then(result => {
          if (result.data) {
            const { name } = result.data
            setPropertyUnitMap(map => new Map(map.set(unitId, name)))
          }
        })
    })
  }

  const fetchQosStats = (personas: Persona[]) => {
    const payload = [] as { field: string, value:string } [][]
    personas.forEach(persona => {
      payload.push([{ field: 'personaId', value: persona.id }])
    })
    getQosStats({ payload: payload })
      .then(result=> {
        if (result.data?.data) {
          setStatsMap(new Map(result.data.data?.map(v => [v.personaId, { ...v }])))
        }
      })
  }

  const getQosStatsByInstance = (instance: ConnectionMeteringInstanceItem):
    QosStats| undefined => {
    let result:QosStats | undefined = undefined
    instance.personas.forEach(persona => {
      let stats = statsMap.get(persona.id)
      if (stats) {
        if (!result) {
          result = { ...stats }
        } else {
          result.uploadPackets += stats.uploadPackets
          result.uploadBytes += stats.uploadBytes
          result.downloadBytes += stats.downloadBytes
          result.downloadPackets += stats.downloadPackets
        }
      }
    })
    return result
  }


  const columns: TableProps<ConnectionMeteringInstanceItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'Unit' }),
      dataIndex: 'unitId',
      key: 'unitId',
      render: (_, { unitId, groupId }) =>
        <PropertyUnitLink
          id={unitId}
          venueId={groupMap.get(groupId)?.propertyId}
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
        const venueId = groupMap.get(groupId)?.propertyId
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
    },
    {
      title: $t({ defaultMessage: 'Up Packets' }),
      dataIndex: 'upPackets',
      key: 'upPackets',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat) {
          return <span>{stat.uploadPackets}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Up Bytes' }),
      dataIndex: 'upBytes',
      key: 'upBytes',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat) {
          return <span>{bytesFormatter(stat.uploadBytes)}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Down Packets' }),
      dataIndex: 'downPackets',
      key: 'downPackets',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat) {
          return <span>{stat.downloadPackets}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Down Bytes' }),
      dataIndex: 'downBytes',
      key: 'downBytes',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat) {
          return <span>{formatter('bytesFormat')(stat.downloadBytes)}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Total Bytes' }),
      dataIndex: 'totalBytes',
      key: 'totalBytes',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat) {
          return <span>{bytesFormatter(stat.uploadBytes + stat.downloadBytes)}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Cycle Start Date' }),
      dataIndex: 'cycleStartDate',
      key: 'cycleStartDate',
      render: (_, row) => {
        const stat = getQosStatsByInstance(row)
        if (stat && stat.billingStartEpoch) {
          return <span>{moment(stat.billingStartEpoch * 1000).format('MM/DD/YYYY')}</span>
        }
        return undefined
      }
    },
    {
      title: $t({ defaultMessage: 'Data Consumption Expires' }),
      dataIndex: 'dataComsumptionExpires',
      key: 'dataConsumptionExpires',
      render: (_, row) => {
        if (row.expirationDate) {
          const expirationDate = moment(row.expirationDate)
          const expired = expirationDate.diff(moment.now()) < 0
          return <span style={expired ? { color: 'red' }: {}}>{
            expirationDate.format('MM/DD/YYYY')}</span>
        }
        return undefined
      }
    }
  ]

  const columnState: TableProps<ConnectionMeteringInstanceItem>['columnState'] = {
    defaultValue: {
      unitId: true,
      personas: true,
      segment: true,
      upPackets: true,
      upBytes: true,
      downPackets: true,
      downBytes: true,
      totalBytes: true,
      cycleStartDate: false,
      dataConsumptionExpires: false
    }
  }

  return (
    <>
      <Card.Title>
        {$t({ defaultMessage: 'Instances ({size})' }, { size: propertyUnitMap.size })}
      </Card.Title>
      <Table<ConnectionMeteringInstanceItem>
        loading={isGroupLoading || isVenueLoading || isPropertyUnitLoading || isQosStatsLoading}
        columns={columns}
        dataSource={datasource}
        columnState={columnState}
        rowKey='unitId'
        settingsId='connection-metering-detail-column-settings'
      />
    </>
  )
}
