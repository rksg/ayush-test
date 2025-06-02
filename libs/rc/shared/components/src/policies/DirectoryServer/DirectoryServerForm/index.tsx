import { Col, Form, Row }                      from 'antd'
import { cloneDeep }                           from 'lodash'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { useCreateDirectoryServerMutation, useUpdateDirectoryServerMutation } from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  redirectPreviousPage,
  DirectoryServer,
  usePolicyListBreadcrumb,
  combineAttributeMappingsToData
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { DirectoryServerSettingForm } from './DirectoryServerSettingForm'

interface DirectoryServerFormProps {
  editMode: boolean
}

export const DirectoryServerForm = (props: DirectoryServerFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  // eslint-disable-next-line max-len
  const isSupportIdentityAttribute = useIsSplitOn(Features.WIFI_DIRECTORY_PROFILE_REUSE_COMPONENT_TOGGLE)

  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.DIRECTORY_SERVER)
  const tablePath = getPolicyRoutePath({
    type: PolicyType.DIRECTORY_SERVER,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const [ updateDirectoryServer ] = useUpdateDirectoryServerMutation()
  const [ createDirectoryServer ] = useCreateDirectoryServerMutation()

  const requestPreProcess = (data: DirectoryServer) => {
    const { ...result } = cloneDeep(data)

    if(isSupportIdentityAttribute) {
      Object.assign(result, combineAttributeMappingsToData(result))
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

      redirectPreviousPage(navigate, previousPath, linkToTableView)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Directory Server' })
          : $t({ defaultMessage: 'Add Directory Server' })
        }
        breadcrumb={breadcrumb}
      />
      <StepsForm<DirectoryServer>
        form={form}
        onFinish={handleFinish}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
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
