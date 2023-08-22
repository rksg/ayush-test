import { useEffect, useState } from 'react'

import { Form, Input, Select, Space } from 'antd'
import { DefaultOptionType }          from 'antd/lib/select'
import { useIntl }                    from 'react-intl'
import { useParams }                  from 'react-router-dom'

import { CloseSymbol, PlaySolid2, SearchOutlined, StopSolid } from '@acx-ui/icons'
import { useGetCcdSupportVenuesQuery }                        from '@acx-ui/rc/services'
import { MacAddressRegExp }                                   from '@acx-ui/rc/utils'

import ApGroupSelecterDrawer from './ApGroupSelecterDrawer'
import { Button }            from './styledComponents'


const defaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}



export function ClientConnectionDiagnosis () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const clientMac = Form.useWatch('client', form)
  const venueId = Form.useWatch('venue', form)

  const { data: venuesList, isLoading: isVenuesListLoading } =
    useGetCcdSupportVenuesQuery({ params: { tenantId }, payload: defaultPayload })

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [showSelectApsDraw, setShowSelectApsDraw] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAps, setSelectedAps] = useState<string[]>()
  const [selectedApsDisplayText, setSelectedApsDisplayText] = useState<string>()
  const [isTracing, setIsTracing] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(()=> {
    if (!isVenuesListLoading) {
      setVenueOption(
        venuesList?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? []
      )
    }

  }, [venuesList, isVenuesListLoading])


  const openSelectAps = () => {
    setShowSelectApsDraw(true)
  }

  const handleSelectAps = (selectAps: string[], selectApsDisplayText: string) => {
    setSelectedApsDisplayText(selectApsDisplayText)
    setSelectedAps(selectAps)
  }

  const handleStartTrace = () => {
    setIsTracing(!isTracing)
  }

  const handleClear = () => {
    setSelectedApsDisplayText(undefined)
    setSelectedAps(undefined)
    setIsValid(false)
    form.resetFields()
  }

  const handleFieldsChange = () => {
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
    setIsValid(clientMac && !hasErrors)
  }

  return (<>
    <ApGroupSelecterDrawer
      visible={showSelectApsDraw}
      venueId={venueId}
      updateSelectAps={(aps: string[], displayText: string) => handleSelectAps(aps, displayText)}
      onCancel={() => setShowSelectApsDraw(false)}
    />
    <Form form={form}
      onFieldsChange={handleFieldsChange}
    >
      <Space align='baseline'>
        <Form.Item required
          label={$t({ defaultMessage: 'Client' })}
          name='client'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true },
            { validator: (_, value) => MacAddressRegExp(value) }
          ]}
          children={<Input prefix={<SearchOutlined />}
            placeholder={$t({ defaultMessage: 'Enter MAC address' })}
            style={{ width: '300px' }}
          />}
        />

        <Form.Item
          label={$t({ defaultMessage: 'Venue' })}
          name='venue'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={<Select
            options={venueOption}
            placeholder={$t({ defaultMessage: 'Select...' })}
            style={{ width: '250px' }}
          />}
        />

        <Form.Item
          label={$t({ defaultMessage: 'APs' })}
          name='ap'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={<Space>
            <Input readOnly
              placeholder={$t({ defaultMessage: 'Select...' })}
              style={{ width: '250px' }}
              value={selectedApsDisplayText}
            />
            <Button type='link'
              disabled={!venueId}
              onClick={openSelectAps}>
              {$t({ defaultMessage: 'Select' })}
            </Button>
          </Space>}
        />

        <Form.Item
          label=' '
          name='ap'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={
            <Button
              type='text'
              icon={!isTracing? <PlaySolid2 /> : <StopSolid />}
              style={{ width: '200px', paddingTop: '10px' }}
              disabled={showSelectApsDraw || !isValid}
              onClick={handleStartTrace}
            >
              {!isTracing
                ? $t({ defaultMessage: 'Trace Connectivity' })
                : $t({ defaultMessage: 'Stop' })
              }
            </Button>
          }/>

        <Form.Item
          label=' '
          name='ap'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={
            <Button
              type='text'
              icon={<CloseSymbol />}
              disabled={isTracing}
              style={{ paddingTop: '10px' }}
              onClick={handleClear}
            >
              {$t({ defaultMessage: 'Clear' })}
            </Button>
          }/>
      </Space>
    </Form>
  </>)
}
