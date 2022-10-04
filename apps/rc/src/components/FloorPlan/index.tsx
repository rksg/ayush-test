import { useEffect, useState } from 'react'

import { Empty, Space } from 'antd'
import { isEmpty }      from 'lodash'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Button, Loader, showActionModal }                   from '@acx-ui/components'
import { BulbOutlined }                                      from '@acx-ui/icons'
import { useDeleteFloorPlanMutation, useFloorPlanListQuery } from '@acx-ui/rc/services'
import { FloorPlanDto }                                      from '@acx-ui/rc/utils'

import GalleryView from './GalleryView/GalleryView'
import PlainView   from './PlainView/PlainView'
import * as UI     from './styledComponents'


export default function FloorPlan () {
  const params = useParams()
  const floorPlanQuery = useFloorPlanListQuery({ params })
  const { $t } = useIntl()
  const [showGalleryView, setShowGalleryView] = useState(false)

  const [floorPlans, setFloorPlans] = useState<FloorPlanDto[]>()
  const [selectedFloorPlan, setSelectedFloorPlan] = useState({} as FloorPlanDto)
  
  useEffect(() => {
    setFloorPlans([])
    if(floorPlanQuery?.data){
      setFloorPlans(floorPlanQuery?.data)
      setSelectedFloorPlan(floorPlanQuery?.data[0])
    }
  }, [floorPlanQuery?.data])

  const [
    deleteFloorPlan,
    { isLoading: isDeleteFloorPlanUpdating }
  ] = useDeleteFloorPlanMutation()

  const expandClickHandler = () => {
    // TODO: Expand to Fullscreen
  }

  const galleryViewHandler = () => {
    setShowGalleryView(true)
  }

  const onFloorPlanClick = (selectedFloorPlan: FloorPlanDto) => {
    setSelectedFloorPlan(selectedFloorPlan)
    setShowGalleryView(false)
  }

  const onDeleteFloorPlan = (floorPlanId: string) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Floor Plan' }),
        entityValue: 'test'+floorPlanId
      },
      onOk: () => deleteFloorPlan({ params: { ...params, floorPlanId } })
        .then((res) => {
          // TODO:
        })
    })
  }

  return (
    <Loader states={[floorPlanQuery,
      { isLoading: false, isFetching: isDeleteFloorPlanUpdating }]}>
      {floorPlans?.length ?
        <UI.FloorPlanContainer>
          { showGalleryView ?
            <GalleryView floorPlans={floorPlans ?? []} onFloorPlanClick={onFloorPlanClick}/>
            : <PlainView
              floorPlans={floorPlans ?? []}
              toggleGalleryView={galleryViewHandler}
              defaultFloorPlan={!isEmpty(selectedFloorPlan) ? selectedFloorPlan : floorPlans[0]}
              deleteFloorPlan={onDeleteFloorPlan}/>
          }
          <UI.StyledSpace size={24}>
            <Button size='small' type='link'>{$t({ defaultMessage: '+ Add Floor Plan' })}</Button>
            <Button size='small' type='link'>
              {$t({ defaultMessage: 'Unplaced Devices (0)' })}
            </Button>
            <UI.Button
              type='default'
              data-testid='expandIcon'
              key={'expand-btn'}
              title={$t({ defaultMessage: 'Expand' })}
              icon={<UI.ArrowOutIcon />}
              onClick={expandClickHandler}
            />
          </UI.StyledSpace>
        </UI.FloorPlanContainer>
        :
        <Empty description={
          <Space><BulbOutlined />
            {$t({
              defaultMessage:
                'You can place your devices on floor plans or map to view their geographical distribution'
            })}
          </Space>}>
          <Button type='link'>{$t({ defaultMessage: 'Add Floor Plan' })}</Button>
        </Empty>
      }
    </Loader>
  )
}