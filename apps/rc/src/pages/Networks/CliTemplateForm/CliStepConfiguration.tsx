import { useState, useRef, useEffect } from 'react'

import { Col, Dropdown, Form, Input, List, Menu, MenuProps, Row, Space, Select } from 'antd'
import _                                                                         from 'lodash'
import { useIntl, FormattedMessage }                                             from 'react-intl'

import {
  Button,
  SelectionControl,
  StepsForm,
  Tabs,
  Tooltip
} from '@acx-ui/components'
import { CodeMirrorWidget }      from '@acx-ui/rc/components'
import {
  useGetCliConfigExamplesQuery
} from '@acx-ui/rc/services'
import {
  CliTemplateExample,
  transformTitleCase,
  whitespaceOnlyRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { CliVariableModal } from './CliVariableModal'
import * as UI              from './styledComponents'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export interface Variable {
  name: string
  type: string
  value: string
}

interface codeMirrorElement {
  current: {
    changeFontSize: Function,
    appendContent: Function
  }
}

const cliExamplesTooltip = <FormattedMessage
  defaultMessage={`
    <p>Click on the template to add it to the CLI configuration.</p>
    <br></br>
    <p>Replace the command input field enclosed in < > and highlighted in orange with the desired value.</p>
    <br></br>
    <div>
      <p>For example:</p>
      <p>interface ve 100 </p>
      <p>vrf forwarding <strong> &lt; vrf_name  &gt; </strong> </p>
      <p>ip address <strong> &lt; ip address/mask &gt; </strong> </p>
      <p>ip pim-sparse  </p>
      <p>ip ospf area <strong> &lt; area number/ip format &gt; </strong> </p>
    </div>
    <br></br>
    <div>
      <p>becomes:</p>
      <p> interface ve 100 </p>
      <p> vrf forwarding <strong> VRF1 </strong> </p>
      <p> ip address <strong> 10.0.0.1/24 </strong> </p>
      <p> ip pim-sparse </p>
      <p> ip ospf area <strong> 0.0.0.0 </strong> </p>
    </div>
  `}
  values={{
    br: () => <br />,
    div: (text) => <div>{text}</div>,
    p: (text: string) => <p>{text}</p>,
    strong: (text) => <strong>{text}</strong>
  }}
/>

export function CliStepConfiguration (props: {
  formRef: any
}) {
  const { $t } = useIntl()
  const params = useParams()
  const { formRef } = props

  const variables = [
    { name: 'test', type: 'RANGE', value: '3:4' },
    { name: 'aaa', type: 'STRING', value: 'a' },
    { name: 'test2', type: 'ADDRESS', value: '1.1.1.1_1.1.1.20_255.255.255.0' }
  ]

  const [cliFontSize, setCliFontSize] = useState('14')
  const [variableList, setVariableList] = useState(variables)
  const [variableFilterType, setVariableFilterType] = useState('')
  const [variableModalvisible, setVariableModalvisible] = useState(false)
  const [variableModalEditMode, setVariableModalEditMode] = useState(false)
  const [selectedEditVariable, setSelectedEditVariable] = useState({} as any)

  const codeMirrorEl = useRef(null as unknown as {
    changeFontSize: Function,
    appendContent: Function
  })

  const { data: configExamples } = useGetCliConfigExamplesQuery({ params })

  useEffect(() => {
    formRef?.current?.setFieldValue('variables', variableList)
  }, [variableList])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'edit':
        setVariableModalvisible(true)
        setVariableModalEditMode(true)
        break
      case 'delete':
        setVariableList(variableList.filter(v => v.name !== selectedEditVariable.name))
        break
    }
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'Edit' }),
        key: 'edit'
      }, {
        label: $t({ defaultMessage: 'Delete' }),
        key: 'delete'
      }]}
    />
  )

  return <>
    <Row gutter={24}>
      <Col span={8}>
        <StepsForm.Title>{$t({ defaultMessage: 'CLI Configuration' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Template Name' })}
          rules={[
            { required: true },
            { max: 64 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />

        {/* <Form.Item
          name='reload'
          label={$t({ defaultMessage: 'Reboot the Switches after applying config' })}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>

        <Space style={{ margin:'0 0 10px' }}>
          <Form.Item
            noStyle
            validateFirst
            hasFeedback
            children={<Switch />}
          />
          <Typography.Text style={{ fontSize: '12px', margin:'0 0' }}>
          {$t({ defaultMessage: '  Reboot the Switches after applying config' })}
          </Typography.Text>
        </Space> */}

        <Form.Item
          hidden={true}
          name='cli'
          children={<Input />}
        />
        <Form.Item
          hidden={true}
          name='variables'
          initialValue={variableList}
          children={<Input />}
        />
      </Col>
    </Row>
    <Row style={{ maxWidth: '900px' }}>
      <Col span={14} style={{ borderRight: '1px solid #c4c4c4' }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space style={{ display: 'flex', fontWeight: 600 }}>
            {$t({ defaultMessage: 'CLI commands' })}
            <Tooltip
              title={$t({ defaultMessage: 'You can use any combination of the following options: type the commands, copy/paste the configuration from another file, use the examples on the right pane.' })}
              placement='bottom'
            >
              <UI.QuestionMarkIcon />
            </Tooltip>
          </Space>
          <Space style={{ display: 'flex', fontSize: '12px', margin: '4px 25px 10px 0' }}>
            <Button type='link' size='small'>{
              $t({ defaultMessage: 'Import from file' }) //TODO
            }</Button>
            <UI.SelectionControlLayout>
              {$t({ defaultMessage: 'Font size:' })}
              <SelectionControl
                onChange={(e) => {
                  setCliFontSize(e.target.value)
                  codeMirrorEl?.current?.changeFontSize(e.target.value)
                }}
                options={[
                  { value: '12', label: 'A' },
                  { value: '14', label: 'A' },
                  { value: '16', label: 'A' }
                ]}
                value={cliFontSize}
              />
            </UI.SelectionControlLayout>
          </Space>
        </Space>
        <UI.CodeMirrorContainer>
          <CodeMirrorWidget
            ref={codeMirrorEl}
            type='cli'
            size={{
              height: '450px',
              width: '100%'
            }}
            data={{
              clis: '',
              configOptions: {
                readOnly: false
              }
            }}
            onChange={(cm: any) => {
              formRef?.current?.setFieldValue('cli', cm.getValue())
            }}
          />
        </UI.CodeMirrorContainer>
      </Col>
      <Col span={10} style={{ padding: '0 8px' }}>
        <UI.TabsLayout
          defaultActiveKey='examples'
        >
          <Tabs.TabPane tab={<Space>
            {$t({ defaultMessage: 'CLI Examples' })}
            <Tooltip
              title={
                <UI.tooltip>{cliExamplesTooltip}</UI.tooltip>
              }
              placement='bottom'
            >
              <UI.QuestionMarkIcon />
            </Tooltip>
          </Space>}
          key='examples'>
            <CliTemplateExampleList configExamples={configExamples} codeMirrorEl={codeMirrorEl} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={$t({ defaultMessage: 'Variables' })} key='variables'>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='link'
                size='small'
                onClick={() => {
                  setVariableModalvisible(true)
                  setVariableModalEditMode(false)
                  setSelectedEditVariable(null)
                }}>
                {$t({ defaultMessage: 'Add Variable' })}
              </Button>
            </Space>
            <Select
              defaultValue=''
              size='small'
              style={{ width: '120px' }}
              options={[
                { label: $t({ defaultMessage: 'All types' }), value: '' },
                { label: $t({ defaultMessage: 'Address' }), value: 'ADDRESS' },
                { label: $t({ defaultMessage: 'Range' }), value: 'RANGE' },
                { label: $t({ defaultMessage: 'String' }), value: 'STRING' }
              ]}
              onChange={(value) => setVariableFilterType(value)}
            />
            <UI.VariableList
              size='small'
              dataSource={variableList.filter(v => !variableFilterType || v.type === variableFilterType)}
              renderItem={(item: any) => <List.Item
                actions={[
                  <Button size='small'
                    ghost={true}
                    onClick={() => {
                      codeMirrorEl?.current?.appendContent('var', item.name)
                    }}>
                    <UI.PlusIcon />
                  </Button>,
                  <Dropdown overlay={menu} trigger={['click']} key='actionMenu'>
                    <Button
                      size='small'
                      ghost={true}
                      icon={<UI.MoreVerticalIcon />}
                      onClick={() => {
                        setSelectedEditVariable(item)
                      }}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  title={<Space size={0} split={<UI.Divider type='vertical' />}>
                    <Space style={{ fontWeight: 600 }}>{item.name}</Space>
                    {transformTitleCase(item.type)}</Space>
                  }
                  description={transformVariableValue(item.type, item.value)}
                />
              </List.Item>
              }
            />
          </Tabs.TabPane>
        </UI.TabsLayout>
      </Col>
    </Row>

    <CliVariableModal
      data={selectedEditVariable}
      editMode={variableModalEditMode}
      modalvisible={variableModalvisible}
      setModalvisible={setVariableModalvisible}
      variableList={variableList}
      setVariableList={setVariableList}
    />
  </>
}

function transformVariableValue (vtype: string, value: string) {
  const type = vtype.toUpperCase()
  const separator = type === VariableType.RANGE ? ':' : (type === VariableType.ADDRESS ? '_' : '*')
  const values = value.split(separator)

  switch (type) {
    case VariableType.ADDRESS:
      return `${values[0]} ~ ${values[1]} / ${values[2]}`
    case VariableType.RANGE:
      return `${values[0]} ~ ${values[1]}`
    default:
      return values[0]
  }
}

function CliTemplateExampleList (props: {
  configExamples?: CliTemplateExample[],
  codeMirrorEl: codeMirrorElement
}) {
  const { configExamples, codeMirrorEl } = props
  return <UI.ListLayout
    size='small'
    dataSource={configExamples}
    renderItem={(item) => {
      const example = item as CliTemplateExample
      return <Tooltip
        title={example.cli}
        placement='bottom'
      ><List.Item
          actions={[
            <Button type='link'
              size='small'
              onClick={() => {
                codeMirrorEl?.current?.appendContent('example', `\n${example.cli}\n`)
              }}>
              <UI.PlusIcon />
            </Button>
          ]}
        >{example.name}</List.Item>
      </Tooltip>
    }}
  />
}