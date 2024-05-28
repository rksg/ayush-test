import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Table, TableProps }                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { rogueRuleLabelMapping }                                        from '@acx-ui/rc/components'
import { useGetRoguePolicyTemplateQuery, useRoguePolicyQuery }          from '@acx-ui/rc/services'
import { RogueAPRule, RogueRuleType, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'

const RogueApDrawer = (props: {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  policyId: string
}) => {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { $t } = useIntl()
  const { visible, setVisible, policyId } = props

  const handleRogueApDrawerClose = () => {
    setVisible(false)
  }

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useRoguePolicyQuery,
    useTemplateQueryFn: useGetRoguePolicyTemplateQuery,
    extraParams: { policyId: policyId },
    enableRbac
  })

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
      render: (_, row: RogueAPRule) => {
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
      />
    }
    width={'800px'}
  />
}

export default RogueApDrawer
