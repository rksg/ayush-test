import { useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { MdnsProxyFormData }                        from '@acx-ui/rc/utils'

import { MdnsProxyScope }   from '../MdnsProxyScope/MdnsProxyScope'
import { MdnsProxySummary } from '../MdnsProxySummary/MdnsProxySummary'

import MdnsProxyFormContext      from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'


export interface MdnsProxyFormProps {
  editMode?: boolean;
}

export function MdnsProxyForm ({ editMode = false }: MdnsProxyFormProps) {
  const { $t } = useIntl()
  const formRef = useRef<StepsFormInstance<MdnsProxyFormData>>()

  useEffect(() => {
    // formRef?.current?.setFieldsValue({
    //   name: 'JackyDefault',
    //   forwardingRules: [{ type: 'AirPlay', fromVlan: 99, toVlan: 999 }]
    // })
  })

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
      <MdnsProxyFormContext.Provider value={{ editMode }}>
        <StepsForm<MdnsProxyFormData>
          formRef={formRef}
        >
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
      </MdnsProxyFormContext.Provider>
    </>
  )
}
