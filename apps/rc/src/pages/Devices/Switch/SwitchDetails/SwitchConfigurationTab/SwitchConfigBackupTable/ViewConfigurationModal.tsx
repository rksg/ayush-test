/* eslint-disable max-len */
import { Menu, MenuProps, Space } from 'antd'
import { useIntl }                from 'react-intl'

import { Dropdown, CaretDownSolidIcon, Button, Descriptions } from '@acx-ui/components'
import { CodeMirrorWidget }                                   from '@acx-ui/rc/components'
import { ConfigurationBackup }                                from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function ViewConfigurationModal (props:{
  data: ConfigurationBackup
  visible: boolean
  handleCancel: () => void
  tableClearSelection: () => void
  enabledButton: string[],
  actions: {
    compare: Function,
    restore: Function,
    download: Function,
    delete: Function
  }
}) {
  const { $t } = useIntl()
  const { data, visible, handleCancel, actions, tableClearSelection, enabledButton } = props

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch(e.key) {
      case 'Compare':
        handleCancel()
        actions.compare([data, data])
        tableClearSelection()
        break
      case 'Restore':
        handleCancel()
        actions.restore(data, tableClearSelection)
        break
      case 'Download':
        actions.download(data)
        break
      case 'Delete':
        handleCancel()
        actions.delete([data], tableClearSelection)
        break
    }
  }

  return <UI.ViewModal
    title={$t({ defaultMessage: 'View Configuration' })}
    visible={visible}
    onCancel={handleCancel}
    width={650}
    footer={<Button key='back' type='primary' onClick={handleCancel}>
      {$t({ defaultMessage: 'Close' })}
    </Button>
    }
  >
    {
      data &&
        <>
          <div className='description-container'>
            <Descriptions labelWidthPercent={30}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Configuration Name' })}
                children={data.name} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Created' })}
                children={data.createdDate} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Type' })}
                children={data.backupType} />
            </Descriptions>
            <Dropdown
              overlay={
                <Menu
                  onClick={handleMenuClick}
                  items={[
                    {
                      label: $t({ defaultMessage: 'Compare' }),
                      key: 'Compare'
                    },
                    {
                      label: $t({ defaultMessage: 'Restore' }),
                      key: 'Restore',
                      disabled: !enabledButton.find(item => item === 'Restore')
                    },
                    {
                      label: $t({ defaultMessage: 'Download' }),
                      key: 'Download'
                    },
                    {
                      label: $t({ defaultMessage: 'Delete' }),
                      key: 'Delete',
                      disabled: !enabledButton.find(item => item === 'Delete')
                    }
                  ]}
                />
              }
              key='viewCliMenu'
            >{()=>
                <Button>
                  <Space>
                    {$t({ defaultMessage: 'Actions' })}
                    <CaretDownSolidIcon />
                  </Space>
                </Button>
              }</Dropdown>
          </div>
          <div className='code-mirror-container'>
            <CodeMirrorWidget type='single' data={{ ...data, clis: data.config }} />
          </div>
        </>
    }
  </UI.ViewModal>
}
