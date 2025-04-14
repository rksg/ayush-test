import { Col, Form, Input, Row, Space } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { useLazyGetClientIsolationListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  CLIENT_ISOLATION_LIMIT_NUMBER,
  ClientIsolationClient,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { ClientIsolationAllowListTable } from './ClientIsolationAllowListTable'
import * as UI                           from './styledComponents'

interface ClientIsolationSettingsFormProps {
  editMode: boolean
  isEmbedded?: boolean
}

export default function ClientIsolationSettingsForm (props: ClientIsolationSettingsFormProps) {
  const { editMode, isEmbedded } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const params = useParams()
  const allowlist = Form.useWatch('allowlist')
  const id = Form.useWatch<string>('id', form)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [ clientIsolationList ] = useLazyGetClientIsolationListQuery()
  const colSpan = isEmbedded ? 24 : 8

  const nameValidator = async (value: string) => {
    try {
      const list = (await clientIsolationList({ params, enableRbac }).unwrap())
        .filter(clientIsolation => clientIsolation.id !== id)
        .map(clientIsolation => ({ name: clientIsolation.name }))

      // eslint-disable-next-line max-len
      return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Client Isolation Policy' }))
    } catch (error) {
      return Promise.reject($t({ defaultMessage: 'Validation with the system went wrong' }))
    }
  }

  const handleSetAllowList = (clients: ClientIsolationClient[]) => {
    form.setFieldValue('allowlist', clients)
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={colSpan}>
          <Form.Item name='id' noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => nameValidator(value) },
              { validator: (_, value) => servicePolicyNameRegExp(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
            validateTrigger={'onBlur'}
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 64 }
            ]}
            children={<Input.TextArea rows={2} maxLength={64} />}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={colSpan}>
          <Space direction='vertical' size={2}>
            <UI.TableLabel>
              {$t(
                { defaultMessage: 'Client Entries ({count})' },
                { count: allowlist ? allowlist.length : 0 }
              )}
            </UI.TableLabel>
            <UI.TableSubLabel>
              {$t(
                { defaultMessage: 'Up to {maxClientCount} clients may be added' },
                { maxClientCount: CLIENT_ISOLATION_LIMIT_NUMBER }
              )}
            </UI.TableSubLabel>
          </Space>
          <Form.Item
            name='allowlist'
            rules={[
              { required: true }
            ]}
          >
            <ClientIsolationAllowListTable
              showIpAddress={!editMode}
              allowList={allowlist}
              setAllowList={handleSetAllowList}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
