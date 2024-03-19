/* eslint-disable max-len */
import { MessageDescriptor, defineMessage } from 'react-intl'

import { AlgorithmType, CertificateAuthorityType, CertificateStatusType, ChromebookCertRemovalType, ChromebookEnrollmentType, KeyUsageType, UsageType } from '@acx-ui/rc/utils'


export const caTypeShortLabel: Record<CertificateAuthorityType, MessageDescriptor> = {
  [CertificateAuthorityType.ONBOARD]: defineMessage({ defaultMessage: 'Onboard' }),
  [CertificateAuthorityType.MICROSOFT]: defineMessage({ defaultMessage: 'Microsoft' }),
  [CertificateAuthorityType.INCOMMON]: defineMessage({ defaultMessage: 'inCommon' }),
  [CertificateAuthorityType.NETWORKFX]: defineMessage({ defaultMessage: 'NetworkFX' }),
  [CertificateAuthorityType.CUSTOM]: defineMessage({ defaultMessage: 'Custom' })
}

export const algorithmLabel: Record<AlgorithmType, MessageDescriptor> = {
  [AlgorithmType.SHA_1]: defineMessage({ defaultMessage: 'SHA-1' }),
  [AlgorithmType.SHA_256]: defineMessage({ defaultMessage: 'SHA-256' }),
  [AlgorithmType.SHA_384]: defineMessage({ defaultMessage: 'SHA-384' }),
  [AlgorithmType.SHA_512]: defineMessage({ defaultMessage: 'SHA-512' })
}

export const usagesLabel: Record<UsageType, MessageDescriptor> = {
  [UsageType.CLIENT_AUTH]: defineMessage({ defaultMessage: 'Client Authentication' }),
  [UsageType.SERVER_AUTH]: defineMessage({ defaultMessage: 'Server Authentication' })
}

export const keyUsagesLabel: Record<KeyUsageType, MessageDescriptor> = {
  [KeyUsageType.DIGITAL_SIGNATURE]: defineMessage({ defaultMessage: 'Digital Signature' }),
  [KeyUsageType.KEY_ENCIPHERMENT]: defineMessage({ defaultMessage: 'Key Encipherment' }),
  [KeyUsageType.DATA_ENCIPHERMENT]: defineMessage({ defaultMessage: 'Data Encipherment' }),
  [KeyUsageType.KEY_CERT_SIGN]: defineMessage({ defaultMessage: 'Certificate Signing' }),
  [KeyUsageType.CRL_SIGN]: defineMessage({ defaultMessage: 'CRL Signing' })
}

export const enrollmentTypeLabel: Record<ChromebookEnrollmentType, MessageDescriptor> = {
  [ChromebookEnrollmentType.DEVICE]: defineMessage({ defaultMessage: 'Device' }),
  [ChromebookEnrollmentType.USER]: defineMessage({ defaultMessage: 'User' })
}

export const existingCertLabel: Record<ChromebookCertRemovalType, MessageDescriptor> = {
  [ChromebookCertRemovalType.NONE]: defineMessage({ defaultMessage: 'Do not remove existing certificates.' }),
  [ChromebookCertRemovalType.SAME_CN]: defineMessage({ defaultMessage: 'Remove certificates with same common name.' }),
  [ChromebookCertRemovalType.SAME_CA]: defineMessage({ defaultMessage: 'Remove certificates with same issuing CA.' }),
  [ChromebookCertRemovalType.SAME_CN_OR_SAME_CA]: defineMessage({ defaultMessage: 'Remove certificate with same CN or issuing CA.' }),
  [ChromebookCertRemovalType.ALL]: defineMessage({ defaultMessage: 'Remove all certificates.' })
}

export const certificateDescription: Record<string, MessageDescriptor> = {
  INFORMATION: defineMessage({
    defaultMessage: 'The following fields are used as variables within the selected certificate template. The values specified below will be used to replace the variables in the generated certificate.'
  })
}

export const certificateStatusTypeLabel: Record<CertificateStatusType, MessageDescriptor> = {
  [CertificateStatusType.VALID]: defineMessage({
    defaultMessage: 'Valid'
  }),
  [CertificateStatusType.REVOKED]: defineMessage({
    defaultMessage: 'Revoked'
  }),
  [CertificateStatusType.EXPIRED]: defineMessage({
    defaultMessage: 'Expired'
  })
}

export const deleteDescription: Record<string, MessageDescriptor> = {
  CA_DETAIL: defineMessage({
    defaultMessage: 'This will delete all data associated with the certificate authority, including templates, issued certificates, and more. Certificates issued from this CA will begin failing RADIUS authentication.'
  }),
  TEMPLATE_DETAIL: defineMessage({
    defaultMessage: 'This will delete all data associated with the certificate template, including issued certificates. Certificates issued from this template will begin failing RADIUS authentication.'
  }),
  PRIVATE_KEY_1: defineMessage({
    defaultMessage: 'Please verify that you have downloaded the private key before removing.'
  }),
  PRIVATE_KEY_2: defineMessage({
    defaultMessage: 'You must download and store the private key before removing it. If you remove the private key without having a downloaded copy preserved, the certificate authority will no longer be usable.'
  }),
  PRIVATE_KEY_3: defineMessage({
    defaultMessage: 'I have downloaded and saved the private key'
  }),
  UNDONE: defineMessage({
    defaultMessage: 'This action cannot be undone.'
  })
}