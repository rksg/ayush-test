import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Button, GridRow, Loader }               from '@acx-ui/components'
import { EdgePortsTable }                        from '@acx-ui/rc/components'
import { EdgePortStatus }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAccess }                             from '@acx-ui/user'

export const PortsTab = ({ data, isLoading }:
  { data: EdgePortStatus[], isLoading: boolean }) => {
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
    {hasAccess() &&
      <Button
        size='small'
        type='link'
        onClick={handleClick}
      >
        {$t({ defaultMessage: 'Configure Port Settings' })}
      </Button>
    }

    <Col span={24}>
      <Loader states={[{ isLoading }]}>
        <EdgePortsTable data={data} />
      </Loader>
    </Col>
  </GridRow>
}