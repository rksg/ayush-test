import { useEffect } from 'react'

import { Col, Row } from 'antd'

import { Loader }  from '@acx-ui/components'
import {
  CageDetailPageHeader,
  CageDetailsProvider,
  EditOntDrawer,
  OntDetailsDrawer,
  OntInfoHeader,
  OntInfoWidget,
  OntTable,
  OntTabs,
  useCageDetails
} from '@acx-ui/olt/components'
import {
  Olt,
  OltCage,
  OltOnt,
  OltMockdata
} from '@acx-ui/olt/utils'
import { useParams } from '@acx-ui/react-router-dom'

const { oltData, oltCageList, ontData } = OltMockdata

const CageDetailsContent = () => {
  const { state, dispatch } = useCageDetails()
  const portDetails = state.selectedOnt?.portDetails
  const clientDetails = state.selectedOnt?.clientDetails

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // TODO: check with UX
  // useEffect(() => {
  //   return () => {
  //     dispatch({ type: 'CLOSE_ALL_DRAWERS' })
  //   }
  // }, [state.selectedOnt])

  return (
    <Row wrap={false}>
      <Col flex='250px' style={{ marginRight: '20px' }}>
        <Loader
          // states={[{ isLoading, isFetching }]}
          style={{ minHeight: '100px', backgroundColor: 'transparent' }}
        >
          <OntTable
            data={ontData as OltOnt[]}
            selectedOnt={state.selectedOnt}
            setSelectedOnt={(ont) => dispatch({ type: 'SET_SELECTED_ONT', payload: ont })}
          />
        </Loader>
      </Col>
      <Col flex='auto'>
        { state.selectedOnt && <>
          <OntInfoHeader
            ontDetails={state.selectedOnt}
            dispatch={dispatch}
          />
          <OntInfoWidget
            ontDetails={state.selectedOnt}
            isLoading={false}
            isFetching={false}
          />
          <OntTabs
            clientDetails={clientDetails}
            portDetails={portDetails}
          />
          <OntDetailsDrawer
            ontDetails={state.selectedOnt}
            visible={state.drawers.ontDetails}
            onClose={() => dispatch({ type: 'CLOSE_DRAWER', payload: 'ontDetails' })}
          />
          <EditOntDrawer
            visible={state.drawers.editOnt}
            onClose={() => dispatch({ type: 'CLOSE_DRAWER', payload: 'editOnt' })}
          />
        </>}
      </Col>
    </Row>
  )
}

export const CageDetails = () => {
  const { activeTab } = useParams()
  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready
  const cageDetails = oltCageList[3] as OltCage

  return (
    <CageDetailsProvider
      cageDetails={cageDetails}
      initialTab={activeTab}
    >
      <CageDetailPageHeader
        oltDetails={oltDetails}
        cageDetails={cageDetails}
      />
      <CageDetailsContent />
    </CageDetailsProvider>
  )
}
