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
import { IntentConfigurationConfig, useIntentContext }        from '../IntentContext'
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
  label: defineMessage({ defaultMessage: 'Client Load Balancing' }),
  valueFormatter: formatter('enabledFormat')
}

export const kpis: IntentKPIConfig[] = [{
  key: 'avg-ap-unique-client-count',
  label: defineMessage({ defaultMessage: 'Average AP Unique Clients' }),
  format: formatter('countFormat'),
  deltaSign: 'none'
}, {
  key: 'max-ap-unique-client-count',
  label: defineMessage({ defaultMessage: 'Max AP Unique Clients' }),
  format: formatter('countFormat'),
  deltaSign: 'none'
}]

const useValuesText = createUseValuesText({
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Enhance network performance with load balancing:</b>
      Implementing load balancing optimizes network performance by evenly distributing client connections across access points, preventing overloading on specific APs and ensuring efficient utilization of network resources.
    </p>
    <p>
      <b>Maintain stability by disabling load balancing:</b>
      Disabling load balancing prioritizes network stability over performance optimization, ensuring consistent connectivity and reducing the risk of disruptions caused by frequent client reassignments.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: `
    <p>IntentAI will enable load balancing based on client count for this network, this change shall improve network performance by evenly distributing client connections, preventing congestion on specific access points and optimizing overall throughput and reliability.</p>
    <p>IntentAI will continuously monitor these configurations.</p>
  ` }),
  reason: defineMessage({ defaultMessage: 'Client Load Balancing allows equal distribution of clients by allowing heavily loaded APs to move clients to less loaded neighboring APs, This shall result in better radio utilization resulting in better Wi-Fi experience to the user.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Load balancing mechanisms may introduce complexity and require additional management overhead, potentially leading to increased network latency or disruptions during client reassignments.</p>
  ` }),
  noData: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic configuration of load balancing in the network.' })
})

export const IntentAIDetails = createIntentAIDetails(useValuesText)

const options = {
  yes: {
    title: defineMessage({ defaultMessage: 'Yes, apply the recommendation' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>IntentAI will enable load balancing based on client count for this network, this change shall improve network performance by evenly distributing client connections, preventing congestion on specific access points and optimizing overall throughput and reliability.</p>
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
  SideNote: () => <Reason
    reasonText={useValuesText().reasonText}
    resources={[{
      icon: 'video' as const,
      label: defineMessage({ defaultMessage: 'RUCKUS AI - AI Operations Demo' }),
      link: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
    },
    {
      icon: 'document' as const,
      label: defineMessage({ defaultMessage: 'RUCKUS AI User Guide' }),
      link: 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
    }]} />,
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
      <StepsForm.Subtitle children={$t({ defaultMessage: 'What is your primary network intent for <VenueSingular></VenueSingular>: {zone}' }, { zone: intent.sliceValue })} />

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