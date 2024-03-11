import { useContext } from 'react'

import { Col, Form, Row } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Fieldset }     from '@acx-ui/components'
import { EdgePortInfo } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'

interface VipCardProps {
  index: number
  data: {
    interfaces: {
      [key: string]: EdgePortInfo
    }
    vip: string
  }
}

export const VipCard = (props: VipCardProps) => {
  const { index, data } = props
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  return (
    <Fieldset
      label={
        $t({ defaultMessage: '#{index} Virtual IP' },
          { index })
      }
      switchStyle={{ display: 'none' }}
      checked={true}
      style={{}}
    >
      <Row>
        <Col span={12}>
          <Form.Item
            label={$t({ defaultMessage: 'Interfaces' })}
          >
            <Row>
              {
                data.interfaces &&
                Object.entries(data.interfaces).map(([k, v]) => {
                  const targetNode = clusterInfo?.edgeList?.find(item =>
                    item.serialNumber === k)
                  return <Col span={24}>
                    {`${targetNode?.name ?? ''} - ${_.capitalize(v.portName)}`}
                  </Col>
                })
              }
            </Row>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={$t({ defaultMessage: 'Virtual IP Address' })}
          >
            <Row>
              <Col span={24}>{data.vip}</Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>
    </Fieldset>
  )
}