import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { CertificateTemplateFormData } from '@acx-ui/rc/utils'
import { noDataDisplay }               from '@acx-ui/utils'

import { caTypeShortLabel, enrollmentTypeLabel, existingCertLabel } from '../contentsMap'
import { Title }                                                    from '../styledComponents'


export default function Summary () {
  const { $t } = useIntl()
  const form = Form.useFormInstance<CertificateTemplateFormData>()

  return (
    <>
      <Title>{$t({ defaultMessage: 'Summary' })}</Title>
      <Form.Item
        label={$t({ defaultMessage: 'Certificate Template Name' })}
        children={form.getFieldValue('name')} />
      <Form.Item
        label={$t({ defaultMessage: 'Common Name' })}
        children={form.getFieldValue(['onboard', 'commonNamePattern'])} />
      <Form.Item
        label={$t({ defaultMessage: 'Identity Group' })}
        children={form.getFieldValue('identityGroupName') || noDataDisplay} />
      <Form.Item
        label={$t({ defaultMessage: 'Adaptive Policy Set' })}
        children={form.getFieldValue('policySetName') || noDataDisplay} />
      {form.getFieldValue('policySetName') &&
        <Form.Item
          label={$t({ defaultMessage: 'Default Access' })}
          children={form.getFieldValue('defaultAccess') === 'true' ?
            $t({ defaultMessage: 'Accept' }) : $t({ defaultMessage: 'Reject' })} />}
      <Form.Item
        label={$t({ defaultMessage: 'CA Type' })}
        // eslint-disable-next-line max-len
        children={form.getFieldValue('caType') ? $t(caTypeShortLabel[form.getFieldValue('caType') as keyof typeof caTypeShortLabel]) : noDataDisplay}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Onboard Certificate Authority' })}
        children={form.getFieldValue(['onboard', 'certificateAuthorityName'])} />
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
                keyof typeof enrollmentTypeLabel]) || noDataDisplay} />
          <Form.Item
            label={$t({ defaultMessage: 'Existing Certificates' })}
            children={$t(existingCertLabel[form.getFieldValue(['chromebook', 'certRemovalType']) as
              keyof typeof existingCertLabel]) || noDataDisplay} />
          <Form.Item
            label={$t({ defaultMessage: 'Google API Key' })}
            children={form.getFieldValue(['chromebook', 'apiKey']) || noDataDisplay} />
        </>}
    </>
  )
}
