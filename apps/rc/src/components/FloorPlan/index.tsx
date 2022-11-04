import { useEffect, useState } from 'react'

import { Empty, Space }   from 'antd'
import { clone, isEmpty } from 'lodash'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Button, Loader, showActionModal }                                                                        from '@acx-ui/components'
import { BulbOutlined }                                                                                           from '@acx-ui/icons'
import { useAddFloorPlanMutation, useDeleteFloorPlanMutation, useFloorPlanListQuery, useUpdateFloorPlanMutation } from '@acx-ui/rc/services'
import { FloorPlanDto, FloorPlanFormDto }                                                                         from '@acx-ui/rc/utils'

import AddEditFloorplanModal from './FloorPlanModal'
import GalleryView           from './GalleryView/GalleryView'
import PlainView             from './PlainView/PlainView'
import * as UI               from './styledComponents'

export function sortByFloorNumber (floor1: FloorPlanDto, floor2: FloorPlanDto) {
  if (floor1.floorNumber < floor2.floorNumber) {
    return -1
  }
  if (floor1.floorNumber > floor2.floorNumber) {
    return 1
  }
  return 0
}

export default function FloorPlan () {
  const params = useParams()
  const floorPlanQuery = useFloorPlanListQuery({ params })
  const { $t } = useIntl()
  const [showGalleryView, setShowGalleryView] = useState(false)

  const [floorPlans, setFloorPlans] = useState<FloorPlanDto[]>()
  const [selectedFloorPlan, setSelectedFloorPlan] = useState({} as FloorPlanDto)
  const [updatedFloorPlanName, setUpdatedFloorPlanName] = useState<string>()

  useEffect(() => {
    setFloorPlans([])
    if(floorPlanQuery?.data){
      const queryData: FloorPlanDto[] = clone(floorPlanQuery?.data)
      queryData.sort(sortByFloorNumber)
      const _selectedFP = updatedFloorPlanName ?
        queryData.filter((floor) => floor.name === updatedFloorPlanName)[0]
        : queryData[0]

      setTimeout(() => {
        setFloorPlans(queryData)
        setSelectedFloorPlan(_selectedFP)
      }, 200)
    }
  }, [floorPlanQuery?.data])

  const [
    deleteFloorPlan,
    { isLoading: isDeleteFloorPlanUpdating }
  ] = useDeleteFloorPlanMutation()

  const [
    addFloorPlan,
    { isLoading: isAddFloorPlanUpdating }
  ] = useAddFloorPlanMutation()

  const [
    updateFloorPlan,
    { isLoading: isUpdateFloorPlanUpdating }
  ] = useUpdateFloorPlanMutation()

  const galleryViewHandler = () => {
    setShowGalleryView(true)
  }

  const onFloorPlanClick = (selectedFloorPlan: FloorPlanDto) => {
    setSelectedFloorPlan(selectedFloorPlan)
    setShowGalleryView(false)
  }

  const onDeleteFloorPlan = (floorPlanId: string, floorPlanName: string) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Floor Plan' }),
        entityValue: floorPlanName
      },
      onOk: () => deleteFloorPlan({ params: { ...params, floorPlanId } })
    })
  }

  const onAddEditFloorPlan = async (floorPlan: FloorPlanFormDto, isEditMode: boolean) => {

    setUpdatedFloorPlanName(floorPlan.name)

    isEditMode ?
      updateFloorPlan({ params: { ...params, floorPlanId: floorPlan.id } , payload: floorPlan })
      : addFloorPlan({ params: { ...params } , payload: floorPlan })
  }

  return (
    <Loader states={[floorPlanQuery,
      { isLoading: false, isFetching: isDeleteFloorPlanUpdating },
      { isLoading: false, isFetching: isAddFloorPlanUpdating },
      { isLoading: false, isFetching: isUpdateFloorPlanUpdating }
    ]}>
      {floorPlans?.length ?
        <UI.FloorPlanContainer>
          { showGalleryView ?
            <GalleryView floorPlans={floorPlans ?? []} onFloorPlanClick={onFloorPlanClick}/>
            : <PlainView
              floorPlans={floorPlans ?? []}
              toggleGalleryView={galleryViewHandler}
              defaultFloorPlan={!isEmpty(selectedFloorPlan) ? selectedFloorPlan : floorPlans[0]}
              deleteFloorPlan={onDeleteFloorPlan}
              onAddEditFloorPlan={onAddEditFloorPlan}/>
          }
          <UI.StyledSpace size={24}>
            <AddEditFloorplanModal
              buttonTitle={$t({ defaultMessage: '+ Add Floor Plan' })}
              onAddEditFloorPlan={onAddEditFloorPlan}
              isEditMode={false}/>
            <Button size='small' type='link'>
              {$t({ defaultMessage: 'Unplaced Devices (0)' })}
            </Button>
          </UI.StyledSpace>
        </UI.FloorPlanContainer>
        :
        <UI.EpmtyFloorplanContainer>
          <Empty description={
            <Space><BulbOutlined />
              {$t({
                defaultMessage:
                // eslint-disable-next-line max-len
                'You can place your devices on floor plans or map to view their geographical distribution'
              })}
            </Space>}>
          </Empty>
          <AddEditFloorplanModal
            buttonTitle={$t({ defaultMessage: 'Add Floor Plan' })}
            onAddEditFloorPlan={onAddEditFloorPlan}
            isEditMode={false}/>
        </UI.EpmtyFloorplanContainer>
      }
    </Loader>
  )
}
