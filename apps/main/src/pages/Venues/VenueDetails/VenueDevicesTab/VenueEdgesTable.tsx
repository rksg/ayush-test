import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Button }                                       from '@acx-ui/components'
import { EdgesTable, defaultEdgeTablePayload }          from '@acx-ui/rc/components'
import { useGetEdgeListQuery }                          from '@acx-ui/rc/services'
import { EdgeViewModel, useTableQuery, RequestPayload } from '@acx-ui/rc/utils'
import { useParams, TenantLink }                        from '@acx-ui/react-router-dom'


const SpaceWrapper = styled(Space)`
width: 100%;
margin: 12px 0px;
justify-content: flex-end;
`

export const VenueEdgesTable = () => {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery<EdgeViewModel, RequestPayload<unknown>, unknown>({
    useQuery: useGetEdgeListQuery,
    defaultPayload: {
      ...defaultEdgeTablePayload,
      fields: [
        'name',
        'deviceStatus',
        'type',
        'model',
        'serialNumber',
        'ip',
        'ports',
        'tags'
      ],
      filters: { venueId: [params.venueId] }
    }
  })

  return (<>
    <SpaceWrapper >
      <TenantLink to='/devices/edge/add' key='add'>
        <Button type='link'>{ $t({ defaultMessage: 'Add SmartEdge' }) }</Button>
      </TenantLink>
    </SpaceWrapper>

    <EdgesTable tableQuery={tableQuery}/>
  </>)
}