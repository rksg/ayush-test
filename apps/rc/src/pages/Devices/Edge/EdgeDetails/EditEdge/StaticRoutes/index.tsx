import { useContext, useEffect } from 'react'

import { Col, Form, Row }         from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsForm }             from '@acx-ui/components'
import { EdgeStaticRouteTable }          from '@acx-ui/rc/components'
import { useUpdateStaticRoutesMutation } from '@acx-ui/rc/services'
import { EdgeStaticRoute }               from '@acx-ui/rc/utils'
import { useTenantLink }                 from '@acx-ui/react-router-dom'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

interface StaticRoutesFormType {
  routes: EdgeStaticRoute[]
}

const StaticRoutes = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const {
    staticRouteData,
    isStaticRouteDataFetching
  } = useContext(EditEdgeDataContext)
  const [
    updateStaticRoutes,
    { isLoading: isStaticRoutesUpdating }
  ] = useUpdateStaticRoutesMutation()

  useEffect(() => {
    if(staticRouteData) {
      form.setFieldsValue({
        routes: staticRouteData.routes
      })
    }
  }, [staticRouteData])

  const handleFinish = async (value: StaticRoutesFormType) => {
    try {
      await updateStaticRoutes({ params: params, payload: value }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm<StaticRoutesFormType>
      form={form}
      onFinish={handleFinish}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply Static Routes' }) }}
    >
      <StepsForm.StepForm>
        <Row>
          <Col span={8} style={{ minWidth: 480 }}>
            <Loader states={[
              {
                isLoading: false,
                isFetching: isStaticRouteDataFetching || isStaticRoutesUpdating
              }
            ]}>
              <Form.Item name='routes'>
                <EdgeStaticRouteTable />
              </Form.Item>
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default StaticRoutes
