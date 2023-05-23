import { Col, Row, Form } from 'antd'

import * as UI         from './styledComponents'
import { TestDetails } from './types'
import * as FormItems  from './VideoCallQoeForm/FormItems'

export interface Props {
  setVisible: (visible: boolean) => void,
  visible: boolean,
  testDetails: TestDetails
}

export function TestDetailsDrawer (props: Props) {
  const { visible, setVisible, testDetails: { name,link } } = props
  return <UI.Drawer
    width={500}
    title={name}
    visible={visible}
    onClose={() => {
      setVisible(false)
    }}
    children={
      <Form>
        <Row gutter={20}>
          <Col span={24}>
            <FormItems.TestLink link={link} width='350px'/>
            <FormItems.Prerequisites/>
            <FormItems.Disclaimer/>
          </Col>
        </Row>
      </Form>
    }
  />
}
