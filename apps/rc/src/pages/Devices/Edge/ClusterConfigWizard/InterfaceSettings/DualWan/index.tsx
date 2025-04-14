import { useContext, useEffect } from 'react'

import { Form, Space, Typography } from 'antd'
import { reduce }                  from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader }     from '@acx-ui/components'
import { TypeForm }   from '@acx-ui/rc/components'
import { EdgeStatus } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext }          from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingFormStepCommonProps } from '../types'

import { DualWanSettingsForm } from './DualWanSettingsForm'

export const DualWanForm = ({ onInit }: InterfaceSettingFormStepCommonProps) => {
  const { $t } = useIntl()

  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  useEffect(() => onInit?.(), [onInit])

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
              { clusterName: clusterInfo?.name })
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