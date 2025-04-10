import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Button, GridRow, Loader }                     from '@acx-ui/components'
import { EdgePortsTable }                              from '@acx-ui/rc/components'
import { EdgeLagStatus, EdgePortStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { EdgeScopes }                                  from '@acx-ui/types'
import { hasPermission }                               from '@acx-ui/user'
import { getOpsApi }                                   from '@acx-ui/utils'

interface PortsTabProps {
  isConfigurable: boolean
  portData: EdgePortStatus[]
  lagData: EdgeLagStatus[]
  isLoading: boolean
  handleClickLagName?: () => void
}

export const PortsTab = (props: PortsTabProps) => {
  const { portData, lagData, isLoading, handleClickLagName, isConfigurable } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)

  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/ports`
    })
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.updatePortConfig)
    ]
  })

  return <GridRow justify='end'>
    {hasUpdatePermission && isConfigurable &&
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
        <EdgePortsTable
          portData={portData}
          lagData={lagData}
          handleClickLagName={handleClickLagName}
        />
      </Loader>
    </Col>
  </GridRow>
}