import { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { Button, GridCol, GridRow, Tabs }    from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery } from '@acx-ui/rc/services'
import { CertificateCategoryType }           from '@acx-ui/rc/utils'

import { MAX_CERTIFICATE_PER_TENANT }                              from '../constants'
import { Section, SettingsSectionTitle, TabItem, TabLabel, Title } from '../styledComponents'

import AddCertificateAuthorityDrawer from './AddCertificateAuthorityDrawer'
import CertificateStrengthSettings   from './CertificateTemplateSettings/CertificateStrengthSettings'
import ChromebookSettings            from './CertificateTemplateSettings/ChromebookSettings'
import OrganizationInfoSettings      from './CertificateTemplateSettings/OrganizationInfoSettings'
import ValidityPeriodSettings        from './CertificateTemplateSettings/ValidityPeriodSettings'

export default function MoreSettingsForm ({ editMode = false }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const selectedCaId = Form.useWatch(['onboard', 'certificateAuthorityId'], form)

  const { isCaOptionsLoading, caOptions } = useGetCertificateAuthoritiesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT,
      sortField: 'name', sortOrder: 'ASC' }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCaOptionsLoading: isLoading,
        caOptions: data?.data?.map((item) => ({ label: item.name, value: item.id }))
      }
    }
  })

  useEffect(() => {
    const optionLabel = caOptions
      ? caOptions.filter(option => option.value === selectedCaId).map(option => option.label)
      : selectedCaId
    form.setFieldValue(['onboard', 'certificateAuthorityName'], optionLabel)
  }, [selectedCaId])

  const moreSettingsTabsInfo = [
    {
      key: 'validityPeriod',
      display: $t({ defaultMessage: 'Validity Period' }),
      content: <ValidityPeriodSettings />
    },
    {
      key: 'certificateStrength',
      display: $t({ defaultMessage: 'Certificate Strength' }),
      // eslint-disable-next-line max-len
      content: <CertificateStrengthSettings certType={CertificateCategoryType.CERTIFICATE_TEMPLATE}/>
    },
    {
      key: 'organizationInfo',
      display: $t({ defaultMessage: 'Organization Info' }),
      content: <OrganizationInfoSettings />
    }
  ]
  const [activeTabKey, setActiveTabKey] = useState(moreSettingsTabsInfo[0].key)


  return (
    <>
      <Title>{$t({ defaultMessage: 'More Settings' })}</Title>
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Sources' })}</SettingsSectionTitle>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <Form.Item
              name={['onboard', 'certificateAuthorityId']}
              label={$t({ defaultMessage: 'Onboard Certificate Authority' })}
              rules={[{
                required: true
              }]}
            >
              <Select
                loading={isCaOptionsLoading}
                placeholder={$t({ defaultMessage: 'Select CA...' })}
                options={caOptions}
                disabled={editMode}
              />
            </Form.Item>
          </GridCol>
          {!editMode && <AddCertificateAuthorityDrawer certificateTemplateForm={form} />}
        </GridRow>
      </Section>
      <Section>
        <ChromebookSettings />
      </Section >
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Button type='link'
            style={{ maxWidth: 120 }}
            onClick={() => setShowMoreSettings(!showMoreSettings)}>
            {showMoreSettings
              ? $t({ defaultMessage: 'Show less settings' })
              : $t({ defaultMessage: 'Show more settings' })}
          </Button>
          {showMoreSettings && <>
            <Tabs type='third'
              onChange={(key) => setActiveTabKey(key)}
              activeKey={activeTabKey}
            >
              {moreSettingsTabsInfo.map(({ key, display }) =>
                (<Tabs.TabPane key={key} tab={<TabLabel>{display}</TabLabel>} />))}
            </Tabs>
            <TabItem>
              {moreSettingsTabsInfo.find(info => (info.key === activeTabKey))?.content}
            </TabItem>
          </>
          }
        </GridCol>
      </GridRow>
    </>
  )
}
