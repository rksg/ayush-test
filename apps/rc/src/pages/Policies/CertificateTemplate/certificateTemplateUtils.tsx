import { Fragment } from 'react'

import { isEmpty } from 'lodash'
import moment      from 'moment-timezone'

import { AlgorithmType, Certificate, CertificateExpirationType, CertificateStatusType, CertificateTemplateFormData, EXPIRATION_TIME_FORMAT, ExpirationDateEntity, ExpirationMode, ExpirationType, OnboardCA, CertificateAuthority, CertificateCategoryType, EXPIRATION_DATE_FORMAT, KeyUsageType, UsageType } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                                                                                                                                                                                                            from '@acx-ui/utils'


import { Content, RenderType }                                                     from './CertificateTemplateTable/DetailDrawer'
import { algorithmLabel, certificateStatusTypeLabel, keyUsagesLabel, usagesLabel } from './contentsMap'
import { DescriptionText, TooltipTitle }                                           from './styledComponents'

export const MAX_CERTIFICATE_PER_TENANT = 10000
export const DEFAULT_PLACEHOLDER = '--'

const toLocalDateString = (date: string) => {
  return moment.utc(date).subtract(23, 'h').subtract(59, 'm').subtract(59, 's').local().format()
}

const getExpirationTypeByValue = (value: string): ExpirationType => {
  switch (value) {
    case 'YEARS':
      return ExpirationType.YEARS_AFTER_TIME
    case 'HOURS':
      return ExpirationType.HOURS_AFTER_TIME
    case 'DAYS':
      return ExpirationType.DAYS_AFTER_TIME
    case 'WEEKS':
      return ExpirationType.WEEKS_AFTER_TIME
    case 'MONTHS':
      return ExpirationType.MONTHS_AFTER_TIME
    case 'MINUTES':
      return ExpirationType.MINUTES_AFTER_TIME
    default:
      return ExpirationType.SPECIFIED_DATE
  }
}

const setExpirationDateEntity = (type: CertificateExpirationType, date: string, value: number) => {
  const entity = new ExpirationDateEntity()
  const transferedType = getExpirationTypeByValue(type)

  if (transferedType === ExpirationType.SPECIFIED_DATE) {
    entity.setToByDate(toLocalDateString(date))
  } else {
    entity.setToAfterTime(transferedType, value)
  }

  return entity
}

type modelMapping = { typeKey: string; valueKey: string; dateKey: string; }
const setPayloadExpiration = (expiration: ExpirationDateEntity, modeMapping: modelMapping) => {
  const result: { [key: string]: CertificateExpirationType | number | string | undefined } = {}
  if (expiration.mode === ExpirationMode.AFTER_TIME) {
    result[modeMapping.typeKey] = CertificateExpirationType[expiration.type!]
    result[modeMapping.valueKey] = expiration.offset
  } else if (expiration.mode === ExpirationMode.BY_DATE) {
    result[modeMapping.dateKey] = expiration.date
    result[modeMapping.typeKey] = CertificateExpirationType[ExpirationType.SPECIFIED_DATE]
  }
  return result
}

export const transferPayloadToExpirationFormData = (onboardCa?: OnboardCA) => {
  if (!onboardCa) {
    const notAfter: ExpirationDateEntity = new ExpirationDateEntity()
    const notBefore: ExpirationDateEntity = new ExpirationDateEntity()
    return { notAfter, notBefore }
  }

  const {
    notAfterDate, notAfterType, notAfterValue,
    notBeforeDate, notBeforeType, notBeforeValue
  } = onboardCa

  const notAfter = setExpirationDateEntity(notAfterType, notAfterDate || '', notAfterValue || 0)
  const notBefore = setExpirationDateEntity(notBeforeType, notBeforeDate || '', notBeforeValue || 0)
  return { notAfter, notBefore }
}

export const transferExpirationFormDataToPayload = (formData: CertificateTemplateFormData) => {
  return {
    // eslint-disable-next-line max-len
    ...setPayloadExpiration(formData.notAfter, { typeKey: 'notAfterType', valueKey: 'notAfterValue', dateKey: 'notAfterDate' }),
    // eslint-disable-next-line max-len
    ...setPayloadExpiration(formData.notBefore, { typeKey: 'notBeforeType', valueKey: 'notBeforeValue', dateKey: 'notBeforeDate' })
  }
}

export const getTooltipContent = (names: string[], title: string) => {
  const { $t } = getIntl()
  if (isEmpty(names)) return null
  const showCount = 26
  let formattedNameList = names?.slice(0, showCount).map((name, idx) => {
    return <Fragment key={idx}>{name} <br /></Fragment>
  })

  if (names.length > showCount) {
    formattedNameList.push(<Fragment key='more'>{$t({ defaultMessage: 'and {count} more...' },
      { count: names.length - showCount })}</Fragment>)
  };

  return <>
    <TooltipTitle>{title}</TooltipTitle>
    {formattedNameList}
  </>
}


export const getDisplayedCertificateStatus = (certificate: Certificate): string => {
  const { $t } = getIntl()
  if (certificate?.revocationDate) {
    const revocationDate = moment(certificate?.revocationDate).format(EXPIRATION_TIME_FORMAT)
    return $t(certificateStatusTypeLabel[CertificateStatusType.REVOKED], { revocationDate })
  } else if (moment(certificate?.notAfterDate).isSameOrBefore(new Date())) {
    return $t(certificateStatusTypeLabel[CertificateStatusType.EXPIRED])
  }
  return $t(certificateStatusTypeLabel[CertificateStatusType.VALID])
}

export const getDisplayedAlgorithm = (algorithm: AlgorithmType) => {
  const { $t } = getIntl()
  return algorithm ? $t(algorithmLabel[algorithm]) : DEFAULT_PLACEHOLDER
}

export const getDisplayedItems
  = (items: string[] | KeyUsageType[] | UsageType[], type?: string) => {
    const { $t } = getIntl()
    if (items && items.length === 0) return <div>{DEFAULT_PLACEHOLDER}</div>
    return items?.map((item, index) => {
      if (type === 'keyUsages') {
        return <DescriptionText key={index}>
          {$t(keyUsagesLabel[item as KeyUsageType])}
        </DescriptionText>
      } else if (type === 'usages') {
        return <DescriptionText key={index}>{$t(usagesLabel[item as UsageType])}</DescriptionText>
      } else {
        return <DescriptionText key={index}>{item}</DescriptionText>
      }
    })
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
            title: $t({ defaultMessage: 'Key Usage' }),
            content: getDisplayedItems(certificateData?.keyUsage || [], 'keyUsages')
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
            title: $t({ defaultMessage: 'Adaptive Policy Set' }),
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
              content: getDisplayedAlgorithm(certificateAuthorityData?.algorithm)
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
        type: RenderType.DOWNLOAD,
        title: $t({ defaultMessage: 'Download' }),
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