import { useState } from 'react'

import { Form, Col, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Card }           from '@acx-ui/components'
import {  TenantAuthentications } from '@acx-ui/rc/utils'

import { AddApplicationDrawer } from './AddApplicationDrawer'
// import { ButtonWrapper }    from './styledComponents'

interface AppTokenFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
//   isPrimeAdminUser: boolean;
}

const AppTokenFormItem = (props: AppTokenFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

  const onSetUpValue = () => {
    setDrawerVisible(true)
  }

  const hasSsoConfigured = true

  return ( <>
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'Application Tokens' })}
          </>}
        />

        {<Col span={24}>
          <Card type='solid-bg'>
            <Form.Item
              children={
                <Button type='link'
                  key='viewxml'
                  onClick={() => {onSetUpValue() }}>
                  {$t({ defaultMessage: 'Add Application Token' })}
                </Button>
              }
            />
          </Card>
        </Col>
        }

        {!hasSsoConfigured &&
        <Button onClick={onSetUpValue}>{$t({ defaultMessage: 'Set Up' })}</Button>}
      </Col>
    </Row>

    {drawerVisible &&
    <AddApplicationDrawer
      visible={drawerVisible}
      isEditMode={false}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { AppTokenFormItem }