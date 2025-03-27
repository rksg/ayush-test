import { useContext, useEffect } from 'react'

import { Form, Space, Typography } from 'antd'
import { reduce }                  from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext } from '@acx-ui/components'
import { TypeForm }                   from '@acx-ui/rc/components'
import { EdgeStatus }                 from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext }                                     from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingFormStepCommonProps, InterfaceSettingsFormType } from '../types'

import { DualWanSettingsForm }             from './DualWanSettingsForm'
import { getDualWanDataFromClusterWizard } from './utils'

export const DualWanForm = ({ onInit }: InterfaceSettingFormStepCommonProps) => {
  const { $t } = useIntl()
  const {
    form: configWizardForm,
    current: currentStep
  } = useStepFormContext<InterfaceSettingsFormType>()

  useEffect(() => onInit?.(), [onInit])

  useEffect(() => {
    if (currentStep !== 2) {
      return
    }

    const configWizardFormData = configWizardForm.getFieldsValue(true)
    // eslint-disable-next-line max-len
    const dualWanData = getDualWanDataFromClusterWizard(configWizardFormData)
    configWizardForm.setFieldValue('multiWanSettings', dualWanData)
  }, [currentStep])

  return (
    <TypeForm
      header={<Space direction='vertical' size={5}>
        <Typography.Title level={2}>
          {$t({ defaultMessage: 'Dual WAN Settings' })}
        </Typography.Title>
        <Typography.Text>
          {
          // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Configure the dual WAN settings for all RUCKUS Edges in this cluster ({clusterName}):' },
              { clusterName: 'clusterName' })
          }
        </Typography.Text>
      </Space>}
      content={<Form.Item name='multiWanSettings'>
        <DualWanSettings />
      </Form.Item>}
    />
  )
}

const DualWanSettings = () => {
  const { clusterInfo, isFetching } = useContext(ClusterConfigWizardContext)
  const nodeNameMapping = reduce(clusterInfo?.edgeList, (
    mapping: Record<string, string>,
    data: EdgeStatus
  ) => {
    mapping[data.serialNumber] = data.name
    return mapping
  }, {})

  return <Loader states={[{ isLoading: isFetching || !clusterInfo }]}>
    <DualWanSettingsForm nodeNameMapping={nodeNameMapping} />
  </Loader>
}