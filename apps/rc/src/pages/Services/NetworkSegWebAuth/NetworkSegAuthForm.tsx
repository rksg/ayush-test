import { useEffect, useRef } from 'react'

import {
  Form,
  Input,
  Space
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
}    from '@acx-ui/feature-toggle'
import {
  useCreateWebAuthTemplateMutation,
  useGetWebAuthTemplateQuery,
  useUpdateWebAuthTemplateMutation
} from '@acx-ui/rc/services'
import {
  CommonResult,
  ServiceOperation,
  ServiceType,
  WebAuthTemplate,
  defaultTemplateData,
  getServiceRoutePath,
  getWebAuthLabelValidator,
  redirectPreviousPage,
  useServiceListBreadcrumb,
  useServicePreviousPath
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export default function NetworkSegAuthForm (
  { editMode = false, modalMode = false, modalCallBack = ()=>{} }:
  { editMode?: boolean, modalMode?: boolean, modalCallBack?: (id?: string)=>void }
) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname: previousPath } =
    useServicePreviousPath(ServiceType.WEBAUTH_SWITCH, ServiceOperation.LIST)
  const linkToTableView = useTenantLink(getServiceRoutePath({
    type: ServiceType.WEBAUTH_SWITCH,
    oper: ServiceOperation.LIST
  }))

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [createWebAuthTemplate] = useCreateWebAuthTemplateMutation()
  const [updateWebAuthTemplate] = useUpdateWebAuthTemplateMutation()
  const { data } = useGetWebAuthTemplateQuery(
    { params, enableRbac: isSwitchRbacEnabled }, { skip: !editMode }
  )

  const formRef = useRef<StepsFormLegacyInstance<WebAuthTemplate>>()

  const finishHandler = (response?: WebAuthTemplate, previousPath = '')=>{
    formRef.current?.resetFields()
    if (modalMode) modalCallBack(response?.id)
    else redirectPreviousPage(navigate, previousPath, linkToTableView)
  }

  useEffect(() => {
    if (data && editMode) {
      formRef.current?.setFieldsValue(data)
    }
  }, [data, editMode])

  const saveData = async (value: WebAuthTemplate) => {
    try {
      let results = {} as CommonResult
      if (editMode) {
        await updateWebAuthTemplate({
          params, payload: value, enableRbac: isSwitchRbacEnabled
        }).unwrap()
      } else {
        results = await createWebAuthTemplate({
          params, payload: _.omit(value, 'id'), enableRbac: isSwitchRbacEnabled
        }).unwrap()
      }

      finishHandler(results.response as WebAuthTemplate)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const WebAuthFormItem = ({ name, label }:
    { name: keyof typeof defaultTemplateData, label: string }
  ) => {
    return (
      <UI.TextAreaWithReset label={label} required={true}>
        <Space size='middle'>
          <Form.Item name={name}
            validateTrigger='onBlur'
            rules={[getWebAuthLabelValidator(), {
              required: true,
              message: $t({ defaultMessage: 'Please enter {label}' }, { label })
            }]}
            children={<Input.TextArea autoSize />} />
          <Button type='link'
            onClick={()=>{
              formRef?.current?.setFieldValue(name, $t(defaultTemplateData[name].defaultMessage, {
                year: new Date().getFullYear()
              }))
            }}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button>
        </Space>
      </UI.TextAreaWithReset>)
  }

  const breadcrumb = useServiceListBreadcrumb(ServiceType.WEBAUTH_SWITCH)

  return (
    <>
      { !modalMode && <PageHeader
        title={editMode ?
          $t({ defaultMessage: 'Edit PIN Portal for Switch' }) :
          $t({ defaultMessage: 'Add PIN Portal for Switch' })}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<WebAuthTemplate>
        formRef={formRef}
        editMode={editMode}
        onCancel={() => finishHandler(undefined, previousPath)}
        onFinish={saveData}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          layout='vertical' >
          <StepsFormLegacy.Title>
            {$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[{ required: true }]} >
            <Input style={{ width: '360px' }}/>
          </Form.Item>
          <Form.Item name='id' hidden><Input type='hidden' /></Form.Item>
          {/* <Form.Item name='tag' // TODO: Waiting for TAG feature support
            label={$t({ defaultMessage: 'Tags' })} >
            <Select mode='tags' size='middle' allowClear style={{ width: '360px' }}/>
          </Form.Item> */}
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Auth Page Details' })}</Subtitle>
          {
            (Object.keys(defaultTemplateData) as (keyof typeof defaultTemplateData)[])
              .map(name=>{
                const item = defaultTemplateData[name]
                return (<WebAuthFormItem name={name}
                  key={name}
                  label={$t(item.label)} />)
              })
          }
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
