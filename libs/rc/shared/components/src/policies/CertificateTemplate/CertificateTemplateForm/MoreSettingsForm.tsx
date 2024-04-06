import { useEffect } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { GridCol, GridRow, SelectionControl } from '@acx-ui/components'
import { useAdaptivePolicySetListQuery }      from '@acx-ui/rc/services'

import { moreSettingsDescription }                           from '../contentsMap'
import { Description, Section, SettingsSectionTitle, Title } from '../styledComponents'

import ChromebookSettings from './CertificateTemplateSettings/ChromebookSettings'

export default function MoreSettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const policySetId = Form.useWatch('policySetId')
  const { data: policySetsData } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } })

  useEffect(() => {
    if (policySetId) {
      form.setFieldValue('policySetName',
        policySetsData?.data.find(set => set.id === policySetId)?.name)
    } else {
      form.setFieldValue('policySetName', '')
    }
  }, [policySetId])

  return (
    <>
      <Title>{$t({ defaultMessage: 'More Settings' })}</Title>
      <Section>
        <SettingsSectionTitle>
          {$t({ defaultMessage: 'Adaptive Policy Set' })}
        </SettingsSectionTitle>
        <GridRow>
          <Description>{$t(moreSettingsDescription.POLICY_SET)}</Description>
          <GridCol col={{ span: 10 }}>
            <Form.Item label={$t({ defaultMessage: 'Adaptive Policy Set' })}>
              <Form.Item name='policySetId'
                rules={[
                  { message: $t({ defaultMessage: 'Please select Adaptive Policy Set' }) }
                ]}
                children={
                  <Select
                    allowClear
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                    options={
                      policySetsData?.data.map(set => ({ value: set.id, label: set.name }))}
                  />
                }
              />
            </Form.Item>
            {policySetId &&
              <Form.Item name='defaultAccess'
                label={$t({ defaultMessage: 'Default Access' })}
                initialValue={'true'}>
                <SelectionControl
                  options={[
                    { value: 'true', label: $t({ defaultMessage: 'ACCEPT' }) },
                    { value: 'false', label: $t({ defaultMessage: 'REJECT' }) }]}
                />
              </Form.Item>
            }
          </GridCol>
        </GridRow>
      </Section>
      <Section>
        <ChromebookSettings />
      </Section >
    </>
  )
}
