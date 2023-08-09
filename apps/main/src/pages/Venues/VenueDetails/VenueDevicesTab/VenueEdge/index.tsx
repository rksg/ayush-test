import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Button }                            from '@acx-ui/components'
import { EdgesTable, EdgesTableQueryProps  } from '@acx-ui/rc/components'
import { useParams, TenantLink }             from '@acx-ui/react-router-dom'

const SpaceWrapper = styled(Space)`
  width: 100%;
  margin: 12px 0px;
  justify-content: flex-end;
`

export const VenueEdge = () => {
  const { $t } = useIntl()
  const params = useParams()

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
    }
  }

  return (<>
    <SpaceWrapper>
      <TenantLink to='/devices/edge/add' key='add'>
        <Button type='link'>{ $t({ defaultMessage: 'Add SmartEdge' }) }</Button>
      </TenantLink>
    </SpaceWrapper>

    <EdgesTable tableQuery={tableQuery} filterColumns={['venue']}/>
  </>)
}