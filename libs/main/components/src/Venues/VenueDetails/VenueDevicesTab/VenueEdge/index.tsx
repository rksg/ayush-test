import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Button }                                                  from '@acx-ui/components'
import { Features }                                                from '@acx-ui/feature-toggle'
import { EdgesTable, EdgesTableQueryProps, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { useGetVenueEdgeCompatibilitiesQuery }                     from '@acx-ui/rc/services'
import { EdgeUrlsInfo, retrievedEdgeCompatibilitiesOptions }       from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                   from '@acx-ui/react-router-dom'
import { EdgeScopes }                                              from '@acx-ui/types'
import { hasPermission }                                           from '@acx-ui/user'
import { getOpsApi }                                               from '@acx-ui/utils'

import { CompatibilityCheck } from './CompatibilityCheck'

const SpaceWrapper = styled(Space)`
  width: 100%;
  margin: 12px 0px;
  justify-content: flex-end;
`

export const VenueEdge = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const settingsId = 'venue-edges-table'
  const tableQuery: EdgesTableQueryProps = {
    defaultPayload: {
      fields: [
        'name',
        'deviceStatus',
        'type',
        'model',
        'serialNumber',
        'ip',
        'ports',
        'tags',
        'firmwareVersion',
        'venueId',
        'incompatible'
      ],
      filters: { venueId: [params.venueId] }
    },
    pagination: { settingsId }
  }

  const { data: edgeCompatibilities } = useGetVenueEdgeCompatibilitiesQuery({ payload: {
    filters: {
      venueIds: [params.venueId]
    }
  } }, {
    skip: !isEdgeCompatibilityEnabled || !params.venueId
  })

  const featureIncompatible = retrievedEdgeCompatibilitiesOptions(edgeCompatibilities)
  const hasCreateEdgePermission = hasPermission({
    scopes: [EdgeScopes.CREATE],
    rbacOpsIds: [
      [
        getOpsApi(EdgeUrlsInfo.addEdge),
        getOpsApi(EdgeUrlsInfo.addEdgeCluster)
      ]
    ]
  })

  return (<>
    {hasCreateEdgePermission &&
      <SpaceWrapper direction='vertical' align='end' size={0}>
        {(isEdgeCompatibilityEnabled && edgeCompatibilities) &&
          <CompatibilityCheck
            data={edgeCompatibilities!.compatibilities ?? []}
            venueId={params.venueId}
          />
        }
        <TenantLink to='/devices/edge/add' key='add'>
          <Button type='link'>{ $t({ defaultMessage: 'Add RUCKUS Edge' }) }</Button>
        </TenantLink>
      </SpaceWrapper>
    }

    <EdgesTable
      tableQuery={tableQuery}
      filterColumns={['venue']}
      settingsId={settingsId}
      incompatibleCheck={isEdgeCompatibilityEnabled}
      filterables={{
        featureIncompatible: featureIncompatible.compatibilitiesFilterOptions
      }}
    />
  </>)
}