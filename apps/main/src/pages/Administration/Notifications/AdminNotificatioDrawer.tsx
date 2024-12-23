import { Key, useState } from 'react'

import { Form, Tree, TreeDataNode } from 'antd'
import { useIntl }                  from 'react-intl'

import { Drawer, DrawerProps, Tabs } from '@acx-ui/components'

import * as UI from './styledComponents'

const activitiesTree: TreeDataNode[] = [
  {
    key: 'a-0',
    title: 'Products',
    children: [
      {
        key: 'a-0-0',
        title: 'General'
      },
      {
        key: 'a-0-1',
        title: 'Wi-Fi'
      },
      {
        key: 'a-0-2',
        title: 'Switch'
      },
      {
        key: 'a-0-3',
        title: 'RUCKUS Edge'
      }
    ]
  }
]
const eventsTree: TreeDataNode[] = [
  {
    key: 'e-0',
    title: 'Severity',
    children: [
      {
        key: 'e-0-0',
        title: 'Critical'
      },
      {
        key: 'e-0-1',
        title: 'Major'
      },
      {
        key: 'e-0-2',
        title: 'Minor'
      },
      {
        key: 'e-0-3',
        title: 'Warning'
      },
      {
        key: 'e-0-4',
        title: 'Informational'
      }
    ]
  },
  {
    key: '1',
    title: 'Event Types',
    children: [
      {
        key: '1-0',
        title: 'AP'
      },
      {
        key: '1-1',
        title: 'Security'
      },
      {
        key: '1-2',
        title: 'Client'
      },
      {
        key: '1-3',
        title: 'Switch'
      },
      {
        key: '1-4',
        title: 'Network'
      },
      {
        key: '1-5',
        title: 'RUCKUS Edge'
      },
      {
        key: '1-6',
        title: 'Profile'
      }
    ]
  },
  {
    key: '2',
    title: 'Products',
    children: [
      {
        key: '2-0',
        title: 'General'
      },
      {
        key: '2-1',
        title: 'Wi-Fi'
      },
      {
        key: '2-2',
        title: 'Switch'
      },
      {
        key: '2-3',
        title: 'RUCKUS Edge'
      }
    ]
  }
]
const adminLogsTree: TreeDataNode[] = [
  {
    key: 'al-0',
    title: 'Event Types'
  }
]

const incidentsTree: TreeDataNode[] = [
  {
    key: 'i-0',
    title: 'Severity',
    children: [
      {
        key: 'i-0-0',
        title: 'P1'
      },
      {
        key: 'i-0-1',
        title: 'P2'
      },
      {
        key: 'i-0-2',
        title: 'P3'
      },
      {
        key: 'i-0-3',
        title: 'P4'
      }
    ]
  }
]

const otherTree: TreeDataNode[] = [
  {
    key: 'o-0',
    title: 'Firmware',
    children: [
      {
        key: 'o-0-0',
        title: 'AP'
      },
      {
        key: 'o-0-1',
        title: 'Switch'
      },
      {
        key: 'o-0-2',
        title: 'RUCKUS Edge'
      }
    ]
  },
  {
    key: 'o-1',
    title: 'API Changes'
  }
]

export const AdminNotificationDrawer = ({
  showDrawer,
  setShowDrawer
}: {
  showDrawer: boolean,
  setShowDrawer: CallableFunction
}) => {
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('activities')
  const [form] = Form.useForm()
  const close = () => setShowDrawer(false)

  interface NotificationTabProps {
    treeData: TreeDataNode[]
    checked: Key[]
    updateChecked: (checked: Key[]) => void
    multiColumn?: boolean
    }

  const NotificationFormTab = (props: NotificationTabProps) => {
    const { treeData, checked, updateChecked, multiColumn = false } = props
    const [checkedKeys, setCheckedKeys] = useState<Key[]>(checked)

    const onCheck = (checkedKeys: Key[]) => {
      setCheckedKeys(checkedKeys)
      const checkedChildren = checkedKeys.filter(key => !treeData.map(t => t.key).includes(key))
      updateChecked(checkedChildren)
    }

    return <Form.Item valuePropName='checked'>
      <UI.NotificationCheckboxWrapper>
        <Tree
          className={multiColumn ? 'multi-col' : ''}
          checkable={true}
          treeData={treeData}
          expandedKeys={treeData.map(t => t.key)}
          switcherIcon={<div hidden></div>}
          checkedKeys={checkedKeys}
          onCheck={(checkedKeys) => onCheck(checkedKeys as Key[])}
        />
      </UI.NotificationCheckboxWrapper>
    </Form.Item>
  }

  const onSave = async () => {
    // try {
    //   await form.validateFields()
    //   const values = form.getFieldsValue()
    //   await submit(values).unwrap()
    // } catch (error) {
    //   console.log(error) // eslint-disable-line no-console
    // }
  }

  const tabs = [
    {
      key: 'activities',
      title: $t({ defaultMessage: 'Activities' }),
      component: <NotificationFormTab
        treeData={activitiesTree}
        checked={form.getFieldValue('activities')}
        updateChecked={(checked) => form.setFieldValue('activities', checked)}
      />
    },
    {
      key: 'events',
      title: $t({ defaultMessage: 'Events' }),
      component: <NotificationFormTab
        treeData={eventsTree}
        checked={form.getFieldValue('events')}
        updateChecked={(checked) => form.setFieldValue('events', checked)}
        multiColumn={true}
      />
    },
    {
      key: 'adminLogs',
      title: $t({ defaultMessage: 'Admin Logs' }),
      component: <NotificationFormTab
        treeData={adminLogsTree}
        checked={form.getFieldValue('adminLogs')}
        updateChecked={(checked) => form.setFieldValue('adminLogs', checked)}
        multiColumn={true}
      />
    },
    {
      key: 'analytics',
      title: $t({ defaultMessage: 'Analytics' }),
      component: <NotificationFormTab
        treeData={incidentsTree}
        checked={form.getFieldValue('incidents')}
        updateChecked={(checked) => form.setFieldValue('incidents', checked)}
      />
    },
    {
      key: 'other',
      title: $t({ defaultMessage: 'Other' }),
      component: <NotificationFormTab
        treeData={otherTree}
        checked={form.getFieldValue('incidents')}
        updateChecked={(checked) => form.setFieldValue('incidents', checked)}
      />
    }
  ]

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

  const drawerProps: DrawerProps = {
    destroyOnClose: true,
    visible: showDrawer,
    width: 470,
    title: $t({ defaultMessage: 'Notifications Preferences' }),
    onClose: close,
    footer: <Drawer.FormFooter
      buttonLabel={{ save: $t({ defaultMessage: 'Save' }) }}
      onCancel={close}
      onSave={onSave}
    />
  }

  return <Drawer {...drawerProps}>
    <UI.NotificationFormWrapper>
      <Form >
        <Tabs
          defaultActiveKey='settings'
          activeKey={currentTab}
          onChange={onTabChange}
        >
          {tabs.map(({ key, title }) =>
            <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
        {ActiveTabPane}
      </Form>
    </UI.NotificationFormWrapper>
  </Drawer>
}
