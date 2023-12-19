import { useState } from 'react'

import { Typography, Space } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr, Modal, ModalType }                        from '@acx-ui/components'
import { EdgeEditContext, EdgePortsForm, EdgePortTabEnum } from '@acx-ui/rc/components'
import { EdgePort }                                        from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const PortsFormEditContextProvider = (props: {
  edgeId: string,
  portsData: EdgePort[],
  setVisible: (visible: boolean) => void;
}) => {
  const { edgeId, setVisible } = props
  const [activeSubTab, setActiveSubTab] = useState({
    key: EdgePortTabEnum.PORTS_GENERAL as string,
    // TODO:
    title: ''
  })
  const [formControl, setFormControl] = useState({} as EdgeEditContext.EditEdgeFormControlType)

  const handleClose = () => {
    setFormControl({
      ...formControl,
      isDirty: false
    })
    formControl?.discardFn?.()
    setVisible(false)
  }

  const handleTabChange = (tab: string) => {
    if (formControl.isDirty) {
      blockTabChange(() => {
        setActiveSubTab({ key: tab, title: '' })
      })
      return
    }

    // TODO:
    setActiveSubTab({ key: tab, title: '' })
  }

  const blockTabChange = (retryFn: () => void) => {
    if (formControl?.isDirty) {
    // // do not trigger modal twice
    // setFormControl({
    //   ...formControl,
    //   isDirty: false
    // })
      EdgeEditContext.showUnsavedModal(
      { activeSubTab, formControl } as EdgeEditContext.EditEdgeContextType,
      {
        cancel: () => {
          setFormControl({
            ...formControl,
            isDirty: true
          })
        },
        discard: () => {
          setFormControl({
            ...formControl,
            isDirty: false
          })
          formControl?.discardFn?.()
          retryFn()
        },
        save: () => {
          formControl?.applyFn?.()
          retryFn()
        }
      }
      )
    }
  }

  return (
    <EdgeEditContext.EditContext.Provider value={{
      activeSubTab,
      setActiveSubTab,
      formControl,
      setFormControl
    }}>
      <EdgePortsForm
        serialNumber={edgeId}
        onTabChange={handleTabChange}
        onCancel={handleClose}
        activeSubTab={activeSubTab.key}
        filterTabs={[EdgePortTabEnum.SUB_INTERFACE]}
        tabsType='line'
      />
    </EdgeEditContext.EditContext.Provider>
  )
}

const PortsGeneralModal = (props: {
    className?: string,
    edgeId: string,
    edgeName: string,
    portsData: EdgePort[],
    visible: boolean,
    setVisible: (visible: boolean) => void;
  }) => {
  const { className, edgeName, visible, setVisible, ...others } = props

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Modal
      className={className}
      title={edgeName}
      width='70%'
      visible={visible}
      onCancel={handleClose}
      footer={undefined}
      type={ModalType.ModalStepsForm}
      mask={true}
      destroyOnClose={true}
    >
      <PortsFormEditContextProvider
        {...others}
        setVisible={setVisible}
      />
    </Modal>
  )
}

export const CorePortFormItem = (props: {
    data: string,
    name: string,
    edgeId: string | undefined,
    edgeName: string,
    portsData: EdgePort[] | undefined,
  }) => {
  const { $t } = useIntl()
  const {
    data: corePortMac,
    name: corePortName,
    edgeId,
    edgeName,
    portsData
  } = props
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const handleClick = () => {
    setModalVisible(true)
  }

  return <Space direction='vertical'>
    <Typography.Text style={{ color: cssStr('--acx-neutrals-90') }}>
      {$t({ defaultMessage: 'Core Port: {corePort}' },
        { corePort: corePortName && edgeId ? corePortName : 'N/A' })}
    </Typography.Text>
    <UI.AlertText>
      {
        corePortMac || edgeId === undefined
          ? null
          : <><Typography.Text>
            {$t({
              defaultMessage: `To use SD-LAN on the venue,
         you must go to {editPortLink} and select a port as the Core port`
            },
            { editPortLink:
              <UI.LinkButton type='link' onClick={handleClick}>
                {$t({ defaultMessage: 'SmartEdge\'s Port configuration' })}
              </UI.LinkButton>
            })}
          </Typography.Text>
          <PortsGeneralModal
            edgeId={edgeId}
            edgeName={edgeName}
            portsData={portsData || []}
            visible={modalVisible}
            setVisible={setModalVisible}
          />
          </>
      }
    </UI.AlertText>
  </Space>
}