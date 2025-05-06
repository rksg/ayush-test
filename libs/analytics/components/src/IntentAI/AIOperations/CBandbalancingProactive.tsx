/* eslint-disable max-len */
import { Form }                                     from 'antd'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'

import { TradeOff }                                           from '../../TradeOff'
import { IntroSummary }                                       from '../common/IntroSummary'
import { KPIFields }                                          from '../common/KPIs'
import { richTextFormatValues }                               from '../common/richTextFormatValues'
import { getScheduledAt, ScheduleTiming }                     from '../common/ScheduleTiming'
import { AiFeatures }                                         from '../config'
import { IntentConfigurationConfig, useIntentContext }        from '../IntentContext'
import ResourcesLinks                                         from '../ResourcesLinks'
import { IntentKPIConfig }                                    from '../useIntentDetailsQuery'
import { useInitialValues }                                   from '../useIntentTransition'
import { Actions, getTransitionStatus, TransitionIntentItem } from '../utils'

import { ConfigurationField }    from './ConfigurationField'
import { createIntentAIDetails } from './createIntentAIDetails'
import { createIntentAIForm }    from './createIntentAIForm'
import { createUseValuesText }   from './createUseValuesText'
import { Reason }                from './SideNotes/Reason'
import { Tradeoff }              from './SideNotes/Tradeoff'

export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'Load Balancing: Steering Mode' }),
  valueFormatter: formatter('noFormat')
}

export const kpis: IntentKPIConfig[] = [{
  key: 'client-ratio',
  label: defineMessage({ defaultMessage: 'Percentage of Clients on 2.4 GHz' }),
  format: formatter('percentFormat'),
  deltaSign: '-'
}]

const useValuesText = createUseValuesText({
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Switch to proactive for optimized client distribution:</b>
      Transitioning to proactive client distribution mode allows for more intelligent allocation of clients to access points, optimizing network performance by balancing client load across APs.
    </p>
    <p>
      <b>Stay on basic for better client compatibility:</b>
      Remaining on basic mode prioritizes client compatibility, ensuring seamless connectivity for a wide range of devices without implementing advanced load balancing techniques.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: `
    <p>IntentAI will change band balancing mode to Proactive for this network, this change will optimize client distribution, enhancing overall network performance by efficiently balancing client load across access points, which shall improve throughput and reduce congestion.</p>
    <p>IntentAI will continuously monitor these configurations.</p>
  ` }),
  reason: defineMessage({ defaultMessage: 'Band Balancing (BB) feature intelligently distributes the WLAN clients on the 2.4 GHz and the 5 GHz channels in order to balance the client load. Mode "PROACTIVE" shall have higher efficiency in steering clients from one band to another and hence shall result in improve load on the AP resulting in better WiFi experience to the user.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Advanced client distribution techniques might introduce complexity and require additional configuration, potentially increasing management overhead and requiring more sophisticated monitoring and troubleshooting.</p>
  ` }),
  noData: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic configuration of Band balancing mode in the network.' })
})

export const IntentAIDetails = createIntentAIDetails(useValuesText)

const options = {
  yes: {
    title: defineMessage({ defaultMessage: 'Yes, apply the recommendation' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>IntentAI will change band balancing mode to Proactive for this network, this change will optimize client distribution, enhancing overall network performance by efficiently balancing client load across access points, which shall improve throughput and reduce congestion.</p>
        <p>IntentAI will continuously monitor these configurations.</p>
      `}
    />
  },
  no: {
    title: defineMessage({ defaultMessage: 'No, do not apply the recommendation' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>IntentAI will maintain the existing network configuration and will cease automated monitoring and change for this Intent.</p>
        <p>For manual control, you may directly change the network configurations.</p>
        <p>For automated monitoring and control, you can select the "Resume" action, after which IntentAI will resume overseeing the network for this Intent.</p>
    `} />
  }
}

export const IntentAIForm = createIntentAIForm<{ enable: boolean }>({
  useInitialValues: () => {
    const initialValues = useInitialValues()
    // always enable = true, because only new, scheduled, active, applyscheduled can open wizard
    return { ...initialValues, preferences: { enable: true } }
  },
  getFormDTO: (values) => {
    const nextStatus = getTransitionStatus(
      values.preferences?.enable ? Actions.Optimize : Actions.Pause,
      values as TransitionIntentItem
    )

    return {
      id: values.id,
      ..._.omit(nextStatus, 'createAt'),
      ...(values.preferences?.enable && {
        metadata: { scheduledAt: getScheduledAt(values).utc().toISOString() }
      })
    }
  }
}).addStep({
  title: defineMessage({ defaultMessage: 'Introduction' }),
  SideNote: () => (
    <Reason
      reasonText={useValuesText().reasonText}
      resources={<ResourcesLinks feature={AiFeatures.AIOps} />}
    />
  ),
  Content: () => (<>
    <IntroSummary />
    <StepsForm.Subtitle>
      <FormattedMessage defaultMessage='Network Intent plays a crucial role in wireless network design' />
    </StepsForm.Subtitle>
    {useValuesText().introText}
  </>)
}).addStep({
  title: defineMessage({ defaultMessage: 'Intent Priority' }),
  SideNote: () => <Tradeoff tradeoffText={useValuesText().tradeoffText} />,
  Content: () => {
    const { $t } = useIntl()
    const { intent } = useIntentContext()
    return <>
      <StepsForm.Subtitle children={$t({ defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular> “{zone}” ?' }, { zone: intent.sliceValue })} />

      <Form.Item name={['preferences','enable']}>
        <TradeOff
          headers={[
            $t({ defaultMessage: 'Intent Priority' }),
            $t({ defaultMessage: 'IntentAI Scope' })
          ]}
          radios={[{
            key: 'yes',
            value: true,
            children: $t(options.yes.title),
            columns: [ $t(options.yes.title), options.yes.content ]
          }, {
            key: 'no',
            value: false,
            children: $t(options.no.title),
            columns: [ $t(options.no.title), options.no.content ]
          }]}
        />
      </Form.Item>
    </>
  }
}).addStep({
  title: defineMessage({ defaultMessage: 'Settings' }),
  Content: () => {
    const { form } = useStepFormContext()
    const enable = form.getFieldValue('preferences').enable
    return <ScheduleTiming disabled={!enable}/>
  }
}).addStep({
  title: defineMessage({ defaultMessage: 'Summary' }),
  Content: () => {
    const { intent, configuration } = useIntentContext()
    const { form } = useStepFormContext()

    const enable = form.getFieldValue('preferences').enable
    return enable
      ? <>
        {configuration && <ConfigurationField configuration={configuration} intent={intent}/>}
        <KPIFields/>
        <ScheduleTiming.FieldSummary />
      </>
      : options.no.content
  }
}).IntentAIForm