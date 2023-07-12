import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, Loader, NoData, Tabs }          from '@acx-ui/components'
import { EdgePortStatus }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAccess }                             from '@acx-ui/user'

import { EdgeSubInterfacesTable } from './EdgeSubInterfacesTable'

export const EdgeSubInterfacesTab = ({ ports, isLoading }:
  { ports: EdgePortStatus[], isLoading: boolean }) => {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)

  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/ports/sub-interface`
    })
  }

  return <Row justify='end'>
    {hasAccess() &&
      <Button
        size='small'
        type='link'
        onClick={handleClick}
      >
        {$t({ defaultMessage: 'Configure Sub-interface Settings' })}
      </Button>
    }

    <Col span={24}>
      <Loader states={[{ isLoading }]}>
        {serialNumber && ports.length > 0
          ? <Tabs type='third'>
            {ports?.map((item) => {
              // subinterfaces mac === physical port mac
              return <Tabs.TabPane
                tab={$t({ defaultMessage: 'Port {idx}' }, { idx: item.sortIdx })}
                key={item.portId}
              >
                <EdgeSubInterfacesTable serialNumber={serialNumber} portMac={item.mac} />
              </Tabs.TabPane>
            })}
          </Tabs>
          : <NoData />
        }
      </Loader>
    </Col>
  </Row>
}