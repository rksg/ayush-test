import { useIntl } from 'react-intl'

import { Loader, PageHeader }                                        from '@acx-ui/components'
import { EdgeCentralizedForwardingSetting, getServiceListRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                from '@acx-ui/react-router-dom'

import CentralizedForwardingForm, { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'
import { ScopeForm }                                                 from '../CentralizedForwardingForm/ScopeForm'
import { SettingsForm }                                              from '../CentralizedForwardingForm/SettingsForm'

const EditEdgeCentralizedForwarding = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // TODO: this should redirect to CF service list when page is ready
  // const cfListRoute = getServiceRoutePath({
  //   type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
  //   oper: ServiceOperation.LIST
  // })
  const cfListRoute = getServiceListRoutePath()
  const linkToServiceList = useTenantLink(cfListRoute)
  // TODO: waiting for API ready.
  // const [updateEdgeCentralizedForwarding] = useUpdateEdgeCentralizedForwardingMutation()
  // const { data, isLoading } = useGetEdgeCentralizedForwardingQuery({ params })

  const data = {
    id: 'mocked_cf_id',
    serviceName: 'testEditData',
    venueId: 'f28540166b95406cae64b46bd12b742f',
    edgeId: '9618C4AC2B1FC511EE8B2B000C2943FE7F',
    corePortId: 'p2',
    networkIds: ['32e06116667b4749855ffbb991d8ac4b'],
    tunnelProfileId: 'f93802759efc49628c572df8af0718b8'
  } as EdgeCentralizedForwardingSetting
  const isLoading = false
  // TODO: end of mocked data

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
    }
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFinish = async (formData: CentralizedForwardingFormModel) => {
    try {
      // TODO: waiting for API ready.
      // const payload = {
      //   serviceName: formData.serviceName,
      //   networkIds: formData.activatedNetworks.map(network => network.id),
      //   tunnelProfileId: formData.tunnelProfileId
      // }
      // await updateEdgeCentralizedForwarding({ params, payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Centralized Forwarding' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Centralized Forwarding' }), link: cfListRoute }
        ]}
      />
      <Loader states={[{ isLoading: isLoading }]}>
        <CentralizedForwardingForm
          steps={steps}
          onFinish={handleFinish}
          editMode
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditEdgeCentralizedForwarding