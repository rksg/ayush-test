import { useState, useRef, useEffect } from 'react'

import { Col, Dropdown, Form, Input, List, Menu, MenuProps, Row, Space, Select, Switch, Typography, FormInstance } from 'antd'
import { useIntl, FormattedMessage }                                                                               from 'react-intl'

import 'codemirror/addon/hint/show-hint.js'

import {
  Button,
  SelectionControl,
  StepsForm,
  Tabs,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'
import { CsvSize, CodeMirrorWidget, ImportFileDrawer, ImportFileDrawerType } from '@acx-ui/rc/components'
import {
  useGetCliConfigExamplesQuery,
  useGetCliTemplatesQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  CliTemplateExample,
  CliTemplateVariable,
  transformTitleCase,
  whitespaceOnlyRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { CliVariableModal } from './CliVariableModal'
import * as UI              from './styledComponents'

import { tooltip } from './'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

interface codeMirrorElement {
  current: {
    getInstance: Function,
    changeFontSize: Function
  }
}

const cliExamplesTooltip = <FormattedMessage
  defaultMessage={`
    <p>Click on the template to add it to the CLI configuration.</p>
    <br></br>
    <p>Replace the command input field enclosed in < > and
      highlighted in orange with the desired value.</p>
    <br></br>
    <div>
      <p>For example:</p>
      <p>interface ve 100 </p>
      <p>vrf forwarding <strong> < vrf_name > </strong> </p>
      <p>ip address <strong> < ip address/mask > </strong> </p>
      <p>ip pim-sparse  </p>
      <p>ip ospf area <strong> < area number/ip format > </strong> </p>
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

export const maxVariableCount = 200
const cliTemplatesPayload = {
  fields: ['name', 'id', 'venueSwitches'],
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

// TODO: move to rc/components
export function CliStepConfiguration () {
  const { $t } = useIntl()
  const params = useParams()
  const { form, editMode } = useStepFormContext()
  const isTemplate = params?.configType !== 'profiles'
  const cliDefaultString = isTemplate ? '' : 'manager registrar'

  const [cli, setCli] = useState('')
  const [cliFontSize, setCliFontSize] = useState('14')
  const [variableList, setVariableList] = useState([] as unknown as CliTemplateVariable[])
  const [variableFilterType, setVariableFilterType] = useState('')
  const [variableModalvisible, setVariableModalvisible] = useState(false)
  const [variableModalEditMode, setVariableModalEditMode] = useState(false)
  const [selectedEditVariable, setSelectedEditVariable] = useState({} as CliTemplateVariable)
  const [importModalvisible, setImportModalvisible] = useState(false)
  const [initVariableList, setInitVariableList] = useState(false)

  const { data: configExamples } = useGetCliConfigExamplesQuery({ params })
  const { data: cliTemplates }
    = useGetCliTemplatesQuery({ params, payload: cliTemplatesPayload }, { skip: !isTemplate })

  const codeMirrorEl = useRef(null as unknown as {
    getInstance: Function,
    changeFontSize: Function
  })
  const codeMirrorInstance = codeMirrorEl?.current?.getInstance()
  const existingTemplateNameList = cliTemplates?.data?.filter(
    t => !editMode || t.id !== params?.templateId
  ).map(t => t.name) ?? []

  useEffect(() => {
    if (codeMirrorInstance) {
      codeMirrorInstance.on('change', (
        cm: CodeMirror.EditorFromTextArea
      ) => codemirrorOnChange(cm, setCli, form))

      codeMirrorInstance.on('keyup', (
        cm: CodeMirror.EditorFromTextArea,
        event: React.KeyboardEvent
      ) => codemirrorOnKeyup(cm, event, form))

      const cli = form?.getFieldValue('cli')
      codeMirrorInstance?.setValue(cli ?? cliDefaultString)
      !isTemplate && markCodeMirrorReadOnlyText(codeMirrorInstance)

      const validation = validateCLI(codeMirrorEl, variableList, cliDefaultString)
      form?.setFieldsValue({
        variables: variableList,
        cliValid: validation
      })
    }
  }, [codeMirrorInstance])

  useEffect(() => {
    const data = form?.getFieldsValue(true)
    if (data) {
      setVariableList((data?.variables ?? []) as CliTemplateVariable[])
      setInitVariableList(true)
    }
  }, [])

  useEffect(() => {
    if (initVariableList && codeMirrorInstance) {
      const validation = validateCLI(codeMirrorEl, variableList, cliDefaultString)
      form?.setFieldsValue({
        variables: variableList,
        cliValid: validation
      })
    }
  }, [variableList])

  useEffect(() => {
    if (codeMirrorInstance) {
      const validation = validateCLI(codeMirrorEl, variableList, cliDefaultString)
      form?.setFieldsValue({ cliValid: validation })
    }
  }, [cli])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'edit':
        setVariableModalvisible(true)
        setVariableModalEditMode(true)
        break
      case 'delete':
        setVariableList(variableList?.filter(v => v.name !== selectedEditVariable.name))
        break
    }
  }

  const variableActionMenu = (
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
        <StepsForm.Title children={$t({ defaultMessage: 'CLI Configuration' })} />
        {isTemplate && <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Template Name' })}
          rules={[
            { required: true },
            { max: 64 },
            { validator: (_, value) => whitespaceOnlyRegExp(value) },
            {
              validator: (_, value) => checkObjectNotExists(
                existingTemplateNameList, value, $t({ defaultMessage: 'Template' })
              )
            }
          ]}
          initialValue=''
          validateFirst
          hasFeedback
          children={<Input />}
        />}

        {isTemplate && <Form.Item
          noStyle
          children={<UI.ToggleWrapper>
            <Form.Item
              noStyle
              name='reload'
              valuePropName='checked'
              children={<Switch />}
            />
            <Typography.Text style={{ fontSize: '12px' }}>
              {$t({ defaultMessage: 'Reboot the Switches after applying config' })}
            </Typography.Text>
          </UI.ToggleWrapper>}
        />}

        {!isTemplate && <Form.Item
          noStyle
          children={<UI.ToggleWrapper>
            <Form.Item
              noStyle
              name='overwrite'
              valuePropName='checked'
              children={<Switch />}
            />
            <Typography.Text style={{ fontSize: '12px' }}>
              {$t({ defaultMessage: 'Override existing switch configuration' })}
            </Typography.Text>
          </UI.ToggleWrapper>}
        />}

        <Form.Item
          hidden={true}
          name='id'
          children={<Input />}
        />
        <Form.Item
          hidden={true}
          name='cli'
          children={<Input />}
        />
        <Form.Item
          hidden={true}
          name='cliValid'
          children={<Input />}
          rules={[
            { validator: (_, value) => value?.valid ? Promise.resolve() : Promise.reject() }
          ]}
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
              title={$t(tooltip.cliCommands)}
              placement='bottom'
            >
              <UI.QuestionMarkIcon />
            </Tooltip>
          </Space>
          <Space style={{ display: 'flex', fontSize: '12px', margin: '4px 25px 10px 0' }}>
            <Button
              type='link'
              size='small'
              onClick={() => setImportModalvisible(true)}
            >{
                $t({ defaultMessage: 'Import from file' })
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
              clis: cliDefaultString,
              configOptions: {
                readOnly: false
              }
            }}
          />
        </UI.CodeMirrorContainer>
      </Col>
      <Col span={10} style={{ padding: '0 8px' }}>
        <UI.TabsLayout
          defaultActiveKey='examples'
        >
          <Tabs.TabPane
            tab={<Space>
              {$t({ defaultMessage: 'CLI Examples' })}
              <Tooltip
                title={
                  <UI.tooltip>{cliExamplesTooltip}</UI.tooltip>
                }
                placement='bottom'
              >
                <span data-testid='tooltip-example'>
                  <UI.QuestionMarkIcon />
                </span>
              </Tooltip>
            </Space>}
            key='examples'
          >
            <CliTemplateExampleList
              configExamples={configExamples}
              codeMirrorInstance={codeMirrorInstance}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={$t({ defaultMessage: 'Variables' })} key='variables'>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip
                title={variableList?.length >= maxVariableCount
                  ? $t(tooltip.cliVariablesReachMax) : ''
                }
              >
                <Space>
                  <Button type='link'
                    size='small'
                    disabled={variableList?.length >= maxVariableCount}
                    onClick={() => {
                      setVariableModalvisible(true)
                      setVariableModalEditMode(false)
                      setSelectedEditVariable(null as unknown as CliTemplateVariable)
                    }}>
                    {$t({ defaultMessage: 'Add Variable' })}
                  </Button>
                </Space>
              </Tooltip>
            </Space>
            <Select
              defaultValue=''
              size='small'
              style={{ width: '120px' }}
              options={[
                { label: $t({ defaultMessage: 'All types' }), value: '' },
                { label: $t({ defaultMessage: 'Address' }), value: VariableType.ADDRESS },
                { label: $t({ defaultMessage: 'Range' }), value: VariableType.RANGE },
                { label: $t({ defaultMessage: 'String' }), value: VariableType.STRING }
              ]}
              onChange={(value) => setVariableFilterType(value)}
            />
            <UI.VariableList
              size='small'
              dataSource={variableList?.filter(
                v => !variableFilterType || v.type === variableFilterType)}
              renderItem={(item) => {
                const variable = item as CliTemplateVariable
                return <List.Item
                  actions={[
                    <Button
                      data-testid='add-var-btn'
                      size='small'
                      ghost={true}
                      onClick={() => {
                        appendContentToCliEditor(codeMirrorInstance, 'var', variable.name)
                      }}>
                      <UI.PlusIcon />
                    </Button>,
                    <Dropdown overlay={variableActionMenu} trigger={['click']} key='actionMenu'>
                      <Button
                        data-testid='edit-var-btn'
                        size='small'
                        ghost={true}
                        icon={<UI.MoreVerticalIcon />}
                        onClick={() => {
                          setSelectedEditVariable(variable)
                        }}
                      />
                    </Dropdown>
                  ]}
                >
                  <List.Item.Meta
                    title={<Space size={0} split={<UI.Divider type='vertical' />}>
                      <Space style={{ fontWeight: 600 }}>{variable.name}</Space>
                      {transformTitleCase(variable.type)}</Space>
                    }
                    description={transformVariableValue(variable.type, variable.value)}
                  />
                </List.Item>
              }}
            />
          </Tabs.TabPane>
        </UI.TabsLayout>
      </Col>
    </Row>

    {variableModalvisible && <CliVariableModal
      data={selectedEditVariable}
      editMode={variableModalEditMode}
      modalvisible={variableModalvisible}
      setModalvisible={setVariableModalvisible}
      variableList={variableList}
      setVariableList={setVariableList}
    />}

    <ImportFileDrawer
      type={ImportFileDrawerType.CLI}
      title={$t({ defaultMessage: 'Import from file' })}
      maxSize={CsvSize['2MB']}
      acceptType={['csv', 'txt']}
      visible={importModalvisible}
      readAsText={true}
      importRequest={(formData, values, content)=>{
        appendContentToCliEditor(codeMirrorInstance, 'file', `\n${content}\n`)
        setImportModalvisible(false)
      }}
      onClose={()=>setImportModalvisible(false)}
    />
  </>
}

function CliTemplateExampleList (props: {
  codeMirrorInstance: CodeMirror.EditorFromTextArea,
  configExamples?: CliTemplateExample[]
}) {
  const { codeMirrorInstance, configExamples } = props
  return <UI.ExampleList
    size='small'
    dataSource={configExamples}
    renderItem={(item) => {
      const example = item as CliTemplateExample
      return <Tooltip
        title={example.cli}
        placement='bottom'
      ><List.Item
          actions={[
            <Button
              data-testid='add-example-btn'
              type='link'
              size='small'
              onClick={() => {
                appendContentToCliEditor(codeMirrorInstance, 'example', `\n${example.cli}\n`)
              }}>
              <UI.PlusIcon />
            </Button>
          ]}
        >{example.name}</List.Item>
      </Tooltip>
    }}
  />
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

function codemirrorOnChange (
  cm: CodeMirror.EditorFromTextArea,
  setCli: (data: string) => void,
  form: FormInstance
) {
  setCli(cm.getValue())
  form?.setFieldValue('cli', cm.getValue())
}

function codemirrorOnKeyup (
  cm: CodeMirror.EditorFromTextArea,
  event: React.KeyboardEvent,
  form: FormInstance
) {
  const targetValue = (event.target as HTMLInputElement).value
  const lastTargetValue = targetValue.charAt(targetValue.length - 1)
  const isLeftCurlyBracket = event.keyCode === 219 && lastTargetValue === '{'
  const variables = form?.getFieldValue('variables')
  const completion = cm.state.completionActive

  if (variables?.length && !cm.state.completionActive && isLeftCurlyBracket) {
    cm.showHint({
      completeSingle: false,
      hint: (cm: CodeMirror.Editor) => ({
        from: cm.getCursor(), to: cm.getCursor(),
        list: variables.map((v: CliTemplateVariable) => v.name)
      })
    })
  } else if (variables?.length && event.keyCode !== 16 && !isLeftCurlyBracket) {
    cm.closeHint()
  }

  if (completion?.pick) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completion.pick = function (data: any, i: number) {
      let completion = data.list
      completion?.pick?.apply(this, arguments)

      appendContentToCliEditor(cm, 'variableMenu', data.list[i])
      cm.closeHint()
    }
  }
}

function markCodeMirrorReadOnlyText (codeMirrorInstance: CodeMirror.EditorFromTextArea) {
  // mark text "manager registrar" read only and unselectable
  codeMirrorInstance?.markText({ line: 0, ch: 0 }, { line: 0, ch: 17 }, {
    readOnly: true,
    atomic: true,
    selectLeft: false,
    css: 'color: #808080'
  })
}

function appendContentToCliEditor (
  codeMirrorInstance: CodeMirror.EditorFromTextArea,
  type: string,
  content: string
) {
  let replacement = ''
  const cursor = codeMirrorInstance?.getCursor()
  const lastWord = codeMirrorInstance?.getRange({
    line: cursor.line, ch: 0
  }, cursor)

  const hasDollarSign = lastWord?.slice(-2) === '${'
  const fromPosition = type === 'variableMenu'
    ? { line: cursor.line, ch: cursor.ch - (hasDollarSign ? 2 : 1) }
    : cursor

  if (type === 'example' || type === 'file') {
    replacement = content
  } else { // variable & variable menu
    const needSpace = needSpaceBeforeVariable(type, lastWord)
    replacement = (needSpace ? htmlDecode('&nbsp;') : '') + '${' + content + '}'
  }

  codeMirrorInstance?.replaceRange(replacement, fromPosition, cursor)
  setTimeout(() => {
    codeMirrorInstance?.focus?.()
  }, 100)
}

function needSpaceBeforeVariable (type: string, lastWord: string) {
  const hasDollarSign = lastWord.slice(-2) === '${'

  if (type === 'variableMenu') {
    const subStringCount = hasDollarSign ? 2 : 1
    lastWord = lastWord.substr(0, (lastWord.length - subStringCount))
  }

  return !!lastWord.match(/.*\${[^{}]*}$/)
}

function validateCLI (
  codeMirrorEl: codeMirrorElement,
  variableList: CliTemplateVariable[],
  cliDefaultString?: string
) {
  const { $t } = getIntl()
  const cm = codeMirrorEl?.current?.getInstance()
  const variableNameList = variableList?.map(v => v.name)

  const isInputCli = cm?.getValue()
    && (cm?.getValue().replace(/\s/g, '') !== cliDefaultString?.replace(/\s/g, ''))
  const isAllAttributeDefined
    = cm?.display.wrapper.querySelectorAll('.cm-attribute')?.length === 0
  const isAllVariableMatch = [...(cm?.display?.wrapper?.querySelectorAll('.cm-variable') ?? [])
  ]?.filter(variable => {
    const name = variable.textContent.slice(2, -1)
    return variableNameList.indexOf(name) === -1
  })?.length === 0

  const tooltipMap = {
    empty: $t({ defaultMessage: 'Please input CLI commands' }),
    variable: $t({ defaultMessage: 'Please define variable(s) in CLI commands' }),
    attribute: $t({ defaultMessage: 'Please define attribute(s) in CLI commands' })
  }

  const getDisabledTooltip = () => {
    if (!isInputCli) return tooltipMap.empty
    else if (!isAllVariableMatch) return tooltipMap.variable
    else if (!isAllAttributeDefined) return tooltipMap.attribute
    else return ''
  }

  return {
    valid: (isInputCli && isAllAttributeDefined && isAllVariableMatch) ?? false,
    tooltip: getDisabledTooltip()
  }
}

function htmlDecode (code: string) {
  let div = document.createElement('div')
  div.innerHTML = code
  return div.innerText?.replace(/↵/g, '\n') || div?.textContent?.replace(/↵/g, '')
}
