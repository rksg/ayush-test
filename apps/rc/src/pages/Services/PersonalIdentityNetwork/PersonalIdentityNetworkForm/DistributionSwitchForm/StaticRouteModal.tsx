import { useEffect, useState } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Loader, Modal, ModalType, StepsForm, Subtitle }  from '@acx-ui/components'
import { EdgeStaticRouteTable }                                   from '@acx-ui/rc/components'
import { useGetStaticRoutesQuery, useUpdateStaticRoutesMutation } from '@acx-ui/rc/services'
import { EdgeStaticRoute }                                        from '@acx-ui/rc/utils'

interface StaticRouteModalFormType {
  routes: EdgeStaticRoute[]
}

// TODO: need to add the clusterInfo for getting/updaying StaticRoutes when PIN support HA
export const StaticRouteModal = (props: { edgeId: string, edgeName: string }) => {
  const { edgeId, edgeName } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const {
    data: staticRouteData,
    isFetching: isStaticRouteDataFetching
  }= useGetStaticRoutesQuery({
    params: { serialNumber: edgeId }
  })
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

  const handleFinish = async (value: StaticRouteModalFormType) => {
    try {
      await updateStaticRoutes({
        params: { serialNumber: edgeId },
        payload: value
      }).unwrap()

      setVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return <>
    <Button type='link' size='small' onClick={() => setVisible(true)}>
      {$t({ defaultMessage: 'Static Route' })}
    </Button>
    <Modal
      title={edgeName}
      subTitle={$t({ defaultMessage: 'SmartEdge' })}
      visible={visible}
      destroyOnClose={true}
      type={ModalType.ModalStepsForm}
      width={540}
      onCancel={() => setVisible(false)}
    >
      <Subtitle level={3}>{$t({ defaultMessage: 'Static Route' })}</Subtitle>
      <StepsForm<StaticRouteModalFormType>
        form={form}
        onFinish={handleFinish}
        onCancel={() => setVisible(false)}
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
    </Modal>
  </>
}
