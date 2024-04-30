import { Col, Form, Input, Row, Space } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import { useLazyGetClientIsolationListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  ClientIsolationClient,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { ClientIsolationAllowListTable } from './ClientIsolationAllowListTable'
import * as UI                           from './styledComponents'

export const ALLOW_LIST_MAX_COUNT = 64

export default function ClientIsolationSettingsForm (props: { editMode: boolean }) {
  const { editMode } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const params = useParams()
  const allowlist = Form.useWatch('allowlist')
  const id = Form.useWatch<string>('id', form)
  const [ clientIsolationList ] = useLazyGetClientIsolationListQuery()

  const nameValidator = async (value: string) => {
    try {
      const list = (await clientIsolationList({ params }).unwrap())
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
        <Col span={7}>
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
        <Col span={8}>
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
                { maxClientCount: ALLOW_LIST_MAX_COUNT }
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
