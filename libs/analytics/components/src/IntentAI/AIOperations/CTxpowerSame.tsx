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
  label: defineMessage({ defaultMessage: '2.4 GHz TX Power Adjustment' }),
  valueFormatter: formatter('txFormat')
}

export const kpis: IntentKPIConfig[] = [
  {
    key: 'session-time-on-24GHz',
    label: defineMessage({ defaultMessage: 'Session time on 2.4 GHz' }),
    format: formatter('percentFormat'),
    deltaSign: '-'
  },
  {
    key: 'co-channel-interference-ratio',
    label: defineMessage({ defaultMessage: 'Co-channel Interference Ratio' }),
    format: formatter('percentFormat'),
    deltaSign: '-'
  }
]

const useValuesText = createUseValuesText({
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Optimize for 5 GHz, reduce 2.4 GHz power:</b>
      This option prioritizes the 5 GHz band by decreasing the transmit power of the 2.4 GHz band, aiming to improve overall network performance and reliability by encouraging device connection to the less congested 5 GHz band.
    </p>
    <p>
      <b>Preserve 2.4 GHz range, keep power unchanged:</b>
      This option maintains the transmit power of the 2.4 GHz band to preserve its range and ensure broader coverage, prioritizing compatibility and connectivity for devices that rely on the 2.4 GHz band.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: `
    <p>IntentAI will reduce 2.4 GHz power for this network. This change will enhance 5 GHz network performance by encouraging device connection to the less congested 5 GHz band, resulting in faster speeds and improved reliability for compatible devices.</p>
    <p>IntentAI will continuously monitor these configurations.</p>
  ` }),
  reason: defineMessage({ defaultMessage: 'Encourages client association to 5 GHz/6 GHz and reduces co-channel interference.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Devices that rely solely on the 2.4 GHz band may experience reduced signal strength and potentially slower speeds, particularly if they are located at the edge of coverage areas or in areas with obstacles that attenuate 5 GHz signals.</p>
  ` }),
  noData: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic reduction of Transmit Power setting for 2.4 GHz in the network.' })
})

export const IntentAIDetails = createIntentAIDetails(useValuesText)

const options = {
  yes: {
    title: defineMessage({ defaultMessage: 'Yes, apply the recommendation' }),
    content: <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>IntentAI will reduce 2.4 GHz power for this network. This change will enhance 5 GHz network performance by encouraging device connection to the less congested 5 GHz band, resulting in faster speeds and improved reliability for compatible devices.</p>
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
    resources={<ResourcesLinks feature={AiFeatures.AIOps} />} />,
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
