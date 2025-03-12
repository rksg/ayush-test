
import { Col, Form, Row }                      from 'antd'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                              from '@acx-ui/components'
import { useCreateDirectoryServerMutation, useUpdateDirectoryServerMutation } from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  redirectPreviousPage,
  DirectoryServer,
  usePolicyListBreadcrumb
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

  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.DIRECTORY_SERVER)
  const tablePath = getPolicyRoutePath({
    type: PolicyType.DIRECTORY_SERVER,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const [ updateDirectoryServer ] = useUpdateDirectoryServerMutation()
  const [ createDirectoryServer ] = useCreateDirectoryServerMutation()

  const handleFinish = async (data: DirectoryServer) => {
    try {
      if (editMode) {
        await updateDirectoryServer({ params, payload: data }).unwrap()
      } else {
        await createDirectoryServer({ params, payload: data }).unwrap()
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
