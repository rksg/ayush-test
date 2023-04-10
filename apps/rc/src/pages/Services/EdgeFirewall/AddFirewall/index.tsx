import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, StepsFormNew, useStepFormContext } from '@acx-ui/components'
import { useAddEdgeFirewallMutation }                   from '@acx-ui/rc/services'
import { ACLDirection, StatefulAcl }                    from '@acx-ui/rc/utils'
import { useTenantLink }                                from '@acx-ui/react-router-dom'

import { FirewallForm, FirewallFormEdge }            from '../FirewallForm'
import { ScopeForm }                                 from '../FirewallForm/ScopeForm'
import { SettingsForm }                              from '../FirewallForm/SettingsForm'
import { InboundDefaultRules, OutboundDefaultRules } from '../FirewallForm/SettingsForm/StatefulACLFormItem/StatefulACLConfigDrawer/defaultRules'
import { SummaryForm }                               from '../FirewallForm/SummaryForm'

const AddFirewall = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const { form } = useStepFormContext<FirewallForm>()
  const [addEdgeFirewall] = useAddEdgeFirewallMutation()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      content: <ScopeForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const filterCustomACLRules = (acls: StatefulAcl[]) => {
    acls.forEach(acl => {
      if (acl.direction === ACLDirection.INBOUND) {
        InboundDefaultRules.forEach((inboundRule) => {
          _.remove(acl.rules, _.pick(inboundRule, ['priority', 'accessAction', 'protocolType']))
        })
      } else {
        OutboundDefaultRules.forEach((outboundRule) => {
          _.remove(acl.rules, _.pick(outboundRule, ['priority', 'accessAction', 'protocolType']))
        })
      }

    })
  }

  const handleFinish = async (formData: FirewallForm) => {
    try {
      const payload = { ...(_.omit(formData, ['selectedEdges'])) }
      payload.edgeIds = formData.selectedEdges.map((edge: FirewallFormEdge) => edge.serialNumber)
      payload.statefulAcls = payload.statefulAclEnabled ? payload.statefulAcls : []
      filterCustomACLRules(payload.statefulAcls ?? [])

      await addEdgeFirewall({ payload }).unwrap()
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Firewall Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsFormNew
        form={form}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleFinish}
        initialValues={{
          ddosRateLimitingRules: []
        }}
      >
        {
          steps.map((item, index) =>
            <StepsFormNew.StepForm
              key={`step-${index}`}
              name={index.toString()}
              title={item.title}
            >
              {item.content}
            </StepsFormNew.StepForm>)
        }
      </StepsFormNew>
    </>
  )
}

export default AddFirewall
