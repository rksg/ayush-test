import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }         from '@acx-ui/components'
import {
  useGetEdgeSdLanQuery,
  useUpdateEdgeSdLanPartialMutation
} from '@acx-ui/rc/services'
import {
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import EdgeSdLanForm, { EdgeSdLanFormModel } from '../EdgeSdLanForm'
import { ScopeForm }                         from '../EdgeSdLanForm/ScopeForm'
import { SettingsForm }                      from '../EdgeSdLanForm/SettingsForm'

const EditEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  const [updateEdgeSdLan] = useUpdateEdgeSdLanPartialMutation()
  const { data, isLoading } = useGetEdgeSdLanQuery({ params })
  const [form] = Form.useForm()

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

  const handleFinish = async (formData: EdgeSdLanFormModel) => {
    try {
      const payload = {
        name: formData.name,
        networkIds: formData.activatedNetworks.map(network => network.id),
        tunnelProfileId: formData.tunnelProfileId
      }

      await updateEdgeSdLan({ params, payload }).unwrap()
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit SD-LAN' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <Loader states={[{ isLoading }]}>
        <EdgeSdLanForm
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}

export default EditEdgeSdLan