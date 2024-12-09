/* eslint-disable max-len */
import { MessageDescriptor, defineMessage } from 'react-intl'

import { AlgorithmType, CertificateAuthorityType, CertificateCategoryType, CertificateGenerationType, CertificateStatusType, ChromebookCertRemovalType, ChromebookEnrollmentType, EnrollmentType, ExpirationType, ExtendedKeyUsages, GenerationCaType, KeyType, KeyUsages, KeyUsageType, ServerClientCertAlgorithmType, ServerClientCertType, UsageType } from '@acx-ui/rc/utils'


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
  [AlgorithmType.SHA_256]: defineMessage({ defaultMessage: 'SHA-256' }),
  [AlgorithmType.SHA_384]: defineMessage({ defaultMessage: 'SHA-384' }),
  [AlgorithmType.SHA_512]: defineMessage({ defaultMessage: 'SHA-512' })
}

export const serverAlgorithmLabel: Record<ServerClientCertAlgorithmType, MessageDescriptor> = {
  [ServerClientCertAlgorithmType.SHA_1]: defineMessage({ defaultMessage: 'SHA-1' }),
  [ServerClientCertAlgorithmType.SHA_256]: defineMessage({ defaultMessage: 'SHA-256' }),
  [ServerClientCertAlgorithmType.SHA_384]: defineMessage({ defaultMessage: 'SHA-384' }),
  [ServerClientCertAlgorithmType.SHA_512]: defineMessage({ defaultMessage: 'SHA-512' })
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

export const issuedByLabel: Record<EnrollmentType, MessageDescriptor> = {
  [EnrollmentType.CHROMEBOOK]: defineMessage({ defaultMessage: 'Chromebook' }),
  [EnrollmentType.SCEP]: defineMessage({ defaultMessage: 'SCEP' }),
  [EnrollmentType.NONE]: defineMessage({ defaultMessage: 'None' })
}

export const certDetailTitle: Record<CertificateCategoryType, MessageDescriptor> = {
  [CertificateCategoryType.CERTIFICATE]: defineMessage({ defaultMessage: 'Certificate Details' }),
  [CertificateCategoryType.CERTIFICATE_AUTHORITY]: defineMessage({ defaultMessage: 'Certificate Authority Details' }),
  [CertificateCategoryType.CERTIFICATE_TEMPLATE]: defineMessage({ defaultMessage: 'Certificate Template Details' }),
  [CertificateCategoryType.SERVER_CERTIFICATES]: defineMessage({ defaultMessage: 'Download' })
}

export const usagesLabel: Record<UsageType, MessageDescriptor> = {
  [UsageType.CLIENT_AUTH]: defineMessage({ defaultMessage: 'Client Authentication' }),
  [UsageType.SERVER_AUTH]: defineMessage({ defaultMessage: 'Server Authentication' }),
  [UsageType.CODE_SIGNING]: defineMessage({ defaultMessage: 'Code Signing' }),
  [UsageType.DOCUMENT_SIGNING]: defineMessage({ defaultMessage: 'Document Signing' }),
  [UsageType.EMAIL_PROTECTION]: defineMessage({ defaultMessage: 'Email Protection' }),
  [UsageType.HOTSPOT_AUTH]: defineMessage({ defaultMessage: 'Hotspot Authentication' }),
  [UsageType.IPSEC_END_SYSTEM]: defineMessage({ defaultMessage: 'IPSec End System' }),
  [UsageType.IPSEC_TUNNEL]: defineMessage({ defaultMessage: 'IPSec Tunnel' }),
  [UsageType.IPSEC_USER]: defineMessage({ defaultMessage: 'IPSec User' }),
  [UsageType.MICROSOFT_SGC]: defineMessage({ defaultMessage: 'Microsoft Server Gated Cryptography' }),
  [UsageType.NETSCAPE_SGC]: defineMessage({ defaultMessage: 'Netscape Server Gated Cryptography' }),
  [UsageType.OCSP_SIGNING]: defineMessage({ defaultMessage: 'OCSP Signing' }),
  [UsageType.SMART_CARD_LOGON]: defineMessage({ defaultMessage: 'Smart Card Logon' }),
  [UsageType.TIME_STAMPING]: defineMessage({ defaultMessage: 'Time Stamping' })
}

export const keyUsagesLabel: Record<KeyUsageType, MessageDescriptor> = {
  [KeyUsageType.DIGITAL_SIGNATURE]: defineMessage({ defaultMessage: 'Digital Signature' }),
  [KeyUsageType.KEY_ENCIPHERMENT]: defineMessage({ defaultMessage: 'Key Encipherment' }),
  [KeyUsageType.DATA_ENCIPHERMENT]: defineMessage({ defaultMessage: 'Data Encipherment' }),
  [KeyUsageType.KEY_CERT_SIGN]: defineMessage({ defaultMessage: 'Certificate Signing' }),
  [KeyUsageType.CRL_SIGN]: defineMessage({ defaultMessage: 'CRL Signing' })
}

export const onboardSettingsDescription: Record<string, MessageDescriptor> = {
  CERTIFICATE_TEMPLATE_NAME: defineMessage({
    defaultMessage: 'The Common Name is normally used to provide identity information within the certificate. Variables, such as \$\'{USERNAME\'}, will be replaced at the time of issuance with the appropriate value from the enrollment.'
  }),
  VALIDITY_PERIOD: defineMessage({
    defaultMessage: 'The following properties determine the lifespan of the issued certificates. We recommend setting the start date to 1 month before issuance to avoid issues with end-user system clocks'
  }),
  KEY_LENGTH: defineMessage({
    defaultMessage: 'The Key Length does not apply to certificates generated by Chromebook enrollment or from CSRs manually added.'
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

export const certificateDescription: Record<string, MessageDescriptor> = {
  INFORMATION: defineMessage({
    defaultMessage: 'The following fields are used as variables within the selected certificate template. The values specified below will be used to replace the variables in the generated certificate.'
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
  }),
  CA_IN_USE: defineMessage({
    defaultMessage: 'You are unable to delete this record due to its usage in {instance}'
  })
}

export const certificateStatusTypeLabel: Record<CertificateStatusType, MessageDescriptor> = {
  [CertificateStatusType.VALID]: defineMessage({
    defaultMessage: 'Valid'
  }),
  [CertificateStatusType.INVALID]: defineMessage({
    defaultMessage: 'Invalid'
  }),
  [CertificateStatusType.REVOKED]: defineMessage({
    defaultMessage: 'Revoked'
  }),
  [CertificateStatusType.EXPIRED]: defineMessage({
    defaultMessage: 'Expired'
  })
}

export const generateCertificateTitle: Record<CertificateGenerationType, MessageDescriptor> = {
  [CertificateGenerationType.NEW]: defineMessage({
    defaultMessage: 'Generate Certificate'
  }),
  [CertificateGenerationType.WITH_CSR]: defineMessage({
    defaultMessage: 'Generate Certificate with CSR'
  }),
  [CertificateGenerationType.UPLOAD]: defineMessage({
    defaultMessage: 'Upload Certificate'
  })
}

export const generateCertificateDescription: Record<CertificateGenerationType, MessageDescriptor> = {
  [CertificateGenerationType.NEW]: defineMessage({
    defaultMessage: 'Creates a new server, client certificate signed by CA'
  }),
  [CertificateGenerationType.WITH_CSR]: defineMessage({
    defaultMessage: 'Creates a new server certificate signed by CA'
  }),
  [CertificateGenerationType.UPLOAD]: defineMessage({
    defaultMessage: 'Upload server, client sertificate'
  })
}

export const serverClientCertSupportdFiles: Record<ServerClientCertType, MessageDescriptor> = {
  [KeyType.PUBLIC]: defineMessage({
    defaultMessage: 'Public Key certificate with PKCS #12 (.p12) format is collection of Public and Private keys. If Private key (in Public key) is password then please provide password below. Supported Public key file types: .p12, .der, .cert and .pem'
  }),
  [KeyType.PRIVATE]: defineMessage({
    defaultMessage: 'Supported Private key file types: .pem, .key and .cert'
  })
}

export const KeyUsagesLabels: Record<KeyUsages, MessageDescriptor> = {
  [KeyUsages.DIGITAL_SIGNATURE]: defineMessage({
    defaultMessage: 'Digital Signature'
  }),
  [KeyUsages.KEY_ENCIPHERMENT]: defineMessage({
    defaultMessage: 'Key Encipherment'
  })
}

export const ExtendedKeyUsagesLabels: Record<ExtendedKeyUsages, MessageDescriptor> = {
  [ExtendedKeyUsages.CLIENT_AUTH]: defineMessage({
    defaultMessage: 'Client Authentication'
  }),
  [ExtendedKeyUsages.SERVER_AUTH]: defineMessage({
    defaultMessage: 'Server Authentication'
  })
}
