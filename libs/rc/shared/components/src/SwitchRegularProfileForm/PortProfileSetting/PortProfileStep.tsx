
import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'

import { Card, Select }                   from '@acx-ui/components'
import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { useSwitchPortProfilesListQuery } from '@acx-ui/rc/services'
import { useParams }                      from '@acx-ui/react-router-dom'
import { getIntl }                        from '@acx-ui/utils'

import PortProfileContext from './PortProfileContext'
import { ModelsType }     from './SelectModelStep'


const payload = {
  fields: [
    'id'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'id',
  sortOrder: 'ASC'
}

export interface PortsType {
  label: string,
  value: string
}

export function PortProfileStep () {
  const { $t } = getIntl()
  const { tenantId } = useParams()
  const form = Form.useFormInstance()
  const { portProfileSettingValues } = useContext(PortProfileContext)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [portProfiles, setPortProfiles] = useState<ModelsType[]>([])

  const { data } = useSwitchPortProfilesListQuery({
    params: { tenantId },
    payload,
    enableRbac: isSwitchRbacEnabled
  })


  useEffect(() => {
    if(data){
      if (data?.data) {
        setPortProfiles(
          data.data
            .map((item) => ({
              label: item.name,
              value: item.id
            })) as ModelsType[]
        )
        if (portProfileSettingValues) {
          form.setFieldValue('portProfileId', portProfileSettingValues.portProfileId)
        }
      }
    }
  }, [data, portProfileSettingValues])

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
                  name={'portProfileId'}
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
                      options={portProfiles}
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