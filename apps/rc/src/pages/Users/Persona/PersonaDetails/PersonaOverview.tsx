import { useMemo } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'
import { useParams }         from 'react-router-dom'
import AutoSizer             from 'react-virtualized-auto-sizer'

import { Button, Card, cssStr, Descriptions, DonutChart, GridCol, GridRow, Subtitle } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                   from '@acx-ui/feature-toggle'
import {
  IdentityGroupLink,
  NetworkSegmentationLink,
  PropertyUnitLink,
  useIsEdgeFeatureReady,
  ConnectionMeteringLink
} from '@acx-ui/rc/components'
import {
  useAllocatePersonaVniMutation,
  useGetConnectionMeteringByIdQuery,
  useGetEdgePinByIdQuery,
  useGetPropertyUnitByIdQuery,
  useGetUnitsLinkedIdentitiesQuery,
  useSearchIdentityClientsQuery
} from '@acx-ui/rc/services'
import { Persona, PersonaGroup, PersonaUrls } from '@acx-ui/rc/utils'
import { hasAllowedOperations }               from '@acx-ui/user'
import { getOpsApi, noDataDisplay }           from '@acx-ui/utils'


const identityClientDefaultSorter = {
  sortField: 'username',
  sortOrder: 'ASC'
}

export function PersonaOverview (props:
   { personaData?: Persona, personaGroupData?: PersonaGroup }
) {
  const { $t } = useIntl()
  const { personaGroupId, personaId } = useParams()
  const { personaData, personaGroupData } = props

  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const isMultipleIdentityUnits = useIsSplitOn(Features.MULTIPLE_IDENTITY_UNITS)

  const {
    identityDeviceCount,
    isClientsLoading,
    isClientsFetching
  } = useSearchIdentityClientsQuery({
    payload: {
      ...identityClientDefaultSorter,
      identityIds: [personaId],
      page: 1,
      pageSize: 1
    }
  }, {
    skip: !personaId,
    selectFromResult: ({ data, isLoading, isFetching }) => {
      return {
        identityDeviceCount: data?.totalCount ?? 0,
        isClientsLoading: isLoading,
        isClientsFetching: isFetching
      }
    }
  })

  const { data: pinData } = useGetEdgePinByIdQuery(
    { params: { serviceId: personaGroupData?.personalIdentityNetworkId } },
    { skip: !networkSegmentationEnabled || !personaGroupData?.personalIdentityNetworkId }
  )

  const identities = useGetUnitsLinkedIdentitiesQuery(
    {
      params: { venueId: personaGroupData?.propertyId },
      payload: {
        pageSize: 1, page: 1, sortOrder: 'ASC',
        filters: {
          personaId: personaId
        }
      }
    },
    { skip: !personaGroupData?.propertyId || !isMultipleIdentityUnits }
  )

  const { data: unitData } = useGetPropertyUnitByIdQuery({
    params: {
      venueId: personaGroupData?.propertyId,
      unitId: personaData?.identityId ?? identities?.data?.data[0]?.unitId
    }
  },
  {
    skip: !personaGroupData?.propertyId ||
        (!personaData?.identityId && !identities?.data?.data[0]?.unitId)
  }
  )
  const { data: connectionMetering } = useGetConnectionMeteringByIdQuery(
    { params: { id: personaData?.meteringProfileId } },
    { skip: !isConnectionMeteringEnabled || ! personaData?.meteringProfileId }
  )

  const vniRetryable = useMemo(() => {
    const { primary = true, revoked } = personaData ?? {}
    const hasPin = !!personaGroupData?.personalIdentityNetworkId
    return hasPin && primary && !revoked
  }, [personaData, personaGroupData])

  const [allocatePersonaVni, { isLoading: isVniAllocating }] = useAllocatePersonaVniMutation()

  const details = [
    { label: $t({ defaultMessage: 'Email' }), value: personaData?.email },
    { label: $t({ defaultMessage: 'Description' }), value: personaData?.description },
    { label: $t({ defaultMessage: 'Phone' }), value: personaData?.phoneNumber },
    { label: $t({ defaultMessage: 'Identity Group' }),
      value:
        <IdentityGroupLink
          name={personaGroupData?.name}
          personaGroupId={personaGroupData?.id}
        />
    },
    { label: $t({ defaultMessage: 'VLAN' }), value: personaData?.vlan },
    ...propertyEnabled
      ? [{ label: $t({ defaultMessage: 'Unit' }),
        value:
          <PropertyUnitLink
            showNoData={true}
            name={unitData?.name}
            venueId={personaGroupData?.propertyId}
            unitId={personaData?.identityId ?? unitData?.id}
          />
      }] : []
  ]

  const allocateVni = async () => {
    return await allocatePersonaVni({
      params: { groupId: personaGroupId, id: personaId }
    })
  }

  const netSeg = [
    { label: $t({ defaultMessage: 'Assigned Segment No.' }),
      value: personaData?.vni ??
        ((hasAllowedOperations([getOpsApi(PersonaUrls.allocateVni)]) && vniRetryable) ?
          <Space size={'middle'} align={'center'}>
            <Typography.Text>{noDataDisplay}</Typography.Text>
            <Button
              size={'small'}
              type={'default'}
              onClick={allocateVni}
              loading={isVniAllocating}
            >
              {$t({ defaultMessage: 'Retry Segment No.' })}
            </Button>
          </Space> : undefined)
    },
    { label: $t({ defaultMessage: 'Personal Identity Network' }),
      value:
        personaGroupData?.personalIdentityNetworkId
        && <NetworkSegmentationLink
          showNoData={true}
          name={pinData?.name}
          id={personaGroupData?.personalIdentityNetworkId}
        />
    },
    // TODO: API Integration - Fetch AP(get AP by port.macAddress?)
    { label: $t({ defaultMessage: 'Assigned AP' }),
      value:
        personaData?.ethernetPorts?.length !== 0
          ? [...new Set(personaData?.ethernetPorts?.map(port => port.name))].join(', ')
          : undefined
    },
    { label: $t({ defaultMessage: 'Ethernet Ports Assigned' }),
      value:
        personaData?.ethernetPorts?.length !== 0
          ? personaData?.ethernetPorts?.map(port => {
            return `LAN ${port.portIndex}`
          }).join(', ')
          : undefined
    }
  ]

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Identity Details' })}
          </Subtitle>
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {(networkSegmentationEnabled && personaGroupData?.personalIdentityNetworkId) &&
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Personal Identity Network' })}
            </Subtitle>
          }
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          {details.map(item =>
            <Descriptions key={item.label} labelWidthPercent={25}>
              <Descriptions.Item
                label={item.label}
                children={item.value ?? noDataDisplay}
              />
            </Descriptions>
          )}
        </GridCol>
        {(networkSegmentationEnabled && personaGroupData?.personalIdentityNetworkId) &&
          <GridCol col={{ span: 12 }}>
            {netSeg.map(item =>
              <Descriptions key={item.label} labelWidthPercent={25}>
                <Descriptions.Item
                  label={item.label}
                  children={item.value ?? noDataDisplay}
                />
              </Descriptions>
            )}
            {
              isConnectionMeteringEnabled &&
            <Descriptions key={'Data Usage Metering'} labelWidthPercent={25}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Data Usage Metering:' })}
                children={connectionMetering ?
                  <ConnectionMeteringLink
                    id={connectionMetering.id}
                    name={connectionMetering.name}/> :
                  noDataDisplay}
              />
            </Descriptions>
            }
          </GridCol>
        }
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }}/>
        <GridCol col={{ span: 12 }} style={{ height: '190px' }}>
          <Card
            title={$t({ defaultMessage: 'Associated Devices' })}>
            <AutoSizer>
              {({ width, height }) => (
                <DonutChart
                  style={{ width, height }}
                  title={$t({ defaultMessage: 'Wi-Fi' })}
                  showLoading={isClientsLoading || isClientsFetching}
                  data={[{
                    value: identityDeviceCount,
                    name: $t({ defaultMessage: 'Wi-Fi' }),
                    color: cssStr('--acx-semantics-green-50')
                  }]}
                />
              )}
            </AutoSizer>
          </Card>
        </GridCol>
      </GridRow>
    </>
  )
}
