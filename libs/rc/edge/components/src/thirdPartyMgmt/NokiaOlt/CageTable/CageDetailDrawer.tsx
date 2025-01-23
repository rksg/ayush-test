import { Row, Col, Form } from 'antd'

import { Drawer }     from '@acx-ui/components'
import { EdgeStatus } from '@acx-ui/rc/utils'


interface CageDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentCage: EdgeStatus | undefined,
}


export const CageDetailsDrawer = (props: CageDetailsDrawerProps) => {
  const { visible, setVisible, currentOlt } = props

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={currentOlt?.name}
      visible={visible}
      onClose={onClose}
      width={'480px'}
    >
      <Row>
        <Col span={24}>
          ONU Table
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            label={$t({ defaultMessage: 'PoE Class' })}
            children={
              transformDisplayText(currentOlt?.firmwareVersion)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Ports ({count})' }, { count: currentOlt?.ports?.length })}
            children={
              transformDisplayText(currentOlt?.firmwareVersion)
            }
          />
          ONU Port Table
        </Col>
      </Row>
    </Drawer>
  )
}