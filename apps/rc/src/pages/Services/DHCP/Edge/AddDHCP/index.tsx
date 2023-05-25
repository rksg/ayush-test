import { useRef } from 'react'

import { useIntl } from 'react-intl'

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
import { useAddEdgeDhcpServiceMutation }                                       from '@acx-ui/rc/services'
import { EdgeDhcpSetting, ServiceOperation, ServiceType, getServiceRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                          from '@acx-ui/react-router-dom'

const AddDhcp = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const formRef = useRef<StepsFormLegacyInstance<EdgeDhcpSetting>>()
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tablePath = getServiceRoutePath(
    { type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = { ...data }
      await addEdgeDhcp({ payload: payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add DHCP for SmartEdge Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }) },
          { text: $t({ defaultMessage: 'DHCP for SmartEdge' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: false, isFetching: isFormSubmitting }]}>
        <StepsFormLegacy
          formRef={formRef}
          onFinish={handleAddEdgeDhcp}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
        >
          <StepsFormLegacy.StepForm>
            <EdgeDhcpSettingForm />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}

export default AddDhcp
