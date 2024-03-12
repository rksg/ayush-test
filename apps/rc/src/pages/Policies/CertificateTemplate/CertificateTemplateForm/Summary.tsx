import { useState } from 'react'

import { Button, Divider, Form } from 'antd'
import moment                    from 'moment'
import { useIntl }               from 'react-intl'

import { Tabs }                                                                                      from '@acx-ui/components'
import { CertificateTemplateFormData, EXPIRATION_DATE_FORMAT, ExpirationDateEntity, ExpirationMode } from '@acx-ui/rc/utils'

import { DEFAULT_PLACEHOLDER, getDisplayedAlgorithm }                                           from '../certificateTemplateUtils'
import { caTypeShortLabel, certificateExpirationLabel, enrollmentTypeLabel, existingCertLabel } from '../contentsMap'
import { TabItem, TabLable, Title }                                                             from '../styledComponents'


export default function Summary () {
  const { $t } = useIntl()
  const form = Form.useFormInstance<CertificateTemplateFormData>()
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const moreSettingsTabsInfo = [
    {
      key: 'validityPeriod',
      display: $t({ defaultMessage: 'Validity Period' })
    },
    {
      key: 'certificateStrength',
      display: $t({ defaultMessage: 'Certificate Strength' })
    },
    {
      key: 'organizationInfo',
      display: $t({ defaultMessage: 'Organization Info' })
    }
  ]
  const [activeTabKey, setActiveTabKey] = useState(moreSettingsTabsInfo[0].key)
  const getDisplayValidityPeriod = (periodType: string) => {
    const period: ExpirationDateEntity = form.getFieldValue([periodType])
    if (period && period.mode === ExpirationMode.BY_DATE) {
      return `${moment(period.date).format(EXPIRATION_DATE_FORMAT)}`
    } else if (period && period.mode === ExpirationMode.AFTER_TIME
      && period.offset && period.type) {
      const issuance = periodType === 'notBefore'
        ? $t({ defaultMessage: '{offset} {type} before issuance' },
          { offset: period.offset, type: certificateExpirationLabel[period.type] })
        : $t({ defaultMessage: '{offset} {type} after issuance' },
          { offset: period.offset, type: certificateExpirationLabel[period.type] })
      return issuance
    } else {
      return DEFAULT_PLACEHOLDER
    }
  }

  return (
    <>
      <Title>{$t({ defaultMessage: 'Summary' })}</Title>
      <Form.Item
        label={$t({ defaultMessage: 'CA Type' })}
        // eslint-disable-next-line max-len
        children={form.getFieldValue('caType') ? $t(caTypeShortLabel[form.getFieldValue('caType') as keyof typeof caTypeShortLabel]) : DEFAULT_PLACEHOLDER}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Onboard Certificate Authority' })}
        children={form.getFieldValue(['onboard', 'certificateAuthorityName'])} />
      <Form.Item
        label={$t({ defaultMessage: 'Certificate Template Name' })}
        children={form.getFieldValue('name')} />
      <Form.Item
        label={$t({ defaultMessage: 'Common Name' })}
        children={form.getFieldValue(['onboard', 'commonNamePattern'])} />
      <Button type='link' onClick={() => setShowMoreSettings(!showMoreSettings)}>
        {showMoreSettings
          ? $t({ defaultMessage: 'Show less settings' })
          : $t({ defaultMessage: 'Show more settings' })}
      </Button>
      {showMoreSettings && <>
        <Tabs type='third'
          onChange={(key) => setActiveTabKey(key)}
          activeKey={activeTabKey}
        >
          {moreSettingsTabsInfo.map(({ key, display }) => (<Tabs.TabPane key={key}
            tab={<TabLable>{display}</TabLable>}
          />))}
        </Tabs>
        <TabItem>
          {activeTabKey === 'validityPeriod' && <>
            <Form.Item
              label={$t({ defaultMessage: 'Start Date' })}
              children={getDisplayValidityPeriod('notBefore')} />
            <Form.Item
              label={$t({ defaultMessage: 'Expiration Date' })}
              children={getDisplayValidityPeriod('notAfter')} />
          </>}
          {activeTabKey === 'certificateStrength' && <>
            <Form.Item
              label={$t({ defaultMessage: 'Key Length' })}
              children={form.getFieldValue('keyLength')} />
            <Form.Item
              label={$t({ defaultMessage: 'Algorithm' })}
              children={getDisplayedAlgorithm(form.getFieldValue('algorithm'))} />
          </>}
          {activeTabKey === 'organizationInfo' && <>
            <Form.Item
              label={$t({ defaultMessage: 'Organization Pattern' })}
              children={form.getFieldValue(['onboard', 'organizationPattern'])
                || DEFAULT_PLACEHOLDER} />
            <Form.Item
              label={$t({ defaultMessage: 'Organization Unit Pattern' })}
              children={form.getFieldValue(['onboard', 'organizationUnitPattern'])
                || DEFAULT_PLACEHOLDER} />
            <Form.Item
              label={$t({ defaultMessage: 'Locality Pattern' })}
              children={form.getFieldValue(['onboard', 'localityPattern'])
                || DEFAULT_PLACEHOLDER} />
            <Form.Item
              label={$t({ defaultMessage: 'State Pattern' })}
              children={form.getFieldValue(['onboard', 'statePattern'])
                || DEFAULT_PLACEHOLDER} />
            <Form.Item
              label={$t({ defaultMessage: 'Country Pattern' })}
              children={form.getFieldValue(['onboard', 'countryPattern'])
                || DEFAULT_PLACEHOLDER} />
          </>}
        </TabItem>
      </>}
      <Divider />
      <Form.Item
        label={$t({ defaultMessage: 'Adaptive Policy Set' })}
        children={form.getFieldValue('policySetName') || DEFAULT_PLACEHOLDER} />
      {form.getFieldValue('policySetName') &&
        <Form.Item
          label={$t({ defaultMessage: 'Default Access' })}
          children={form.getFieldValue('defaultAccess') === 'true' ?
            $t({ defaultMessage: 'Accept' }) : $t({ defaultMessage: 'Reject' })} />}
      <Divider />
      <Form.Item
        label={$t({ defaultMessage: 'Chromebook Enrollment' })}
        children={(form.getFieldValue(['chromebook', 'enabled']) === true ?
          $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' }))} />
      {form.getFieldValue(['chromebook', 'enabled']) === true &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'Enrollment Type' })}
            children={
              $t(enrollmentTypeLabel[form.getFieldValue(['chromebook', 'enrollmentType']) as
                keyof typeof enrollmentTypeLabel]) || DEFAULT_PLACEHOLDER} />
          <Form.Item
            label={$t({ defaultMessage: 'Existing Certificates' })}
            children={$t(existingCertLabel[form.getFieldValue(['chromebook', 'certRemovalType']) as
              keyof typeof existingCertLabel]) || DEFAULT_PLACEHOLDER} />
          <Form.Item
            label={$t({ defaultMessage: 'App ID To Notify' })}
            children={form.getFieldValue(['chromebook', 'notifyAppId']) || DEFAULT_PLACEHOLDER} />
          <Form.Item
            label={$t({ defaultMessage: 'Google API Key' })}
            children={form.getFieldValue(['chromebook', 'apiKey']) || DEFAULT_PLACEHOLDER} />
        </>}
    </>
  )
}
