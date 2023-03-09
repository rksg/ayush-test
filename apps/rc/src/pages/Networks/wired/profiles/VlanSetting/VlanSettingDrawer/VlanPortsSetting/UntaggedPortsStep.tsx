
import { useState, useEffect, useContext } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox, Input } from 'antd'
import _                                               from 'lodash'

import { Card, Tooltip }             from '@acx-ui/components'
import { SwitchSlot2 as SwitchSlot } from '@acx-ui/rc/utils'
import { getIntl }                   from '@acx-ui/utils'

import * as UI          from './styledComponents'
import VlanPortsContext from './VlanPortsContext'

export interface PortsType {
  label: string,
  value: string
}

export function UntaggedPortsStep () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { vlanSettingValues, setVlanSettingValues, vlanList } = useContext(VlanPortsContext)

  const [portsModule1, setPortsModule1] = useState<PortsType[]>([])
  const [portsModule2, setPortsModule2] = useState<PortsType[]>([])
  const [portsModule3, setPortsModule3] = useState<PortsType[]>([])

  const [selectedItems1, setSelectedItems1] = useState<string[]>([])
  const [selectedItems2, setSelectedItems2] = useState<string[]>([])
  const [selectedItems3, setSelectedItems3] = useState<string[]>([])
  const [slot2, setSlot2] = useState<SwitchSlot>()
  const [slot3, setSlot3] = useState<SwitchSlot>()

  useEffect(() => {
    if(vlanSettingValues){
      const slot1Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 1)
      if(slot1Data && slot1Data[0] && slot1Data[0].portStatus!== undefined){
        const portModule1List1 = slot1Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/1/${item.portNumber.toString()}` }))
        setPortsModule1(portModule1List1)
      }

      const slot2Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 2)
      if(slot2Data && slot2Data[0] && slot2Data[0].portStatus!== undefined){
        const portModule1List2 = slot2Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/2/${item.portNumber.toString()}` }))
        setPortsModule2(portModule1List2)
        setSlot2(slot2Data[0])
      }

      const slot3Data = vlanSettingValues.switchFamilyModels?.slots
        .filter(item => item.slotNumber === 3)
      if(slot3Data && slot3Data[0] && slot3Data[0].portStatus!== undefined){
        const portModule1List3 = slot3Data[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/3/${item.portNumber.toString()}` }))
        setPortsModule3(portModule1List3)
        setSlot3(slot3Data[0])
      }

      if(vlanSettingValues.switchFamilyModels?.untaggedPorts){
        const untaggedPorts = vlanSettingValues.switchFamilyModels?.untaggedPorts
          .toString().split(',').filter(item => item !== '')
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], untaggedPorts)

        setSelectedItems1(untaggedPorts.filter(item=> item.split('/')[1] === '1'))
        setSelectedItems2(untaggedPorts.filter(item=> item.split('/')[1] === '2'))
        setSelectedItems3(untaggedPorts.filter(item=> item.split('/')[1] === '3'))
      }else{
        form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], [])
        setSelectedItems1([])
        setSelectedItems2([])
        setSelectedItems3([])
      }
    }
  }, [vlanSettingValues])

  let tmpUntaggedSelectedItem: string[] = []
  const { DragSelection: DragSelectionUntaggedPorts } = useSelectionContainer({
    eventsElement: document.getElementById('unTaggedContainer'),
    shouldStartSelecting: (target) => {
      if (target instanceof HTMLElement) {
        let el = target
        while (el.parentElement && !el.dataset.disableselect) {
          el = el.parentElement
        }
        return el.dataset.disableselect !== 'true'
      }
      return true
    },
    onSelectionChange: (box) => {
      tmpUntaggedSelectedItem = []
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      Array.from({ length: portsModule1.length }).forEach((_,i) => {
        const itemKey = `untagged_module1_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpUntaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })

      Array.from({ length: portsModule2.length }).forEach((_,i) => {
        const itemKey = `untagged_module2_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpUntaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })


      Array.from({ length: portsModule3.length }).forEach((_,i) => {
        const itemKey = `untagged_module3_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            if(item.dataset.value !== undefined && item.dataset.disabled === 'false'){
              tmpUntaggedSelectedItem.push(item.dataset.value)
            }
          }
        }
      })

      tmpUntaggedSelectedItem = _.uniq(tmpUntaggedSelectedItem)
    },
    onSelectionEnd: () => {
      const selectedVlanPort = form.getFieldValue(['switchFamilyModels', 'untaggedPorts']) || []
      const vlanPorts = _.xor(selectedVlanPort,tmpUntaggedSelectedItem)

      setSelectedItems1(vlanPorts.filter(item=> item.split('/')[1] === '1'))
      setSelectedItems2(vlanPorts.filter(item=> item.split('/')[1] === '2'))
      setSelectedItems3(vlanPorts.filter(item=> item.split('/')[1] === '3'))
      form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], vlanPorts)

      setVlanSettingValues({
        ...vlanSettingValues,
        switchFamilyModels: {
          id: vlanSettingValues.switchFamilyModels?.id,
          model: vlanSettingValues.switchFamilyModels?.model || '',
          slots: vlanSettingValues.switchFamilyModels?.slots || [],
          untaggedPorts: vlanPorts,
          taggedPorts: vlanSettingValues.switchFamilyModels?.taggedPorts || []
        }
      })
      tmpUntaggedSelectedItem = []
    },
    isEnabled: true
  })

  const handleCheckboxGroupChange =
    (moduleName: string, checkedValues: string[], setValues: (arg0: string[]) => void) => {
      setValues(checkedValues)
      switch(moduleName){
        case 'module1':
          form.setFieldValue(['switchFamilyModels', 'untaggedPorts'],
            _.uniq([...selectedItems2, ...selectedItems3, ...checkedValues]))
          break
        case 'module2':
          form.setFieldValue(['switchFamilyModels', 'untaggedPorts'],
            _.uniq([...selectedItems1, ...selectedItems3, ...checkedValues]))
          break
        case 'module3':
          form.setFieldValue(['switchFamilyModels', 'untaggedPorts'],
            _.uniq([...selectedItems1, ...selectedItems2, ...checkedValues]))
          break
      }
    }

  const getDisabledPorts = (timeslot: string) => {
    const vlanSelectedPorts = vlanList ? vlanList.map(item => item.switchFamilyModels
      ?.filter(obj => obj.model === vlanSettingValues.switchFamilyModels?.model)) : []
    const portExists = vlanSelectedPorts.map(item => item?.map(
      obj => { return obj.untaggedPorts?.includes(timeslot)}))[0]

    const disabledPorts = (vlanSettingValues.switchFamilyModels?.taggedPorts &&
    vlanSettingValues.switchFamilyModels?.taggedPorts.includes(timeslot))
    || (portExists && portExists[0]) || false
    return disabledPorts
  }

  //TODO
  // const getTooltip = (slotNumber: number, portStr: string) => {
  // const speedNoData = 'link down or no traffic'
  // let tooltipText = ''
  // if (!vlanSettingValues.switchFamilyModels?.untaggedPorts.includes(portStr)) {
  //   const isUnTaggedVlanValid = port.unTaggedVlan !== '' && port.unTaggedVlan !== undefined
  //   let UntaggedVlanText
  //   let taggedVlanText = ''

  //   if (isUnTaggedVlanValid) {
  //     UntaggedVlanText =
  //     '<span style="font-family:\'ruckus\';font-size:14px;">&#xe08f; </span>' + port.unTaggedVlan
  //   } else {
  //     UntaggedVlanText =
  //     '<span style="font-family:\'ruckus\';font-size:14px;">&#xe08f; </span>' + '--'
  //   }

  //   if (port.vlanIds !== '' && port.vlanIds !== undefined) {
  //     let vlanIdsArray = port.vlanIds.split(' ')

  //     if (isUnTaggedVlanValid) {
  //       let taggedVlan = '--'
  //       if (vlanIdsArray.length > 1) {
  //         vlanIdsArray = _.remove(vlanIdsArray, n => n !== port.unTaggedVlan)
  //         vlanIdsArray.sort((a, b) => Number(a) - Number(b))
  //         // CMS-779 PLM feedback: Show up to 15 vlans in tooltip. If more than 15 VLANs, truncate and add an ellipsis
  //         const ellipsis = (vlanIdsArray.length > 15) ? '...' : ''
  //         const showVlanIdArray = (vlanIdsArray.length > 15) ? vlanIdsArray.slice(0, 15) : vlanIdsArray
  //         taggedVlan = showVlanIdArray.join(', ').concat(ellipsis)
  //       }

  //       taggedVlanText = '<span style="font-family:\'ruckus\';font-size:14px;">  &#xe08e; </span>' + taggedVlan
  //     } else {
  //       taggedVlanText = '<span style="font-family:\'ruckus\';font-size:14px;">  &#xe08e; </span>' + vlanIdsArray.join(', ')
  //     }
  //   }

  //   const poeUsed = Math.round(port.poeUsed / 1000)
  //   const poeTotal = Math.round(port.poeTotal / 1000)

  //   // TODO
  //   // tooltipText =
  //   //   `<span class="label d-inline-block">Port: </span>` +
  //   //   `<span class="value d-inline-block">${port.portIdentifier}</span><br/>` +
  //   //   `<div class="d-flex">` +
  //   //   `<span class="label d-inline-block">Name: </span>` +
  //   //   `<span class="value d-inline-block">${port.name === '' ? '--' : port.name}</span></div>` +
  //   //   `<div class="d-flex">` +
  //   //   `<div class="label d-inline-block">VLAN: </div>` +
  //   //   `<span class="value d-inline-block">` +
  //   //   `${UntaggedVlanText === '' ? '--' : UntaggedVlanText}<br/>` +
  //   //   `${taggedVlanText === '' ? '--' : taggedVlanText}</span></div>` +
  //   //   `<span class="label mb-1 d-inline-block">Port Speed: </span>` +
  //   //   `<span class="value d-inline-block">${port.portSpeed === speedNoData ? '--' : port.portSpeed}</span><br/>` +
  //   //   `<span class="label mb-1 d-inline-block">Port State: </span>` +
  //   //   `<span class="value d-inline-block">${port.status}</span><br/>` +
  //   //   `<div class="d-flex">` +
  //   //   `<span class="label d-inline-block">Connected Device: </span>` +
  //   //   `<span class="value d-inline-block">${port.neighborName || port.neighborMacAddress || '--'}</span></div>` +
  //   //   `<span class="label mb-1 d-inline-block">PoE Usage: </span>` +
  //   //   `<span class="value d-inline-block">${poeUsed} W/ ${poeTotal} W</span><br/>` +
  //   //   `<span class="label mb d-inline-block">(Consumed/Allocated)</span><br/>` +
  //   //   `<span class="label mb-1 d-inline-block">PoE Device Type: </span>` +
  //   //   `<span class="value d-inline-block">${port.poeType === '' ? '--' : port.poeType}</span><br/>`;

  // } else {

  //   if (!(this.clickAction !== port.portTagged && port.portTagged)) {
  //     const unitNumber = _.isEmpty(port.unitNumber) ? '1/' : port.unitNumber + '/'
  //     const portStr = unitNumber + slotNumber + '/' + port.portNumber // ex:1/1/1
  //     let untaggedVlanMsg = '-'
  //     let taggedVlansMsg = '-'
  //     if (this.modelVlanPortStatus && this.modelVlanPortStatus[portStr]) {
  //       untaggedVlanMsg = this.getUntaggedVlanMessage(this.modelVlanPortStatus, portStr)
  //       taggedVlansMsg = this.getTaggedVlanMessage(this.modelVlanPortStatus, portStr)
  //     }
  //     tooltipText = `<div class="col">Networks on this port:</div>
  //                    <div class="col align-icon">
  //                      <span class="icon-untag" style="font-size:18px;"></span>
  //                      <span>${untaggedVlanMsg}</span>
  //                    </div>
  //                    <div class="col align-icon">
  //                      <span class="icon-tag" style="font-size:18px;"></span>
  //                      <span>${taggedVlansMsg}</span>
  //                    </div>`
  //   } else if (port.portTagged == PortTaggedEnum.LAG) {
  //     tooltipText = this.LAG_MEMBER_PORT_DISABLE_TOOLTIP
  //   } else {
  //     tooltipText = `<span class="col">Port set as ${port.portTagged.toLowerCase()}</span>`
  //   }
  //   }
  //   return tooltipText
  // }

  // TODO: for switch
  // const getPortIcon(port: { usedInUplink: boolean; usedInFormingStack: any; poeUsed: any }) {
  //     if (this.deviceStatus === SwitchStatusEnum.DISCONNECTED) {
  //       return '';
  //     }
  //     if (port.usedInUplink) {
  //       return 'UpLink';
  //     }
  //     if (this.isSwitchStack && port.usedInFormingStack) {
  //       return 'Stack';
  //     }
  //     if (port.poeUsed) {
  //       return 'PoeUsed';
  //     }
  //     return '';
  //   }
  //const isUntaggedByOtherVlan = (portStr: string) => {}

  return (
    <>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage:
                'Select the untagged ports (access ports) for this model ({family}-{model}):' },
            { family: vlanSettingValues.family, model: vlanSettingValues.model })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }} id='unTaggedContainer'>
        <Col>
          <Card type='solid-bg'>
            <Row gutter={20}>
              <Col>
                <div>
                  <Typography.Text style={{ fontWeight: 'bold' }}>
                    {$t({ defaultMessage: 'Module 1' })}
                  </Typography.Text>
                </div>
                { vlanSettingValues.switchFamilyModels?.slots[0] &&
                  <Typography.Paragraph>
                    {$t({ defaultMessage: '{module1}' },
                      { module1: vlanSettingValues.switchFamilyModels?.slots[0].slotPortInfo
                        ?.split('X').join(' X ') })}
                  </Typography.Paragraph>
                }
                <UI.Module>
                  <Checkbox.Group
                    key='checkboxGroup_module1'
                    className='lightblue'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module1',
                        checkedValues as string[], setSelectedItems1)}
                    value={selectedItems1}
                    options={portsModule1.map((timeslot, i) => ({
                      label: <Tooltip
                        title={''}
                      >
                        <div
                          id={`untagged_module1_${i}`}
                          data-value={timeslot.value}
                          data-testid={`untagged_module1_${i}`}
                          data-disabled={getDisabledPorts(timeslot.value)}
                          style={{ width: '20px', height: '20px' }}
                        >
                          {
                            /* TODO for switch
                            <UI.LighteningIcon />
                            <UI.StackingIcon />
                            <UI.RuckusUploadIcon />
                            */
                          }
                        </div>
                        <p>{i+1}</p>
                      </Tooltip>,
                      value: timeslot.value,
                      disabled: getDisabledPorts(timeslot.value)
                    }))}
                  />
                </UI.Module>
              </Col>
              {vlanSettingValues.enableSlot2 && slot2 &&
              <Col>
                <Row gutter={20}>
                  <Col>
                    <div>
                      <Typography.Text style={{ fontWeight: 'bold' }}>
                        {$t({ defaultMessage: 'Module 2' })}
                      </Typography.Text>
                    </div>
                    <Typography.Paragraph>
                      {$t({ defaultMessage: '{module2}' },
                        { module2: slot2.slotPortInfo?.split('X').join(' X ') })}
                    </Typography.Paragraph>
                    <UI.Module>
                      <Checkbox.Group
                        key='checkboxGroup_module2'
                        className='lightblue'
                        onChange={(checkedValues) =>
                          handleCheckboxGroupChange('module2',
                                checkedValues as string[], setSelectedItems2)}
                        value={selectedItems2}
                        options={portsModule2.map((timeslot, i) => ({
                          label: <Tooltip
                            title={timeslot.value}
                          >
                            <div
                              id={`untagged_module2_${i}`}
                              data-value={timeslot.value}
                              data-testid={`untagged_module2_${i}`}
                              data-disabled={getDisabledPorts(timeslot.value)}
                              style={{ width: '20px', height: '20px' }}
                            ></div>
                            <p>{i+1}</p>
                          </Tooltip>,
                          value: timeslot.value,
                          disabled: getDisabledPorts(timeslot.value)
                        }))}
                      />
                    </UI.Module>
                  </Col>
                </Row>
              </Col>
              }
              {vlanSettingValues.enableSlot3 && slot3 &&
              <Col>
                <div>
                  <Typography.Text style={{ fontWeight: 'bold' }}>
                    {$t({ defaultMessage: 'Module 3' })}
                  </Typography.Text>
                </div>
                <Typography.Paragraph>
                  {$t({ defaultMessage: '{module3}' },
                    { module3: slot3.slotPortInfo?.split('X').join(' X ') })}
                </Typography.Paragraph>
                <UI.Module>
                  <Checkbox.Group
                    key='checkboxGroup_module3'
                    className='lightblue'
                    onChange={(checkedValues) =>
                      handleCheckboxGroupChange('module3',
                            checkedValues as string[], setSelectedItems3)}
                    value={selectedItems3}
                    options={portsModule3.map((timeslot, i) => ({
                      label: <Tooltip
                        title={''}
                      >
                        <div
                          id={`untagged_module3_${i}`}
                          data-value={timeslot.value}
                          data-testid={`untagged_module3_${i}`}
                          data-disabled={getDisabledPorts(timeslot.value)}
                          style={{ width: '20px', height: '20px' }}
                        ></div>
                        <p>{i+1}</p>
                      </Tooltip>,
                      value: timeslot.value,
                      disabled: getDisabledPorts(timeslot.value)
                    }))}
                  />
                </UI.Module>
              </Col>
              }
            </Row>
          </Card>
          <DragSelectionUntaggedPorts />
        </Col>
      </Row>
      <Form.Item
        name={['switchFamilyModels', 'untaggedPorts']}
        hidden={true}
        children={<Input />}
      />
    </>
  )
}