import moment from 'moment-timezone'

import { Certificate, CertificateStatusType, EXPIRATION_TIME_FORMAT, CertificateAuthority, CertificateCategoryType, EXPIRATION_DATE_FORMAT, KeyUsageType, UsageType } from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay }                                                                                                                                     from '@acx-ui/utils'


import { algorithmLabel, certificateStatusTypeLabel, keyUsagesLabel, usagesLabel } from '../contentsMap'
import { DescriptionText }                                                         from '../styledComponents'

import { Content, RenderType } from './DetailDrawer'

export const getCertificateStatus = (certificate: Certificate): CertificateStatusType => {
  if (certificate?.revocationDate) {
    return CertificateStatusType.REVOKED
  } else if (moment(certificate?.notAfterDate).isSameOrBefore(new Date())) {
    return CertificateStatusType.EXPIRED
  } else if (moment(certificate?.notBeforeDate).isAfter(new Date())) {
    return CertificateStatusType.INVALID
  }
  return CertificateStatusType.VALID
}

export const getDisplayedCertificateStatus = (certificate: Certificate): string => {
  return getIntl().$t(certificateStatusTypeLabel[getCertificateStatus(certificate)])
}

export const getDisplayedItems
  = (items: string[] | KeyUsageType[] | UsageType[], type?: string) => {
    const { $t } = getIntl()
    if (items && items.length === 0) return <div>{noDataDisplay}</div>
    return <>{items.map((item, index) => {
      if (type === 'keyUsages' && Object.values(KeyUsageType).includes(item as KeyUsageType)) {
        return <DescriptionText key={index}>
          {$t(keyUsagesLabel[item as KeyUsageType])}
        </DescriptionText>
      } else if (type === 'usages' && Object.values(UsageType).includes(item as UsageType)) {
        return <DescriptionText key={index}>
          {$t(usagesLabel[item as UsageType]) || item}
        </DescriptionText>
      } else {
        return <DescriptionText key={index}>{item}</DescriptionText>
      }
    })}</>
  }

export const getCertificateDetails =
  (certificateData: Certificate, policySetData: string | null): Content[] => {
    const { $t } = getIntl()
    return [
      {
        type: RenderType.TITLE,
        title: $t({ defaultMessage: 'Certificate Information' }),
        content: [
          {
            type: RenderType.CONTENT_WITH_DETAILS,
            title: $t({ defaultMessage: 'Common Name' }),
            content: certificateData?.commonName,
            detailTitle: $t({ defaultMessage: 'View Certificate' }),
            detail: certificateData?.details
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Status' }),
            content: getDisplayedCertificateStatus(certificateData)
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Valid Not Before' }),
            content: moment(certificateData?.notBeforeDate).format(EXPIRATION_DATE_FORMAT)
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Valid Not After' }),
            content: moment(certificateData?.notAfterDate).format(EXPIRATION_DATE_FORMAT)
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Organization' }),
            content: certificateData?.organization
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Organization Unit' }),
            content: certificateData?.organizationUnit
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Locality' }),
            content: certificateData?.locality
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'State' }),
            content: certificateData?.state
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Country' }),
            content: certificateData?.country
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Serial Number' }),
            content: certificateData?.serialNumber
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Key Length' }),
            content: certificateData?.keyLength
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Key Usage' }),
            content: getDisplayedItems(certificateData?.keyUsages || [], 'keyUsages')
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'SHA Fingerprint' }),
            content: certificateData?.shaThumbprint
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Certificate Template' }),
            content: certificateData?.certificateTemplateName
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Certificate Authority' }),
            content: certificateData?.certificateAuthoritiesName
          },
          {
            type: certificateData?.identityName ? RenderType.LINK : RenderType.CONTENT,
            title: $t({ defaultMessage: 'Identity' }),
            // eslint-disable-next-line max-len
            link: `users/identity-management/identity-group/${certificateData?.identityGroupId}/identity/${certificateData?.identityId}`,
            content: certificateData?.identityName
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Description' }),
            content: certificateData?.description
          }
        ]
      },
      {
        type: RenderType.DOWNLOAD,
        title: $t({ defaultMessage: 'Download' }),
        content: CertificateCategoryType.CERTIFICATE
      },
      {
        type: RenderType.TITLE,
        title: $t({ defaultMessage: 'Usage' }),
        content: [
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Issued' }),
            content: moment(certificateData?.createDate).format(EXPIRATION_TIME_FORMAT)
          },
          {
            type: RenderType.CONTENT,
            title: $t({ defaultMessage: 'Last RADIUS Policy' }),
            content: policySetData
          }
        ]
      }
    ]
  }

export const getCertificateAuthorityDetails =
  (certificateAuthorityData: CertificateAuthority,
    parentCaName: string | null, subCas: string[]): Content[] => {
    const { $t } = getIntl()
    return [
      {
        type: RenderType.TITLE,
        title: $t({ defaultMessage: 'Certificate Authority Information' }),
        content:
          [
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'CA Name' }),
              content: certificateAuthorityData?.name
            },
            {
              type: RenderType.CONTENT_WITH_DETAILS,
              title: $t({ defaultMessage: 'Common Name' }),
              content: certificateAuthorityData?.commonName,
              detailTitle: $t({ defaultMessage: 'View Certificate Authority' }),
              detail: certificateAuthorityData?.publicKeyBase64
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Parent CA' }),
              content: parentCaName
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'SHA Fingerprint' }),
              content: certificateAuthorityData?.publicKeyShaThumbprint
            },
            {
              type: RenderType.DIVIDER
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Organization' }),
              content: certificateAuthorityData?.organization
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Organization Unit' }),
              content: certificateAuthorityData?.organizationUnit
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Email Address' }),
              content: certificateAuthorityData?.email
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Locality' }),
              content: certificateAuthorityData?.locality
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'State' }),
              content: certificateAuthorityData?.state
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Country' }),
              content: certificateAuthorityData?.country
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Usages' }),
              content: getDisplayedItems(certificateAuthorityData?.usages || [], 'usages')
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Start Date' }),
              content: moment(certificateAuthorityData?.startDate).format(EXPIRATION_DATE_FORMAT)
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Expires' }),
              content: moment(certificateAuthorityData?.expireDate).format(EXPIRATION_DATE_FORMAT)
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Key Length' }),
              content: certificateAuthorityData?.keyLength
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Key Usage' }),
              content: getDisplayedItems(certificateAuthorityData?.keyUsages || [], 'keyUsages')
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Algorithm' }),
              content: certificateAuthorityData?.algorithm ?
                $t(algorithmLabel[certificateAuthorityData?.algorithm]) : noDataDisplay
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Serial Number' }),
              content: certificateAuthorityData?.serialNumber
            },
            {
              type: RenderType.CONTENT,
              title: $t({ defaultMessage: 'Description' }),
              content: certificateAuthorityData?.description
            }
          ]
      },
      {
        type: RenderType.VIEW_UPLOAD,
        title: $t({ defaultMessage: 'View & Upload' }),
        content: CertificateCategoryType.CERTIFICATE_AUTHORITY
      },
      {
        type: RenderType.TITLE_WITH_DETAILS,
        title: $t({ defaultMessage: 'Sub CAs ({count})' }, { count: subCas?.length }),
        content: getDisplayedItems(subCas)
      },
      {
        type: RenderType.TITLE_WITH_DETAILS,
        title: $t({ defaultMessage: 'Certificate Templates ({count})' },
          { count: certificateAuthorityData?.templateCount }),
        content: getDisplayedItems(certificateAuthorityData?.templateNames || [])
      }
    ]
  }
