
import { useContext, useEffect } from 'react'

import { Row, Col, Form } from 'antd'

import { Card, Select } from '@acx-ui/components'
import { getIntl }      from '@acx-ui/utils'

import PortProfileContext from './PortProfileContext'

export interface PortsType {
  label: string,
  value: string
}

export function PortProfileStep () {
  const { $t } = getIntl()
  const { portProfileSettingValues } = useContext(PortProfileContext)
  // const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
  }, [portProfileSettingValues])

  return (
    <div style={{ minHeight: '380px' }}>
      <Row gutter={20}>
        <Col>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col>
          <Card type='solid-bg'>
            <Row gutter={20}>
              <Col>
                <label style={{ color: 'var(--acx-neutrals-60)' }}>
                  {$t({ defaultMessage: 'Select the port profile(s) to assign to the model(s):' })}
                </label>
                <Form.Item
                  name={'portProfilesIds'}
                  label={<label>{$t({ defaultMessage: 'Port Profile' })}</label>}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Port Profile' })
                  }]}
                  data-testid='portProfileList'
                  children={
                    <Select
                      mode='multiple'
                      showArrow
                      options={[
                        { label: 'Port-profile-1', value: 'Port-profile-1' },
                        { label: 'Port-profile-2', value: 'Port-profile-2' },
                        { label: 'Port-profile-3', value: 'Port-profile-3' }
                      ]}
                      style={{ width: '400px' }}
                    />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}