/* eslint-disable max-len */
import { Form, Typography }                         from 'antd'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'

import { TradeOff }                                           from '../../TradeOff'
import { IntroSummary }                                       from '../common/IntroSummary'
import { KpiField }                                           from '../common/KpiField'
import { richTextFormatValues }                               from '../common/richTextFormatValues'
import { getScheduledAt, ScheduleTiming }                     from '../common/ScheduleTiming'
import { IntentConfigurationConfig, useIntentContext }        from '../IntentContext'
import { getGraphKPIs, IntentKPIConfig }                      from '../useIntentDetailsQuery'
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
      <b>Secured network with WPA2/WPA3 encryption:</b>
      This option ensures network security by implementing strong encryption protocols (WPA2 or WPA3), safeguarding data transmission from unauthorized access and protecting against various security threats, providing peace of mind for users.
    </p>
    <p>
      <b>Unsecured open network for user convenience:</b>
      This option provides convenience for users by offering an open network without encryption, allowing easy and immediate access without the need for authentication credentials, but leaving the network vulnerable to unauthorized access and potential security breaches.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: 'Steering mode for {scope} is set as {currentValue}. It is recommended to change the mode to PROACTIVE.' }),
  reason: defineMessage({ defaultMessage: 'Band Balancing (BB) feature intelligently distributes the WLAN clients on the 2.4 GHz and the 5 GHz channels in order to balance the client load. Mode "PROACTIVE" shall have higher efficiency in steering clients from one band to another and hence shall result in improve load on the AP resulting in better WiFi experience to the user.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Advanced client distribution techniques might introduce complexity and require additional configuration, potentially increasing management overhead and requiring more sophisticated monitoring and troubleshooting.</p>
  ` }),
  inactive: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic configuration of Band balancing mode in the network.' })
})

export const IntentAIDetails = createIntentAIDetails(useValuesText)

const options = {
  yes: {
    title: defineMessage({ defaultMessage: 'Yes, apply the intent' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>IntentAI will change encryption method to WPA2/WPA3  for this network. This change will enhance network security by encrypting data transmission, protecting against unauthorized access and security threats, and providing users with confidence in the confidentiality and integrity of their data.</p>
        <p>IntentAI will continuously monitor these configurations.</p>
      `}
    />
  },
  no: {
    title: defineMessage({ defaultMessage: 'No, do not apply the intent' }),
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
      <Typography.Paragraph children={useValuesText().actionText} />
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
    const { intent, kpis, configuration } = useIntentContext()
    const { form } = useStepFormContext()

    const enable = form.getFieldValue('preferences').enable
    return enable
      ? <>
        {configuration && <ConfigurationField configuration={configuration} intent={intent}/>}
        {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
        <ScheduleTiming.FieldSummary />
      </>
      : options.no.content
  }
}).IntentAIForm