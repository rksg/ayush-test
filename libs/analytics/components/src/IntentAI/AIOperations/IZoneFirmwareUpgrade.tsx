/* eslint-disable max-len */
import { Form, Typography }                         from 'antd'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'

import { TradeOff }                      from '../../TradeOff'
import { IntroSummary }                  from '../common/IntroSummary'
import { KpiField }                      from '../common/KpiField'
import { richTextFormatValues }          from '../common/richTextFormatValues'
import { useIntentContext }              from '../IntentContext'
import { statuses, statusReasons }       from '../states'
import { getGraphKPIs, IntentKPIConfig } from '../useIntentDetailsQuery'

import { createIntentAIDetails } from './createIntentAIDetails'
import { createIntentAIForm }    from './createIntentAIForm'
import { createUseValuesText }   from './createUseValuesText'
import { Reason }                from './SideNotes/Reason'
import { Tradeoff }              from './SideNotes/Tradeoff'

export const kpis: IntentKPIConfig[] = [{
  key: 'aps-on-latest-fw-version',
  label: defineMessage({ defaultMessage: 'APs on Latest Firmware Version' }),
  valueAccessor: ([x, y]: number[]) => x / y,
  valueFormatter: formatter('percentFormat'),
  deltaSign: '+',
  format: formatter('ratioFormat')
}]

const useValuesText = createUseValuesText({
  action: defineMessage({ defaultMessage: '{scope} is running with older AP firmware version {currentValue}. It is recommended to upgrade zone to the latest available AP firmware version.' }),
  reason: defineMessage({ defaultMessage: 'Latest AP firmware version in the zone will ensure all the APs in zone have the best available firmware with appropriate security/bug fixes and new features.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Upgrades may temporarily disrupt network operations and require careful planning to mitigate potential compatibility issues with existing hardware or software configurations.</p>
  ` }),
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Upgrade for latest security and features:</b>
      Upgrading the network ensures it benefits from the latest security patches and features, enhancing protection against cyber threats and enabling access to new functionalities for improved performance.
    </p>
    <p>
      <b>Delay to avoid network downtime and compatibility issues:</b>
      Delaying upgrades prioritizes network stability and compatibility, minimizing the risk of potential downtime and ensuring existing devices continue to function without compatibility issues.
    </p>
  ` })
})

export const IntentAIDetails = createIntentAIDetails(useValuesText)
export const IntentAIForm = createIntentAIForm({
  useInitialValues: () => ({ enable: true }),
  getFormDTO: (values) => values.enable
    ? { status: statuses.scheduled }
    : { status: statuses.paused, statusReason: statusReasons.fromInactive }
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
      <FormattedMessage defaultMessage='Why is the recommendation?' />
    </StepsForm.Subtitle>
    <FormattedMessage
      values={richTextFormatValues}
      defaultMessage={`
        <p>
          <b>Upgrade for latest security and features:</b>
          Upgrading the network ensures it benefits from the latest security patches and features, enhancing protection against cyber threats and enabling access to new functionalities for improved performance.
        </p>
        <p>
          <b>Delay to avoid network downtime and compatibility issues:</b>
          Delaying upgrades prioritizes network stability and compatibility, minimizing the risk of potential downtime and ensuring existing devices continue to function without compatibility issues.
        </p>
      `} />
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

      <Form.Item name={'enable'}>
        <TradeOff
          headers={[
            $t({ defaultMessage: 'Intent Priority' }),
            $t({ defaultMessage: 'IntentAI Scope' })
          ]}
          radios={[{
            key: 'yes',
            value: true,
            children: $t({ defaultMessage: 'Yes, apply the recommendation' }),
            columns: [
              $t({ defaultMessage: 'Yes, apply the recommendation' }),
              <FormattedMessage
                values={richTextFormatValues}
                defaultMessage={`
                  <p>IntentAI will upgrading the Zone firmware ensuring the network remains secure and up-to-date with the latest features, enhancing protection against cyber threats and enabling access to new functionalities for improved performance and management.</p>
                  <p>IntentAI will continuously monitor these configurations.</p>
                `}
              />
            ]
          }, {
            key: 'no',
            value: false,
            children: $t({ defaultMessage: 'No, do not apply the recommendation' }),
            columns: [
              $t({ defaultMessage: 'No, do not apply the recommendation' }),
              <FormattedMessage
                values={richTextFormatValues}
                defaultMessage={`
                  <p>IntentAI will maintain the current configuration on the Controller, keeping Zone firmware version unchanged.</p>
                  <p>IntentAI will cease monitoring these configurations. To restart monitoring, you can select the "Reset" action, after which IntentAI will resume overseeing the network for this Intent.</p>
              `} />
            ]
          }]}
        />
      </Form.Item>
    </>
  }
}).addStep({
  title: defineMessage({ defaultMessage: 'Settings' }),
  Content: () => {
    const { $t } = useIntl()
    const { form } = useStepFormContext()
    const enable = form.getFieldValue('enable')
    return <>
      <Typography.Paragraph
        children={$t({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })} />
      Enabled Calendar: {String(enable)}
    </>
  }
}).addStep({
  title: defineMessage({ defaultMessage: 'Summary' }),
  Content: () => {
    const { $t } = useIntl()
    const { intent, kpis } = useIntentContext()
    return <>
      {/* TODO: add configuration to be enabled as a field */}
      {getGraphKPIs(intent, kpis).map(kpi => (<KpiField key={kpi.key} kpi={kpi} />))}
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Schedule' })}
      </StepsForm.Subtitle>
    </>
  }
}).IntentAIForm
