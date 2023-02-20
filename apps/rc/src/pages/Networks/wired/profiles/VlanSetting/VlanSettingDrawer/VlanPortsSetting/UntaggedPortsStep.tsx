
import { useState, useEffect, useContext } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox } from 'antd'
import _                                        from 'lodash'

import { Card, Tooltip }                  from '@acx-ui/components'
import { ICX_MODELS_MODULES, SwitchSlot } from '@acx-ui/rc/utils'
import { getIntl }                        from '@acx-ui/utils'

import { generatePortData } from './SelectModelStep'
import * as UI              from './styledComponents'
import VlanPortsContext     from './VlanPortsContext'
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
  const [slots, setSlots] = useState<SwitchSlot[]>([])

  useEffect(() => {
    let slotsTemplate: SwitchSlot[] = []
    if(vlanSettingValues.switchFamilyModels){
      for (let slotNumber = 1; slotNumber <= 4; slotNumber++) {
        const switchFamilyModels = vlanSettingValues.switchFamilyModels
        if (switchFamilyModels.slots[slotNumber - 1] &&
          switchFamilyModels.slots[slotNumber - 1].enable) {
          let totalPortNumber: string = '0'
          let slotPortInfo: string = ''

          const selectedFamily = switchFamilyModels.model.split('-')[0]
          const selectedModel = switchFamilyModels.model.split('-')[1]
          if ((switchFamilyModels.slots[slotNumber - 1].option || totalPortNumber === '0') &&
          selectedFamily !== '' && selectedModel !== '') {
            const familyIndex = selectedFamily as keyof typeof ICX_MODELS_MODULES
            const familyList = ICX_MODELS_MODULES[familyIndex]
            const modelIndex = selectedModel as keyof typeof familyList
            slotPortInfo = familyList[modelIndex][slotNumber - 1][0]
            totalPortNumber = slotPortInfo.split('X')[0]
          }

          const slotData = {
            slotNumber: slotNumber,
            enable: switchFamilyModels.slots[slotNumber - 1].enable,
            option: switchFamilyModels.slots[slotNumber - 1].option,
            slotPortInfo: slotPortInfo,
            portStatus: generatePortData(totalPortNumber)
          }

          slotsTemplate.push(slotData)
        }
      }
      slotsTemplate = slotsTemplate.sort(
        function (a: { slotNumber: number }, b: { slotNumber: number }) {
          return a.slotNumber > b.slotNumber ? 1 : -1
        })

      setSlots(slotsTemplate)
      if(slotsTemplate[0] && slotsTemplate[0].portStatus!== undefined){
        const portModule1List1 = slotsTemplate[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/1/${item.portNumber.toString()}` }))
        setPortsModule1(portModule1List1)
      }

      if(slotsTemplate[1] && slotsTemplate[1].portStatus!== undefined){
        const portModule1List2 = slotsTemplate[1].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/2/${item.portNumber.toString()}` }))
        setPortsModule2(portModule1List2)
      }

      if(slotsTemplate[2] && slotsTemplate[2].portStatus!== undefined){
        const portModule1List3 = slotsTemplate[2].portStatus?.map(
          item => ({ label: item.portNumber.toString(),
            value: `1/3/${item.portNumber.toString()}` }))
        setPortsModule3(portModule1List3)
      }
    }

    if(vlanSettingValues.switchFamilyModels?.untaggedPorts){
      const untaggedPorts = vlanSettingValues.switchFamilyModels?.untaggedPorts
        .toString().split(',').filter(item => item !== '')
      form.setFieldValue(['switchFamilyModels', 'untaggedPorts'], untaggedPorts)

      setSelectedItems1(untaggedPorts.filter(item=> item.split('/')[1] === '1'))
      setSelectedItems2(untaggedPorts.filter(item=> item.split('/')[1] === '2'))
      setSelectedItems3(untaggedPorts.filter(item=> item.split('/')[1] === '3'))
    }
  }, [vlanSettingValues.switchFamilyModels])

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

      Array.from({ length: portsModule1.length }, (_, i) => {
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

      Array.from({ length: portsModule2.length }, (_, i) => {
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


      Array.from({ length: portsModule3.length }, (_, i) => {
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
  //const getTooltip = (slotNumber: number, portStr: string) => {
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
  //}

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
                { slots[0] &&
                  <Typography.Paragraph>
                    {$t({ defaultMessage: '{module1}' },
                      { module1: slots[0].slotPortInfo
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
                        </div>
                        <p>{i+1}</p>
                      </Tooltip>,
                      value: timeslot.value,
                      disabled: getDisabledPorts(timeslot.value)
                    }))}
                  />
                </UI.Module>
              </Col>
              {slots[1] &&
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
                        { module2: slots[1].slotPortInfo
                          ?.split('X').join(' X ') })}
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
              {slots[2] &&
              <Col>
                <div>
                  <Typography.Text style={{ fontWeight: 'bold' }}>
                    {$t({ defaultMessage: 'Module 3' })}
                  </Typography.Text>
                </div>
                <Typography.Paragraph>
                  {$t({ defaultMessage: '{module3}' },
                    { module3: slots[2].slotPortInfo
                      ?.split('X').join(' X ') })}
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
      <Form.Item name={['switchFamilyModels', 'untaggedPorts']} />
    </>
  )
}