import { Col, Form, Row }         from 'antd'
import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { useCreateDirectoryServerMutation, useUpdateDirectoryServerMutation } from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  DirectoryServer,
  usePolicyListBreadcrumb,
  IdentityAttributeMappingNameType,
  AttributeMapping,
  usePolicyPageHeaderTitle,
  useAfterPolicySaveRedirectPath,
  usePolicyPreviousPath
} from '@acx-ui/rc/utils'

import { DirectoryServerSettingForm } from './DirectoryServerSettingForm'

interface DirectoryServerFormProps {
  editMode: boolean
}

export const DirectoryServerForm = (props: DirectoryServerFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const pageTitle = usePolicyPageHeaderTitle(editMode, PolicyType.DIRECTORY_SERVER)

  // eslint-disable-next-line max-len
  const isSupportIdentityAttribute = useIsSplitOn(Features.WIFI_DIRECTORY_PROFILE_REUSE_COMPONENT_TOGGLE)

  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.DIRECTORY_SERVER)
  const previousPath = usePolicyPreviousPath(PolicyType.DIRECTORY_SERVER, PolicyOperation.LIST)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.DIRECTORY_SERVER)

  const [ updateDirectoryServer ] = useUpdateDirectoryServerMutation()
  const [ createDirectoryServer ] = useCreateDirectoryServerMutation()

  const requestPreProcess = (data: DirectoryServer) => {
    const { ...result } = cloneDeep(data)

    if(isSupportIdentityAttribute) {
      //Add three identity attributes to attributeMappings
      const identityMappings = [
        // eslint-disable-next-line max-len
        result.identityName && { name: IdentityAttributeMappingNameType.DISPLAY_NAME, mappedByName: result.identityName },
        // eslint-disable-next-line max-len
        result.identityEmail && { name: IdentityAttributeMappingNameType.EMAIL, mappedByName: result.identityEmail },
        // eslint-disable-next-line max-len
        result.identityPhone && { name: IdentityAttributeMappingNameType.PHONE_NUMBER, mappedByName: result.identityPhone }
      ].filter(Boolean) as AttributeMapping[]

      result.attributeMappings = [...(result.attributeMappings ?? []), ...identityMappings]
      delete result.identityName
      delete result.identityEmail
      delete result.identityPhone
    }

    return result
  }

  const handleFinish = async (data: DirectoryServer) => {
    try {
      const payload = requestPreProcess(data)

      if (editMode) {
        await updateDirectoryServer({ params, payload: payload }).unwrap()
      } else {
        await createDirectoryServer({ params, payload: payload }).unwrap()
      }

      navigate(redirectPathAfterSave, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <StepsForm<DirectoryServer>
        form={form}
        onFinish={handleFinish}
        onCancel={() => navigate(previousPath)}
        buttonLabel={{
          submit: editMode
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <DirectoryServerSettingForm
                policyId={params?.policyId}
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
