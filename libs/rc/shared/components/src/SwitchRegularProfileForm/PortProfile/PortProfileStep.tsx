import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'

import { Card, Select }                   from '@acx-ui/components'
import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { useSwitchPortProfilesListQuery } from '@acx-ui/rc/services'
import { validateDuplicatePortProfile }   from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'
import { getIntl, validationMessages }    from '@acx-ui/utils'

import PortProfileContext from './PortProfileContext'
import { ModelsType }     from './SelectModelStep'

import { getPortProfileIdIfModelsMatch } from '.'

const payload = {
  fields: [
    'id'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'name',
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
  const { portProfileSettingValues, portProfileList } = useContext(PortProfileContext)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [portProfiles, setPortProfiles] = useState<ModelsType[]>([])

  const { data: portProfilesList } = useSwitchPortProfilesListQuery({
    params: { tenantId },
    payload,
    enableRbac: isSwitchRbacEnabled
  })


  useEffect(() => {
    if (portProfilesList) {
      setPortProfiles(
        portProfilesList.data
          .map((item) => ({
            label: item.name,
            value: item.id
          })) as ModelsType[]
      )
      if (portProfileSettingValues) {
        form.setFieldValue('portProfileId', portProfileSettingValues.portProfileId)
      }
    }
  }, [portProfilesList, portProfileSettingValues])



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
                  label={<label>{$t({ defaultMessage: 'Port Profiles' })}</label>}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please enter Port Profile' })
                  },
                  {
                    validator: (_, value) => {
                      const portProfileListExcludingSelf = portProfileList.filter(
                        (item) => item.models.sort().toString() !==
                        portProfileSettingValues.models.sort().toString())

                      const sameModelPortProfileIds = getPortProfileIdIfModelsMatch(
                        portProfileListExcludingSelf,
                        { ...portProfileSettingValues, portProfileId: value })

                      return portProfilesList?.data &&
                        validateDuplicatePortProfile(
                          [...value, ...sameModelPortProfileIds], portProfilesList.data) ?
                        Promise.reject($t(validationMessages.SwitchPortProfilesDuplicateInvalid)) :
                        Promise.resolve()
                    }
                  }
                  ]}
                  data-testid='portProfileList'
                  children={
                    <Select
                      mode='multiple'
                      showArrow
                      options={portProfiles}
                      filterOption={(input, option) =>
                        option?.label?.toString()
                          .toLowerCase().includes(input.toLowerCase()) ?? false
                      }
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