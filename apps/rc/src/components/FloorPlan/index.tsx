import { useState } from 'react'

import { Empty, Space } from 'antd'
import { isEmpty }      from 'lodash'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Button, Loader }        from '@acx-ui/components'
import { BulbOutlined }          from '@acx-ui/icons'
import { useFloorPlanListQuery } from '@acx-ui/rc/services'
import { FloorPlanDto }          from '@acx-ui/rc/utils'

import GalleryView from './GalleryView/GalleryView'
import PlainView   from './PlainView/PlainView'
import * as UI     from './styledComponents'


export default function FloorPlan () {
  const params = useParams()
  const responseData = useFloorPlanListQuery({ params })
  const { $t } = useIntl()
  const [showGalleryView, setShowGalleryView] = useState(false)

  const floorPlans = responseData?.data
  const [selectedFloorPlan, setSelectedFloorPlan] = useState({} as FloorPlanDto)

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

  return (
    <Loader states={[responseData]}>
      {floorPlans?.length ?
        <>
          { showGalleryView ?
            <GalleryView floorPlans={floorPlans ?? []} onFloorPlanClick={onFloorPlanClick}/>
            : <PlainView
              floorPlans={floorPlans ?? []}
              toggleGalleryView={galleryViewHandler}
              defaultFloorPlan={!isEmpty(selectedFloorPlan) ? selectedFloorPlan : floorPlans[0]}/>
          }
          <UI.StyledSpace size={24}>
            <Button size='small' type='link'>{$t({ defaultMessage: '+ Add Floor Plan' })}</Button>
            <Button size='small' type='link'>
              {$t({ defaultMessage: 'Unplaced Devices (0)' })}
            </Button>
            <UI.Button
              data-testid='expandIcon'
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
            <span id='noFloorPlansTemplate'>
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