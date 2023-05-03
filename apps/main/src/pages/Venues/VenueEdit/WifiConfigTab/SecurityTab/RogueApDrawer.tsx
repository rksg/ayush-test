import React from 'react'

import { Form }                                      from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'
import { useParams }                                 from 'react-router-dom'

import { Drawer, Table, TableProps }  from '@acx-ui/components'
import { useRoguePolicyQuery }        from '@acx-ui/rc/services'
import { RogueAPRule, RogueRuleType } from '@acx-ui/rc/utils'

export const rogueRuleLabelMapping: Record<RogueRuleType, MessageDescriptor> = {
  [RogueRuleType.AD_HOC_RULE]: defineMessage({ defaultMessage: 'Ad Hoc' }),
  [RogueRuleType.CTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'CTS Abuse' }),
  [RogueRuleType.DEAUTH_FLOOD_RULE]: defineMessage({ defaultMessage: 'Deauth Flood' }),
  [RogueRuleType.DISASSOC_FLOOD_RULE]: defineMessage({ defaultMessage: 'Disassoc Flood' }),
  [RogueRuleType.EXCESSIVE_POWER_RULE]: defineMessage({ defaultMessage: 'Excessive Power' }),
  [RogueRuleType.LOW_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.CUSTOM_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.CUSTOM_MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.MAC_SPOOFING_RULE]: defineMessage({ defaultMessage: 'MAC Spoofing' }),
  [RogueRuleType.NULL_SSID_RULE]: defineMessage({ defaultMessage: 'Null SSID' }),
  [RogueRuleType.RTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'RTS Abuse' }),
  [RogueRuleType.SAME_NETWORK_RULE]: defineMessage({ defaultMessage: 'Same Network' }),
  [RogueRuleType.SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.CUSTOM_SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.SSID_SPOOFING_RULE]: defineMessage({ defaultMessage: 'SSID Spoofing' })
}

const RogueApDrawer = (props: {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  policyId: string
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const { visible, setVisible, policyId } = props

  const handleRogueApDrawerClose = () => {
    setVisible(false)
  }

  const { data } = useRoguePolicyQuery({ params: {
    ...params, policyId: policyId
  } })

  const basicColumns: TableProps<RogueAPRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      dataIndex: 'priority',
      key: 'priority',
      sortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Rule Type' }),
      dataIndex: 'type',
      key: 'type',
      render: (data, row: RogueAPRule) => {
        return $t(rogueRuleLabelMapping[row.type as RogueRuleType])
      }
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      dataIndex: 'classification',
      key: 'classification'
    }
  ]

  const drawerContent = <Form
    layout={'vertical'}
  >
    <Form.Item
      label={$t({ defaultMessage: 'Classification rules ({count})' }, {
        count: data?.rules.length
      })}>
      <Table
        columns={basicColumns}
        dataSource={data?.rules}
        rowKey='name'
      />
    </Form.Item>
  </Form>

  return <Drawer
    title={$t({ defaultMessage: 'Rogue AP Detection Policy Details: {policyName}' }, {
      policyName: data?.name
    })}
    visible={visible}
    destroyOnClose={true}
    onClose={handleRogueApDrawerClose}
    children={drawerContent}
    footer={
      <Drawer.FormFooter
        showAddAnother={false}
        showSaveButton={false}
        onCancel={handleRogueApDrawerClose}
        onSave={async () => {
          try {
            handleRogueApDrawerClose()
          } catch (error) {
            if (error instanceof Error) throw error
          }
        }}
      />
    }
    width={'800px'}
  />
}

export default RogueApDrawer
