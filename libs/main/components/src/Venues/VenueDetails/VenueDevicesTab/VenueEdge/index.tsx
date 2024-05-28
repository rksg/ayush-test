import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Button }                            from '@acx-ui/components'
import { EdgesTable, EdgesTableQueryProps  } from '@acx-ui/rc/components'
import { useParams, TenantLink }             from '@acx-ui/react-router-dom'
import { EdgeScopes }                        from '@acx-ui/types'
import { hasPermission }                     from '@acx-ui/user'

const SpaceWrapper = styled(Space)`
  width: 100%;
  margin: 12px 0px;
  justify-content: flex-end;
`

export const VenueEdge = () => {
  const { $t } = useIntl()
  const params = useParams()

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
        'firmwareVersion'
      ],
      filters: { venueId: [params.venueId] }
    },
    pagination: { settingsId }
  }

  return (<>
    {hasPermission({ scopes: [EdgeScopes.CREATE] }) &&
    <SpaceWrapper>
      <TenantLink to='/devices/edge/add' key='add'>
        <Button type='link'>{ $t({ defaultMessage: 'Add SmartEdge' }) }</Button>
      </TenantLink>
    </SpaceWrapper>
    }

    <EdgesTable tableQuery={tableQuery} filterColumns={['venue']} settingsId={settingsId} />
  </>)
}
