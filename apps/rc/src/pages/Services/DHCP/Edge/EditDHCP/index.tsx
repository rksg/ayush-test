import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Loader,
  PageHeader, showToast, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery, useUpdateEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSetting }                                              from '@acx-ui/rc/utils'
import { useTenantLink }                                                from '@acx-ui/react-router-dom'



const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const formRef = useRef<StepsFormInstance<EdgeDhcpSetting>>()
  const {
    data: edgeDhcpData,
    isLoading: isEdgeDhcpDataLoading
  } = useGetEdgeDhcpServiceQuery({ params: { id: params.serviceId } })
  const [updateEdgeDhcp, { isLoading: isFormSubmitting }] = useUpdateEdgeDhcpServiceMutation()

  useEffect(() => {
    if(edgeDhcpData) {
      formRef.current?.resetFields()
      formRef.current?.setFieldsValue(edgeDhcpData)
      formRef.current?.setFieldValue(
        'enableSecondaryDNSServer',
        !!formRef.current?.getFieldValue('secondaryDnsIp')
      )
    }
  }, [edgeDhcpData])

  const handleEditEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = { ...edgeDhcpData, ...data }
      const pathVar = { id: params.serviceId }
      await updateEdgeDhcp({ payload, params: pathVar }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit DHCP for SmartEdge Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: isEdgeDhcpDataLoading, isFetching: isFormSubmitting }]}>
        <StepsForm
          formRef={formRef}
          onFinish={handleEditEdgeDhcp}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        >
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}

export default EditDhcp
