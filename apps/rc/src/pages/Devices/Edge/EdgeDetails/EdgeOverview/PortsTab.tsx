import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow }              from '@acx-ui/components'
import { EdgePortsTable }                        from '@acx-ui/rc/components'
import { EdgePortStatus }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

export const PortsTab = ({ data }: { data: EdgePortStatus[] }) => {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)

  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/ports/ports-general`
    })
  }

  return <GridRow justify='end'>
    <Button
      size='small'
      type='link'
      onClick={handleClick}
    >
      {$t({ defaultMessage: 'Configure Port Settings' })}
    </Button>

    <GridCol col={{ span: 24 }}>
      <EdgePortsTable key='edge-ports-table' data={data} />
    </GridCol>
  </GridRow>
}