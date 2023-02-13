
import { useState, useEffect } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { Row, Col, Form, Typography, Checkbox } from 'antd'
import _                                        from 'lodash'

import { Card, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ICX_MODELS_MODULES }     from '@acx-ui/rc/utils'
import { getIntl }                from '@acx-ui/utils'

import * as UI                  from './styledComponents'
import { VlanSettingInterface } from './VlanPortsModal'

export interface PortsType {
  label: string,
  value: string
}

export function UntaggedPortsStep (props: { vlanSettings: VlanSettingInterface }) {
  const { $t } = getIntl()
  const { vlanSettings } = props

  const [portsModule1, setPortsModule1] = useState<PortsType[]>([])
  const [portsModule2, setPortsModule2] = useState<PortsType[]>([])
  const [portsModule3, setPortsModule3] = useState<PortsType[]>([])


  const switchSupportIcx8200FF = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)

  useEffect(() => {
    if(ICX_MODELS_MODULES){
      const familiesData = Object.keys(ICX_MODELS_MODULES).filter(key=> {
        return !switchSupportIcx8200FF && key !== 'ICX8200'
      }).map(key => {
        return { label: `ICX-${key.split('ICX')[1]}`, value: key }
      })
    }
    if(vlanSettings){
      if(vlanSettings.switchModelPortData?.slots[0] &&
        vlanSettings.switchModelPortData?.slots[0].portStatus!== undefined){
        const portModule1List1 = vlanSettings.switchModelPortData?.slots[0].portStatus?.map(
          item => ({ label: item.portNumber.toString(), value: item.portNumber.toString() }))
        setPortsModule1(portModule1List1)
      }
      if(vlanSettings.switchModelPortData?.slots[1] &&
        vlanSettings.switchModelPortData?.slots[1].portStatus!== undefined){
        const portModule1List2 = vlanSettings.switchModelPortData?.slots[1].portStatus?.map(
          item => ({ label: item.portNumber.toString(), value: item.portNumber.toString() }))
        setPortsModule2(portModule1List2)
      }
      if(vlanSettings.switchModelPortData?.slots[2] &&
        vlanSettings.switchModelPortData?.slots[2].portStatus!== undefined){
        const portModule1List3 = vlanSettings.switchModelPortData?.slots[2].portStatus?.map(
          item => ({ label: item.portNumber.toString(), value: item.portNumber.toString() }))
        setPortsModule3(portModule1List3)
      }
    }
  }, [ICX_MODELS_MODULES, vlanSettings])

  let selectedItems: string[] = []
  const { DragSelection } = useSelectionContainer({
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
      selectedItems = []
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      Array.from({ length: portsModule1.length }, (_, i) => {
        const itemKey = `module1_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            selectedItems.push(itemKey)
          }
        }
        return null
      })


      Array.from({ length: portsModule2.length }, (_, i) => {
        const itemKey = `module2_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            selectedItems.push(itemKey)
          }
        }
        return null
      })


      Array.from({ length: portsModule3.length }, (_, i) => {
        const itemKey = `module3_${i}`
        const item = document.getElementById(itemKey)
        if(item){
          const { left, top, width, height } = item.getBoundingClientRect()
          const boxItem = { left, top, width, height }
          if (boxesIntersect(scrollAwareBox, boxItem)) {
            selectedItems.push(itemKey)
          }
        }
        return null
      })
    },
    onSelectionEnd: () => {
      console.log(_.uniq(selectedItems))
    },
    isEnabled: true
  })

  return (
    <>
      <Row gutter={20}>
        <Col>
          <label style={{ color: 'var(--acx-neutrals-60)' }}>
            {$t({ defaultMessage:
                'Select the untagged ports (access ports) for this model ({family}-{model}):' },
            { family: vlanSettings.family, model: vlanSettings.model })}
          </label>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col>
          <Card type='solid-bg'>
            <Row gutter={20}>
              <Col>
                <Typography.Text style={{ fontWeight: 'bold' }}>
                  {$t({ defaultMessage: 'Module 1' })}
                </Typography.Text>
                <UI.Module>
                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    initialValue={[]}
                    name={'module1'}
                    children={
                      <Checkbox.Group
                        key='checkboxGroup_module1'
                        options={portsModule1.map((timeslot, i) => ({
                          label: <Tooltip
                            title={''}
                            className='channels'
                          >
                            <div
                              id={`module1_${i}`}
                              data-testid={`module1_${i}`}
                              style={{ width: '18px', height: '18px' }}
                            ></div>
                          </Tooltip>,
                          value: timeslot.value
                        }))}
                      />
                    }
                  />
                </UI.Module>
              </Col>
              {vlanSettings.enableSlot2 &&
              <Col>
                <Row gutter={20}>
                  <Col>
                    <Typography.Text style={{ fontWeight: 'bold' }}>
                      {$t({ defaultMessage: 'Module 2' })}
                    </Typography.Text>
                    <UI.Module>
                      <Form.Item
                        style={{ marginBottom: '0px' }}
                        initialValue={[]}
                        name={'module2'}
                        children={
                          <Checkbox.Group
                            key='checkboxGroup_module1'
                            options={portsModule2.map((timeslot, i) => ({
                              label: <Tooltip
                                title={timeslot.value}
                                className='channels'
                              >
                                <div
                                  id={`module2_${i}`}
                                  data-testid={`module2_${i}`}
                                  style={{ width: '18px', height: '18px' }}
                                ></div>
                              </Tooltip>,
                              value: timeslot.value
                            }))}
                          />
                        }
                      />
                    </UI.Module>
                  </Col>
                </Row>
              </Col>
              }
              {vlanSettings.enableSlot3 &&
              <Col>
                <Typography.Text style={{ fontWeight: 'bold' }}>
                  {$t({ defaultMessage: 'Module 3' })}
                </Typography.Text>
                <UI.Module>
                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    initialValue={[]}
                    name={'module3'}
                    children={
                      <Checkbox.Group
                        key='checkboxGroup_module3'
                        options={portsModule3.map((timeslot, i) => ({
                          label: <Tooltip
                            title={''}
                            className='channels'
                          >
                            <div
                              id={`module3_${i}`}
                              data-testid={`module3_${i}`}
                              style={{ width: '18px', height: '18px' }}
                            ></div>
                          </Tooltip>,
                          value: timeslot.value
                        }))}
                      />
                    }
                  />
                </UI.Module>
              </Col>
              }
            </Row>
          </Card>
          <DragSelection />
        </Col>
      </Row>
    </>
  )
}