import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, StepsFormNew, useStepFormContext } from '@acx-ui/components'
import { useTenantLink }                                from '@acx-ui/react-router-dom'

import { FirewallForm } from '../FirewallForm'
import { ScopeForm }    from '../FirewallForm/ScopeForm'
import { SettingsForm } from '../FirewallForm/SettingsForm'
import { SummaryForm }  from '../FirewallForm/SummaryForm'

const AddFirewall = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const { form } = useStepFormContext<FirewallForm>()

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
