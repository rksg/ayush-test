import { useIntl } from 'react-intl'

import { PageHeader, StepsForm } from '@acx-ui/components'
import { MdnsProxySaveData }     from '@acx-ui/rc/utils'

import { MdnsProxyScope }   from '../MdnsProxyScope/MdnsProxyScope'
import { MdnsProxySummary } from '../MdnsProxySummary/MdnsProxySummary'

import MdnsProxyFormContextType  from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'




export interface MdnsProxyFormProps {
  editMode?: boolean;
}

export function MdnsProxyForm (props: MdnsProxyFormProps) {
  const editMode = props.editMode || false
  const { $t } = useIntl()
  const data = {} as MdnsProxySaveData

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure mDNS Proxy Service' })
          : $t({ defaultMessage: 'Add mDNS Proxy Service' })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Add Service' }), link: '/services/select' }
        ]}
      />
      <MdnsProxyFormContextType.Provider value={{ editMode, data }}>
        <StepsForm<MdnsProxySaveData>>
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            onFinish={async () => {
              return true
            }}
          >
            <MdnsProxySettingsForm />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={async () => {
              return true
            }}
          >
            <MdnsProxyScope />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name='summary'
            title={$t({ defaultMessage: 'Summary' })}
            onFinish={async () => {
              return true
            }}
          >
            <MdnsProxySummary />
          </StepsForm.StepForm>
        </StepsForm>
      </MdnsProxyFormContextType.Provider>
    </>
  )
}
