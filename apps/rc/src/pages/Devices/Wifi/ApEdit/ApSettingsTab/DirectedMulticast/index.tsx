import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Space, Switch }            from 'antd'
import { isEmpty }                                  from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'
import { useNavigate, useParams }                   from 'react-router-dom'

import { Button, Loader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useGetApDirectedMulticastQuery,
  useGetApQuery,
  useLazyGetVenueDirectedMulticastQuery,
  useLazyGetVenueQuery,
  useResetApDirectedMulticastMutation,
  useUpdateApDirectedMulticastMutation
} from '@acx-ui/rc/services'
import { ApDirectedMulticast, VenueDirectedMulticast, VenueExtended } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                  from '@acx-ui/react-router-dom'

import { ApEditContext } from '../../../ApEdit/index'
import { FieldLabel }    from '../styledComponents'

export function DirectedMulticast () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const { data: apDetails } = useGetApQuery({ params: { tenantId, serialNumber } })
  const directedMulticast = useGetApDirectedMulticastQuery({ params: { serialNumber } })
  const [updateApDirectedMulticast, { isLoading: isUpdatingApDirectedMulticast }] =
    useUpdateApDirectedMulticastMutation()
  const [resetApDirectedMulticast, { isLoading: isResetApDirectedMulticast }] =
    useResetApDirectedMulticastMutation()

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueDirectedMulticast] = useLazyGetVenueDirectedMulticastQuery()

  const formRef = useRef<StepsFormInstance<ApDirectedMulticast>>()

  const [venue, setVenue] = useState({} as VenueExtended)
  const [initData, setInitData] = useState({} as ApDirectedMulticast)
  const [apDirectedMulticast, setApDirectedMulticast] = useState({} as ApDirectedMulticast)
  const [venueDirectedMulticast, setVenueDirectedMulticast] = useState({} as VenueDirectedMulticast)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

  const directedMulticastSettings = [
    {
      key: 'wired',
      label: defineMessage({ defaultMessage: 'Wired Client' }),
      fieldName: 'wiredEnabled'
    },
    {
      key: 'wireless',
      label: defineMessage({ defaultMessage: 'Wireless Client' }),
      fieldName: 'wirelessEnabled'
    },
    {
      key: 'network',
      label: defineMessage({ defaultMessage: 'Network' }),
      fieldName: 'networkEnabled'
    }
  ]


  useEffect(() => {
    const directedMulticastData = directedMulticast?.data
    if (apDetails && directedMulticastData) {
      const venueId = apDetails.venueId
      const setData = async () => {
        const venue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())
        const venueDirectedMulticastData = (await getVenueDirectedMulticast({
          params: { tenantId, venueId } }, true).unwrap())

        setVenue(venue)
        setVenueDirectedMulticast(venueDirectedMulticastData)
        setIsUseVenueSettings(directedMulticastData.useVenueSettings)

        setInitData(directedMulticastData)
        setFormInitializing(false)
      }

      setData()
    }
  }, [ apDetails, directedMulticast?.data ])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApDirectedMulticast({ ...currentData } )
      }

      if (venueDirectedMulticast) {
        const data = {
          ...venueDirectedMulticast,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apDirectedMulticast)) {
        formRef?.current?.setFieldsValue(apDirectedMulticast)
      }
    }

    updateEditContext(formRef?.current as StepsFormInstance, true)
  }


  const handleUpdateDirectedMulticast = async (values: ApDirectedMulticast) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      if (isUseVenueSettings) {
        await resetApDirectedMulticast({
          params: { serialNumber }
        }).unwrap()
      } else {
        const payload = {
          ...values,
          useVenueSettings: isUseVenueSettings
        }

        await updateApDirectedMulticast({
          params: { serialNumber },
          payload
        }).unwrap()
      }

    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const updateEditContext = (form: StepsFormInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Directed Multicast' }),
      isDirty: isDirty,
      updateChanges: () => handleUpdateDirectedMulticast(form?.getFieldsValue()),
      discardChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormInstance, true)
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApDirectedMulticast || isResetApDirectedMulticast
  }]}>
    <StepsForm
      formRef={formRef}
      onFormChange={handleChange}
      onFinish={handleUpdateDirectedMulticast}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi/${serialNumber}/details/overview`
      })}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply Directed Multicast' })
      }}
    >
      <StepsForm.StepForm initialValues={initData}>
        <Row gutter={20}>
          <Col span={8}>
            <Space style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              paddingBottom: '41px' }}
            >
              { isUseVenueSettings ?
                <FormattedMessage
                  defaultMessage={`
              Currently settings as the venue (<venuelink></venuelink>)
            `}
                  values={{
                    venuelink: () =>
                      <TenantLink
                        to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                      </TenantLink>
                  }}/>
                : $t({ defaultMessage: 'Custom settings' })
              }
            </Space>
          </Col>
          <Col span={8}>
            <Button type='link' onClick={handleVenueSetting}>
              {isUseVenueSettings ?
                $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use Venue Settings' })
              }
            </Button>
          </Col>
        </Row>
        <Row gutter={0} style={{ height: '40px' }}>
          <Col span={8}>
            {$t({ defaultMessage: 'Multicast Traffic from:' })}
          </Col>
        </Row>
        { directedMulticastSettings.map(({ key, fieldName, label }) => (
          <FieldLabel width='180px' key={key} >
            {$t(label)}
            <Form.Item
              name={fieldName}
              valuePropName='checked'
              style={{ marginTop: '-5px' }}
              children={
                <Switch
                  data-testid={key+'-switch'}
                  disabled={isUseVenueSettings}
                />
              }
            />
          </FieldLabel>
        ))}
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>
  )
}
