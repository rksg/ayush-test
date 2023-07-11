import { useEffect } from 'react'

import { Form }                   from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  EdgeDhcpSettingForm, EdgeDhcpSettingFormData
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery, useUpdateEdgeDhcpServiceMutation }                               from '@acx-ui/rc/services'
import { LeaseTimeType, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                              from '@acx-ui/react-router-dom'


const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const [form] = Form.useForm()
  const {
    data: edgeDhcpData,
    isLoading: isEdgeDhcpDataLoading
  } = useGetEdgeDhcpServiceQuery({ params: { id: params.serviceId } })
  const [updateEdgeDhcp, { isLoading: isFormSubmitting }] = useUpdateEdgeDhcpServiceMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tablePath = getServiceRoutePath(
    { type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })

  useEffect(() => {
    if(edgeDhcpData) {
      form.resetFields()
      form.setFieldsValue(edgeDhcpData)
      form.setFieldValue(
        'enableSecondaryDNSServer',
        !!form.getFieldValue('secondaryDnsIp')
      )
      form.setFieldValue(
        'leaseTimeType',
        edgeDhcpData.leaseTime === -1 ? LeaseTimeType.INFINITE : LeaseTimeType.LIMITED
      )
    }
  }, [edgeDhcpData])

  const handleEditEdgeDhcp = async (data: EdgeDhcpSettingFormData) => {
    try {
      const payload = { ...edgeDhcpData, ...data }
      const pathVar = { id: params.serviceId }
      if(payload.leaseTimeType === LeaseTimeType.INFINITE) {
        payload.leaseTime = -1 // -1 means infinite
      }
      delete payload.enableSecondaryDNSServer
      delete payload.leaseTimeType
      await updateEdgeDhcp({ payload, params: pathVar }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit DHCP for SmartEdge Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'DHCP for SmartEdge' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: isEdgeDhcpDataLoading, isFetching: isFormSubmitting }]}>
        <StepsForm
          form={form}
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
