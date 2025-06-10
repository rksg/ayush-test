import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                                                                                                                                                                                                                                        from '@acx-ui/components'
import { useAddCertificateTemplateMutation, useBindCertificateTemplateWithPolicySetMutation, useEditCertificateTemplateMutation, useGetCertificateTemplateQuery, useUnbindCertificateTemplateWithPolicySetMutation }                                                                    from '@acx-ui/rc/services'
import { AlgorithmType, CertificateAuthorityType, CertificateTemplateFormData, ChromebookCertRemovalType, ChromebookEnrollmentType, ExpirationDateEntity, ExpirationType, PolicyOperation, PolicyType, useAfterPolicySaveRedirectPath, usePolicyListBreadcrumb, usePolicyPreviousPath } from '@acx-ui/rc/utils'
import { useNavigate }                                                                                                                                                                                                                                                                  from '@acx-ui/react-router-dom'

import { transferExpirationFormDataToPayload, transferPayloadToExpirationFormData } from '../certificateTemplateUtils'

import MoreSettingsForm from './MoreSettingsForm'
import OnboardForm      from './OnboardForm'
import Summary          from './Summary'




interface CerficateTemplateStepFromProps {
  editMode?: boolean
  modalMode?: boolean,
  modalCallBack?: (result?: string) => void
}

export function CertificateTemplateForm (props: CerficateTemplateStepFromProps) {
  const { editMode = false, modalMode = false, modalCallBack } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm<CertificateTemplateFormData>()
  const [addCertificateTemplate] = useAddCertificateTemplateMutation()
  const [editCertificateTemplate] = useEditCertificateTemplateMutation()
  const [bindPolicySet] = useBindCertificateTemplateWithPolicySetMutation()
  const [unbindPolicySet] = useUnbindCertificateTemplateWithPolicySetMutation()
  const { data: dataFromServer } = useGetCertificateTemplateQuery({ params }, { skip: !editMode })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.CERTIFICATE_TEMPLATE)
  const previousPath = usePolicyPreviousPath(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.LIST)
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.CERTIFICATE_TEMPLATE)

  const steps = [
    {
      key: 'templateDetails',
      title: $t({ defaultMessage: 'Template Details' }),
      content: <OnboardForm editMode={editMode}/>,
      showEdit: true
    },
    {
      key: 'moreSettings',
      title: $t({ defaultMessage: 'Settings' }),
      content: <MoreSettingsForm editMode={editMode}/>,
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
        keyLength: 4096,
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
        organizationUnitPattern, statePattern, localityPattern } = formData.onboard!
      const { enabled, enrollmentType, notifyAppId, apiKey,
        certRemovalType, accountCredential } = chromebook || {}
      const payload = {
        name, keyLength, algorithm, defaultAccess,
        onboard: {
          commonNamePattern, countryPattern, organizationPattern,
          organizationUnitPattern, statePattern, localityPattern,
          ...transferExpirationFormDataToPayload(formData)
        },
        ...(chromebook ? {
          chromebook: {
            enabled, enrollmentType, notifyAppId, apiKey,
            certRemovalType, accountCredential
          }
        } : { chromebook: { enabled: false } })
      }

      const promises = []
      promises.push(editCertificateTemplate({ params, payload }))
      if (policySetId) {
        promises.push(bindPolicySet({ params: { templateId: params.policyId, policySetId } }))
      } else if (dataFromServer?.policySetId) {
        // eslint-disable-next-line max-len
        promises.push(unbindPolicySet({ params: { templateId: params.policyId, policySetId: dataFromServer?.policySetId } }))
      }
      await Promise.all(promises)
    } else {
      const { notAfter, notBefore, policySetId, policySetName,
        identityGroupId, identityGroupName, chromebook, ...restFormData } = formData
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
        } : {}),
        identityGroupId
      }
      const res = await addCertificateTemplate({
        params: { caId: formData.onboard?.certificateAuthorityId },
        payload
      }).unwrap()

      if (res.id) {
        const promises = []
        if (policySetId) {
          promises.push(bindPolicySet({ params: { templateId: res.id, policySetId } }))
        }
        await Promise.all(promises)
      }
      if (modalMode && res) {
        modalCallBack?.(res.id)
      }
    }
    if (!modalMode) {
      navigate(redirectPathAfterSave, { replace: true })
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit Certificate Template' }) :
          $t({ defaultMessage: 'Add Certificate Template' })}
        breadcrumb={breadcrumb}
      />}
      <StepsForm
        onCancel={() => modalMode ? modalCallBack?.() : navigate(previousPath)}
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
