import { useContext } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                   from '@acx-ui/rc/components'
import { ClusterHighAvailabilityModeEnum }         from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }  from '../types'

import { HaDisplayForm }     from './HaDisplayForm'
import { LagTable }          from './LagTable'
import { PortGeneralTable }  from './PortGeneralTable'
import { SubInterfaceTable } from './SubInterfaceTable'
import { VipDisplayForm }    from './VipDisplayForm'

export const Summary = () => {
  const { $t } = useIntl()
  const isEdgeHaAaOn = useIsSplitOn(Features.EDGE_HA_AA_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const { form } = useStepFormContext()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']
  const vipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
  const timeout = form.getFieldValue('timeout')
  const fallbackEnable = form.getFieldValue(['fallbackSettings', 'enable'])
  const fallbackScheduleType = form.getFieldValue(['fallbackSettings', 'schedule', 'type'])
  const fallbackScheduleTime = form.getFieldValue(['fallbackSettings', 'schedule', 'time'])
  const fallbackScheduleWeekday = form.getFieldValue(['fallbackSettings', 'schedule', 'weekday'])
  // eslint-disable-next-line max-len
  const fallbackScheduleIntervalHours = form.getFieldValue(['fallbackSettings', 'schedule', 'intervalHours'])
  const loadDistribution = form.getFieldValue('loadDistribution')
  const portSubInterfaces = form.getFieldValue('portSubInterfaces')
  const lagSubInterfaces = form.getFieldValue('lagSubInterfaces')

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'LAG' }) }
    </Subtitle>
    <Form.Item>
      <LagTable
        data={lagSettings}
        portSettings={portSettings}
      />
    </Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Port General' }) }
    </Subtitle>
    <Form.Item>
      <PortGeneralTable data={portSettings} />
    </Form.Item>
    {
      isEdgeCoreAccessSeparationReady &&
      <>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Sub-Interface' }) }
        </Subtitle>
        <Form.Item>
          <SubInterfaceTable
            lagData={lagSettings}
            portData={portSettings}
            portSubInterfaceData={portSubInterfaces}
            lagSubInterfaceData={lagSubInterfaces}
          />
        </Form.Item>
      </>
    }
    {
      isEdgeHaAaOn &&
      clusterInfo?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE ?
        <HaDisplayForm
          fallbackEnable={fallbackEnable}
          fallbackScheduleType={fallbackScheduleType}
          fallbackScheduleTime={fallbackScheduleTime}
          fallbackScheduleWeekday={fallbackScheduleWeekday}
          fallbackScheduleIntervalHours={fallbackScheduleIntervalHours}
          loadDistribution={loadDistribution}
        />:
        <VipDisplayForm
          vipConfig={vipConfig}
          timeout={timeout}
        />
    }
  </>)
}