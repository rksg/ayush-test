import { useContext } from 'react'

import { Col, Form, Row } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Fieldset }      from '@acx-ui/components'
import { VipConfigType } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'

interface VipCardProps {
  index: number
  data: VipConfigType
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
    >
      <Row>
        <Col span={12}>
          <Form.Item
            label={$t({ defaultMessage: 'Interfaces' })}
          >
            <Row>
              {
                data.interfaces &&
                data.interfaces.map(interfaceInfo => {
                  const targetNode = clusterInfo?.edgeList?.find(item =>
                    item.serialNumber === interfaceInfo.serialNumber)
                  return <Col span={24} key={interfaceInfo.serialNumber}>
                    {`${targetNode?.name ?? ''} - ${_.capitalize(interfaceInfo.portName)}`}
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