import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useGetEdgeDhcpServiceQuery, useUpdateEdgeDhcpServiceMutation }                                 from '@acx-ui/rc/services'
import { EdgeDhcpSetting, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                from '@acx-ui/react-router-dom'


const EditDhcp = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const formRef = useRef<StepsFormLegacyInstance<EdgeDhcpSetting>>()
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
        <StepsFormLegacy
          formRef={formRef}
          onFinish={handleEditEdgeDhcp}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        >
          <StepsFormLegacy.StepForm>
            <EdgeDhcpSettingForm />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}

export default EditDhcp
