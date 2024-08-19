
import { useEffect, useState } from 'react'

import { Col, Form, Row }                      from 'antd'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                                              from '@acx-ui/components'
import { useCreateSoftGreMutation, useGetSoftGreViewDataListQuery, useUpdateSoftGreMutation } from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  redirectPreviousPage,
  SoftGre,
  usePolicyListBreadcrumb,
  SoftGreViewData
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { SoftGreSettingForm } from './softGreSettingForm'

interface SoftGreFormProps {
  editMode: boolean
}

export const SoftGreForm = (props: SoftGreFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [isSwitchDisabled, setIsSwitchsDisabled] = useState(false)

  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SOFTGRE)
  const tablePath = getPolicyRoutePath({
    type: PolicyType.SOFTGRE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const [ updateSoftGre ] = useUpdateSoftGreMutation()
  const [ createSoftGre ] = useCreateSoftGreMutation()

  const { softGreData } = useGetSoftGreViewDataListQuery(
    { params, payload: { filters: { id: [params.policyId] } } },
    {
      skip: !editMode,
      selectFromResult: ({ data }) => {
        return { softGreData: (data?.data?.[0] ?? {}) as SoftGreViewData }
      }
    }
  )

  const handleFinish = async (data: SoftGre) => {
    try {
      if (editMode) {
        await updateSoftGre({ params, payload: data }).unwrap() // for softGre

      } else {
        await createSoftGre({ params, payload: data }).unwrap()
      }
      redirectPreviousPage(navigate, previousPath, linkToTableView)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (!editMode || !softGreData) return

    form.setFieldsValue(softGreData)

    if (softGreData?.activationInformations?.length > 0) {
      const isSwitchsDisabled =
        softGreData?.activationInformations?.some(venue => venue.aaaAffinityEnabled === true)
      setIsSwitchsDisabled(isSwitchsDisabled)
    }
  }, [softGreData, form, editMode])

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit SoftGRE' })
          : $t({ defaultMessage: 'Add SoftGRE' })
        }
        breadcrumb={breadcrumb}
      />
      <StepsForm<SoftGre>
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
              <SoftGreSettingForm editMode={editMode} isSwitchDisabled={isSwitchDisabled} />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}