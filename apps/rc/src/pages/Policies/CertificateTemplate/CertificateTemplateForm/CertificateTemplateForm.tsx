import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                                                                                                                                                                                                    from '@acx-ui/components'
import { useAddCertificateTemplateMutation, useEditCertificateTemplateMutation, useGetCertificateTemplateQuery }                                                                                                                                    from '@acx-ui/rc/services'
import { AlgorithmType, CertificateAuthorityType, CertificateTemplateFormData, ChromebookCertRemovalType, ChromebookEnrollmentType, ExpirationDateEntity, ExpirationType, PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                                                                                                                                                                                               from '@acx-ui/react-router-dom'

import { transferExpirationFormDataToPayload, transferPayloadToExpirationFormData } from '../certificateTemplateUtils'

import MoreSettingsForm from './MoreSettingsForm'
import OnboardForm      from './OnboardForm'
import Summary          from './Summary'




interface CerficateTemplateStepFromProps {
  editMode?: boolean
}

export default function CertificateTemplateForm ({ editMode = false }:
  CerficateTemplateStepFromProps) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm<CertificateTemplateFormData>()
  const [addCertificateTemplate] = useAddCertificateTemplateMutation()
  const [editCertificateTemplate] = useEditCertificateTemplateMutation()
  const { data: dataFromServer } = useGetCertificateTemplateQuery({ params }, { skip: !editMode })
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.CERTIFICATE_TEMPLATE,
    oper: PolicyOperation.LIST
  }))

  const steps = [
    {
      key: 'onboardCA',
      title: $t({ defaultMessage: 'Onboard CA' }),
      content: <OnboardForm editMode={editMode} />,
      showEdit: true
    },
    {
      key: 'moreSettings',
      title: $t({ defaultMessage: 'More Settings' }),
      content: <MoreSettingsForm />,
      showEdit: true
    },
    {
      key: 'summary',
      title: $t({ defaultMessage: 'Summary' }),
      content: <Summary />,
      showEdit: false
    }
  ]

  useEffect(() => {
    if (dataFromServer && editMode) {
      form.setFieldsValue({
        ...dataFromServer,
        ...transferPayloadToExpirationFormData(dataFromServer.onboard),
        defaultAccess: dataFromServer.policySetId ?
          (dataFromServer.defaultAccess ? 'true' : 'false') : undefined
      })
    } else {
      const notBefore = new ExpirationDateEntity()
      notBefore.setToAfterTime(ExpirationType.MONTHS_AFTER_TIME, 1)
      const notAfter = new ExpirationDateEntity()
      notAfter.setToAfterTime(ExpirationType.YEARS_AFTER_TIME, 1)
      form.setFieldsValue({
        caType: CertificateAuthorityType.ONBOARD,
        notBefore,
        notAfter,
        keyLength: 2048,
        algorithm: AlgorithmType.SHA_256,
        chromebook: {
          enabled: false,
          enrollmentType: ChromebookEnrollmentType.DEVICE,
          certRemovalType: ChromebookCertRemovalType.NONE
        }
      })
    }
  }, [dataFromServer, editMode])

  const handleFinish = async (formData: CertificateTemplateFormData) => {
    if (editMode) {
      const { name, keyLength, algorithm, policySetId, defaultAccess, chromebook } = formData
      const {
        commonNamePattern, countryPattern, organizationPattern,
        organizationUnitPattern, statePattern } = formData.onboard!
      const { enabled, enrollmentType, notifyAppId, apiKey,
        certRemovalType, accountCredential } = chromebook || {}
      const payload = {
        name, keyLength, algorithm, policySetId, defaultAccess,
        onboard: {
          commonNamePattern, countryPattern, organizationPattern,
          organizationUnitPattern, statePattern,
          ...transferExpirationFormDataToPayload(formData)
        },
        ...(chromebook ? {
          chromebook: {
            enabled, enrollmentType, notifyAppId, apiKey,
            certRemovalType, accountCredential
          }
        } : { chromebook: { enabled: false } })
      }
      await editCertificateTemplate({ params, payload })
    } else {
      const { notAfter, notBefore, policySetName, chromebook, ...restFormData } = formData
      const payload = {
        ...restFormData,
        onboard: {
          ...restFormData.onboard!,
          ...transferExpirationFormDataToPayload(formData)
        },
        ...(chromebook?.enabled ? {
          chromebook: {
            ...chromebook,
            accountCredentialFile: undefined
          }
        } : {})
      }
      await addCertificateTemplate({
        params: { caId: formData.onboard?.certificateAuthorityId },
        payload
      })
    }
    navigate(linkToList, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit Certificate Template' }) :
          $t({ defaultMessage: 'Add Certificate Template' })}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Control' })
        }, {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }, {
          text: $t({ defaultMessage: 'Certificate Template' }),
          link: getPolicyRoutePath({
            type: PolicyType.CERTIFICATE_TEMPLATE,
            oper: PolicyOperation.LIST
          })
        }]}
      />
      <StepsForm
        onCancel={() => navigate(linkToList)}
        onFinish={handleFinish}
        form={form}
        editMode={editMode}
      >
        {
          steps.map((item, index) =>
            (!editMode || item.showEdit) && <StepsForm.StepForm
              key={`step-${item.key}`}
              name={index.toString()}
              title={item.title}
            >
              {item.content}
            </StepsForm.StepForm>)
        }
      </StepsForm>
    </>
  )
}
