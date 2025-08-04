
import { Checkbox, Form, Space, Switch, Typography } from 'antd'
import _                                             from 'lodash'
import { useIntl }                                   from 'react-intl'

import { StepsForm, Subtitle } from '@acx-ui/components'
import { Features }            from '@acx-ui/feature-toggle'
import { formatter }           from '@acx-ui/formatter'
import {
  EdgeLag,
  EdgePort,
  getEdgePortDisplayName,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'

interface LagMembersComponentProps {
    value?: EdgeLag['lagMembers']
    onChange?: (data: unknown) => void
    data?: EdgeLag
    portList?: EdgePort[]
    existedLagList?: EdgeLag[]
    lagEnabled: boolean
}

export const LagMembersComponent = (props: LagMembersComponentProps) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { value, data, portList, existedLagList, lagEnabled } = props
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  const getUseableLagMembers = (portList?: EdgePort[]) => {
    return portList?.filter(port =>
      !existedLagList?.some(exsistedLag =>
        exsistedLag.lagMembers?.some(existedLagMember =>
          existedLagMember.portId === port.id &&
            !data?.lagMembers?.some(editLagMember =>
              editLagMember.portId === port.id)))) // keep the edit mode data as a selection
  }

  const useableLagMembers = getUseableLagMembers(portList)
  const maxSpeedPortGroups = _.groupBy(useableLagMembers, 'maxSpeedCapa')
  const maxSpeedList = Object.keys(maxSpeedPortGroups)
  const maxSpeedPorts : { maxSpeed: string, ports: EdgePort[] }[] = []

  maxSpeedList.forEach(row => {
    maxSpeedPorts.push({ maxSpeed: row, ports: maxSpeedPortGroups[row] })
  })

  const genLagMembersMaxSpeedGroupDesc = (maxSpeed?: String, maxSpeedListSize?: number) => {
    if(!maxSpeedListSize || maxSpeedListSize < 2) {
      return ''
    } else {
      return <Typography.Text className='description darkGreyText' >
        {$t({ defaultMessage: 'Max Speed:{maxSpeed}' },
          { maxSpeed: formatter('networkSpeedFormat')(maxSpeed) })}
      </Typography.Text>
    }
  }

  const genLagMembersMaxSpeedNote = (maxSpeedListSize?: number) => {
    if(maxSpeedListSize && maxSpeedListSize > 1) {
      return <Subtitle level={5}>{$t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Please ensure that a LAG requires its port members to have the same speed capability.'
      })}
      </Subtitle>
    } else {
      return ''
    }
  }

  const disabledLagMembers = (maxSpeed?: String) => {
    if(!value || value.length === 0) {
      return false
    }
    const porIds = value.map(v => v.portId)
    const dataCheckedMaxSpeed = maxSpeedPorts
      .filter(sp => sp.ports
        .some(p => porIds.includes(p.id))).map(sp => sp.maxSpeed).pop()
    const result = dataCheckedMaxSpeed !== maxSpeed
    return result
  }

  const handleLagMemberChange = (maxSpeed: string, portId: string, enabled: boolean) => {
    const currentMembers = form.getFieldValue('lagMembers') as EdgeLag['lagMembers'] ?? []
    let updatedMembers = _.cloneDeep(currentMembers)

    if(enabled) {
      updatedMembers.push({ portId, portEnabled: lagEnabled })
    } else {
      _.remove(updatedMembers, item => item.portId === portId)
    }

    const updateValues: Partial<EdgeLag> = {
      lagMembers: updatedMembers
    }

    const currentLagId = form.getFieldValue('id') as EdgeLag['id']
    const currentLag = existedLagList?.find(lag => lag.id === currentLagId)

    // Helper function to check if any lag member has a specific port property enabled
    const hasLagMemberWithProperty = (property: 'corePortEnabled' | 'accessPortEnabled') => {
      return updatedMembers.some(member =>
        _.find(portList, { id: member.portId })?.[property]
      )
    }

    // Check if need to reset core port enabled
    const initialCorePortEnabled = hasLagMemberWithProperty('corePortEnabled')
    if (!initialCorePortEnabled && !currentLag?.corePortEnabled) {
      updateValues.corePortEnabled = false
    }

    // Check if need to reset access port enabled
    if (isEdgeCoreAccessSeparationReady) {
      const initialAccessPortEnabled = hasLagMemberWithProperty('accessPortEnabled')
      if (!initialAccessPortEnabled && !currentLag?.accessPortEnabled) {
        updateValues.accessPortEnabled = false
      }
    }

    form.setFieldsValue(updateValues)
  }

  const handlePortEnabled = (portId: string, enabled: boolean) => {
    const currentMembers = form.getFieldValue('lagMembers') as EdgeLag['lagMembers'] ?? []
    const updated = _.cloneDeep(currentMembers)
    updated.forEach(item => {
      if (item.portId === portId)
        item.portEnabled = enabled
    })
    form.setFieldValue('lagMembers', updated)
  }

  return (
    <div>
      {genLagMembersMaxSpeedNote(maxSpeedList.length)}
      <Checkbox.Group value={value?.map(item => item.portId)}>
        <Space direction='vertical'>
          {
            maxSpeedPorts.map((row) => (
              <Space direction='vertical' key={`${row.maxSpeed}_space`} >
                {genLagMembersMaxSpeedGroupDesc(row.maxSpeed, maxSpeedList.length)}
                {
                  row.ports?.map((item: EdgePort) => (
                    <Space key={`${item.id}_space`} size={30}>
                      <Checkbox
                        key={`${item.id}_checkbox`}
                        value={item.id}
                        children={getEdgePortDisplayName(item)}
                        onChange={(e) =>
                          handleLagMemberChange(row.maxSpeed, item.id, e.target.checked)}
                        disabled={disabledLagMembers(row.maxSpeed)}
                      />
                      {
                        value?.some(id => id.portId === item.id) &&
                  <StepsForm.FieldLabel width='100px'>
                    <div style={{ margin: 'auto' }}>{$t({ defaultMessage: 'Port Enabled' })}</div>
                    <Form.Item
                      children={<Switch
                        // eslint-disable-next-line max-len
                        checked={value.find(member => member.portId === item.id)?.portEnabled ?? false}
                        onChange={(checked) => handlePortEnabled(item.id, checked)}
                        disabled={!lagEnabled}
                      />}
                      noStyle
                    />
                  </StepsForm.FieldLabel>
                      }
                    </Space>

                  ))}
              </Space>
            ))

          }
        </Space>
      </Checkbox.Group></div>
  )
}