import { useEffect, useState } from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Button, Drawer, Select, StepsForm, Tooltip, Alert } from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useGetClientIsolationListQuery }                    from '@acx-ui/rc/services'
import {
  ClientIsolationMessages,
  IsolatePacketsTypeEnum,
  PolicyOperation,
  PolicyType,
  getIsolatePacketsTypeOptions,
  hasPolicyPermission
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ClientIsolationForm } from '../../policies/ClientIsolationForm/ClientIsolationForm'
import { FieldLabel }          from '../styledComponents'

import ClientIsolationAllowListDetailsDrawer from './ClientIsolationListDetailsDrawer'

interface ClientIsolationSettingFieldsProps {
    index: number,
    readOnly?: boolean,
    onGUIChanged?: (fieldName: string) => void
}
const ClientIsolationSettingsFields = (props: ClientIsolationSettingFieldsProps) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const params = useParams()
  const { index, readOnly, onGUIChanged } = props
  const [formVisible, setFormVisible]= useState(false)
  const [detailVisible, setDetailVisible] = useState(false)

  const clientIsolationEnabledFieldName = ['lan', index, 'clientIsolationEnabled']
  const clientIsolationProfileIdFieldName = ['lan', index, 'clientIsolationProfileId']
  const isClientIsolationEnabled =
    Form.useWatch<boolean>(clientIsolationEnabledFieldName, form)
  const clientIsolationProfileId = Form.useWatch(clientIsolationProfileIdFieldName, form)
  const [clientIsoCreateId, setClientIsoCreateId] = useState('')

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { clientIsolationAllowListOptions } =
    useGetClientIsolationListQuery(
      { params, enableRbac },
      {
        selectFromResult ({ data }) {
          return {
            clientIsolationAllowListOptions: data?.map(
              item => ({ label: item.name, value: item.id })
            ) ?? []
          }
        }
      })

  const onClientIsolationProfileIdChanged = (value: string) => {
    if(!value) {
      setDetailVisible(false)
    }
    onGUIChanged?.('clientIsolationProfileId')
  }

  const updateClientIsolationInstance = (createId?: string) => {
    if(createId) {
      setClientIsoCreateId(createId)
    }
    setFormVisible(false)
  }

  useEffect(() => {
    if(clientIsoCreateId) {
      form.setFieldValue(clientIsolationProfileIdFieldName, clientIsoCreateId)
      setClientIsoCreateId('')
    }
  }, [clientIsolationAllowListOptions])

  return (
    <>
      <StepsForm.StepForm>
        <FieldLabel width='220px'>
          <Space>
            {$t({ defaultMessage: 'Client Isolation' })}
            <Tooltip.Question
              title={$t(ClientIsolationMessages.ENABLE_TOGGLE)}
              placement='bottom'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            name={['lan', index, 'clientIsolationEnabled']}
            valuePropName='checked'
            children={<Switch
              data-testid={'client-isolation-switch'}
              disabled={readOnly}
              onChange={() => onGUIChanged?.('clientIsolationEnabled')}
            />}
          />
        </FieldLabel>
      </StepsForm.StepForm>
      {isClientIsolationEnabled && <>
        <Alert
          showIcon={true}
          style={{ verticalAlign: 'middle' }}
          message={$t({
            defaultMessage: 'Enabling on the uplink/WAN port will disconnect AP(s)' })
          }
        />
        <Form.Item
          name={['lan', index, 'clientIsolationSettings', 'packetsType']}
          label={$t({ defaultMessage: 'Isolate Packets' })}
          initialValue={IsolatePacketsTypeEnum.UNICAST}
          children={
            <Select
              style={{ width: '260px' }}
              options={getIsolatePacketsTypeOptions()}
              onChange={() => onGUIChanged?.('packetsType')}
              disabled={readOnly}
            />
          }
        />
        <StepsForm.FieldLabel width={'220px'}>
          {$t({ defaultMessage: 'Automatic support for VRRP/HSRP' })}
          <Form.Item
            name={['lan', index, 'clientIsolationSettings', 'autoVrrp' ]}
            valuePropName='checked'
            children={<Switch
              onChange={() => onGUIChanged?.('autoVrrp')}
              disabled={readOnly}
            />}
          />
        </StepsForm.FieldLabel>
        <Space>
          <Form.Item
            name={clientIsolationProfileIdFieldName}
            label={$t({ defaultMessage: 'Client Isolation Allowlist' })}
            children={
              <Select
                style={{ width: '260px' }}
                options={[
                  { label: $t({ defaultMessage: 'Not active' }), value: null, title: null },
                  ...clientIsolationAllowListOptions
                ]}
                onChange={onClientIsolationProfileIdChanged}
                disabled={readOnly}
              />
            }
          />
          <Space split='|'>
            <Button
              type='link'
              children={$t({ defaultMessage: 'Policy Details' })}
              onClick={()=>setDetailVisible(true)}
              disabled={!clientIsolationProfileId}
            />
            {hasPolicyPermission(
              { type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE }) &&
            <Button
              type='link'
              children={$t({ defaultMessage: 'Add Policy' })}
              onClick={()=>setFormVisible(true)}
            />
            }

          </Space>
          <ClientIsolationAllowListDetailsDrawer
            visible={detailVisible}
            setVisible={setDetailVisible}
            clientIsolationProfileId={clientIsolationProfileId}
          />
          <Drawer
            title={$t({ defaultMessage: 'Add Client Isolation' })}
            visible={formVisible}
            onClose={() => setFormVisible(false)}
            children={
              <ClientIsolationForm
                editMode={false}
                isEmbedded={true}
                updateInstance={updateClientIsolationInstance}
              />
            }
            width={'600px'}
          />
        </Space>
      </>}
    </>)
}

export default ClientIsolationSettingsFields
