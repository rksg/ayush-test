import { Empty, Space } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Button, Loader }        from '@acx-ui/components'
import { BulbOutlined }          from '@acx-ui/icons'
import { useFloorPlanListQuery } from '@acx-ui/rc/services'
import { FloorPlanDto }          from '@acx-ui/rc/utils'

import PlainView from './PlainView/PlainView'
import * as UI   from './styledComponents'


export default function FloorPlan () {
  const params = useParams()
  const { data } = useFloorPlanListQuery({ params })
  const { $t } = useIntl()

  const floorPlans: FloorPlanDto[] = (data as FloorPlanDto[])

  const expandClickHandler = () => {

  }

  return (
    <Loader states={[{ isLoading: !floorPlans, isFetching: !floorPlans }]}>
      {floorPlans?.length ?
        <>
          <PlainView floorPlans={floorPlans} />
          <UI.StyledSpace size={24}>
            <Button size='small' type='link'>{$t({ defaultMessage: '+ Add Floor Plan' })}</Button>
            <Button size='small' type='link'>
              {$t({ defaultMessage: 'Unplaced Devices (0)' })}
            </Button>
            <UI.Button
              key={'expand-btn'}
              title={$t({ defaultMessage: 'Expand' })}
              icon={<UI.ArrowOutIcon />}
              onClick={expandClickHandler}
            />
          </UI.StyledSpace>
        </>
        :
        <Empty description={
          <Space><BulbOutlined />
            <span>
              {$t({ defaultMessage:
          'You can place your devices on floor plans or map to view their geographical distribution'
              })}
            </span>
          </Space>}>
          <Button type='link'>{$t({ defaultMessage: 'Add Floor Plan' })}</Button>
        </Empty>
      }
    </Loader>
  )
}