import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }          from '@acx-ui/components'
import { useEdgeSdLanActions } from '@acx-ui/edge/components'
import {
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormContainer, EdgeSdLanFormType } from '../Form'
import { GeneralForm }                               from '../Form/GeneralForm'
import { NetworkSelectionForm }                      from '../Form/NetworkSelectionForm'
import { SummaryForm }                               from '../Form/SummaryForm'

export const AddEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()

  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(cfListRoute)
  const { createEdgeSdLan } = useEdgeSdLanActions()
  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Network Selection' }),
      content: NetworkSelectionForm
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: SummaryForm
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {
    try {
      await new Promise(async (resolve, reject) => {
        await createEdgeSdLan({
          payload: {
            name: formData.name,
            tunnelProfileId: formData.tunnelProfileId,
            activeNetwork: Object.entries(formData.activatedNetworks)
              .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
                venueId,
                networkId,
                tunnelProfileId
              }))).flat()
          },
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }
          }
        // need to catch basic service profile failed
        }).catch(reject)
      })

      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(linkToServiceList, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SD-LAN Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <EdgeSdLanFormContainer
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}
