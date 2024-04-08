/* eslint-disable max-len */
import { MessageDescriptor, defineMessage } from 'react-intl'

import { AlgorithmType, CertificateAuthorityType, ChromebookCertRemovalType, ChromebookEnrollmentType, ExpirationType, GenerationCaType } from '@acx-ui/rc/utils'


export const caTypeShortLabel: Record<CertificateAuthorityType, MessageDescriptor> = {
  [CertificateAuthorityType.ONBOARD]: defineMessage({ defaultMessage: 'Onboard' }),
  [CertificateAuthorityType.MICROSOFT]: defineMessage({ defaultMessage: 'Microsoft' }),
  [CertificateAuthorityType.INCOMMON]: defineMessage({ defaultMessage: 'inCommon' }),
  [CertificateAuthorityType.NETWORKFX]: defineMessage({ defaultMessage: 'NetworkFX' }),
  [CertificateAuthorityType.CUSTOM]: defineMessage({ defaultMessage: 'Custom' })
}

export const certificateExpirationLabel: Record<ExpirationType, string> = {
  [ExpirationType.SPECIFIED_DATE]: '',
  [ExpirationType.MINUTES_AFTER_TIME]: 'minute(s)',
  [ExpirationType.HOURS_AFTER_TIME]: 'hour(s)',
  [ExpirationType.DAYS_AFTER_TIME]: 'day(s)',
  [ExpirationType.WEEKS_AFTER_TIME]: 'week(s)',
  [ExpirationType.MONTHS_AFTER_TIME]: 'month(s)',
  [ExpirationType.YEARS_AFTER_TIME]: 'year(s)'
}

export const algorithmLabel: Record<AlgorithmType, MessageDescriptor> = {
  [AlgorithmType.SHA_1]: defineMessage({ defaultMessage: 'SHA-1' }),
  [AlgorithmType.SHA_256]: defineMessage({ defaultMessage: 'SHA-256' }),
  [AlgorithmType.SHA_384]: defineMessage({ defaultMessage: 'SHA-384' }),
  [AlgorithmType.SHA_512]: defineMessage({ defaultMessage: 'SHA-512' })
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

export const onboardSettingsDescription: Record<string, MessageDescriptor> = {
  INFORMATION: defineMessage({
    defaultMessage: 'Use a certificate authority within the RUCKUS One to sign certificates.'
  }),
  CERTIFICATE_TEMPLATE_NAME: defineMessage({
    defaultMessage: 'The Common Name is normally used to provide identity information within the certificate. Variables, such as \$\'{USERNAME\'}, will be replaced at the time of issuance with the appropriate value from the enrollment.'
  }),
  VALIDITY_PERIOD: defineMessage({
    defaultMessage: 'The following properties determine the lifespan of the issued certificates. We recommend setting the start date to 1 month before issuance to avoid issues with end-user system clocks'
  })
}

export const caFormDescription: Record<string, MessageDescriptor> = {
  INFORMATION: defineMessage({
    defaultMessage: 'The common name of the root CA is the publicly-visible name. It is advisable to include "Root CA" or "Intermediate CA" along with a version number such as "Sample Corp Root CA I".'
  }),
  VALIDITY_PERIOD: defineMessage({
    defaultMessage: 'Certificate authorities are normally valid for 20 years. We have defaulted the start date back one month to avoid potential system clock issues.'
  }),
  STRENGTH: defineMessage({
    defaultMessage: 'The following properties determine the strength of the certificate authority.'
  }),
  PROPERTIES: defineMessage({
    defaultMessage: 'The following properties are embedded into the CA. Many organizations have guidelines specifying exactly what these values need to be.'
  }),
  PRIVATE_KEY: defineMessage({
    defaultMessage: 'The private key is only necessary if you plan to issue certificate using this certificate authority. If the private key is password-protected, specify the password too.'
  })
}

export const addCATitle: Record<GenerationCaType, MessageDescriptor> = {
  [GenerationCaType.NEW]: defineMessage({
    defaultMessage: 'Generate New Certificate Authority'
  }),
  [GenerationCaType.NEW_SUB_CA]: defineMessage({
    defaultMessage: 'Generate New Intermediate Certificate Authority'
  }),
  [GenerationCaType.UPLOAD]: defineMessage({
    defaultMessage: 'Upload Existing Root or Intermediate Certificate Authority'
  })
}

export const addCADescription: Record<GenerationCaType, MessageDescriptor> = {
  [GenerationCaType.NEW]: defineMessage({
    defaultMessage: 'Creates a new root certificate authority by generating new keys.'
  }),
  [GenerationCaType.NEW_SUB_CA]: defineMessage({
    defaultMessage: 'Creates an intermediate certificate that’s subordinate to an existing CA.'
  }),
  [GenerationCaType.UPLOAD]: defineMessage({
    defaultMessage: 'Imports the public and optionally the private key of an existing certificate authority.'
  })
}

export const moreSettingsDescription: Record<string, MessageDescriptor> = {
  POLICY_SET: defineMessage({
    defaultMessage: 'When a device authenticates using a certificate from this template, we will return RADIUS attributes based on the policies in adaptive policy set below.'
  })
}