// import { useEffect } from 'react'

import { Button, Col, Row } from 'antd'
import { useIntl }          from 'react-intl'
import { useParams }        from 'react-router-dom'

import { Tabs, Loader } from '@acx-ui/components'
import {
  CageDetailPageHeader,
  CageDetailsProvider,
  EditOntDrawer,
  OntClientTab,
  OntOverviewTab,
  OntPortTab,
  OntDetailsDrawer,
  OntInfoWidget,
  OntTable,
  useCageDetails
}    from '@acx-ui/olt/components'
import {
  CageDetailsTabType,
  Olt,
  OltCage,
  OltOnt,
  OltMockdata
} from '@acx-ui/olt/utils'
import { noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

const { oltData, oltCageList, ontData } = OltMockdata

const CageDetailsContent = () => {
  const { $t } = useIntl()
  const { activeSubTab } = useParams()
  const { state, dispatch } = useCageDetails()
  const portDetails = state.selectedOnt?.portDetails
  const clientDetails = state.selectedOnt?.clientDetails

  const handleTabChange = (val: string) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: val })
  }

  const tabs = [{
    label: $t({ defaultMessage: 'Panel' }),
    value: CageDetailsTabType.PANEL,
    children: <OntOverviewTab data={portDetails} />
  }, {
    label: $t({ defaultMessage: 'Ports' }),
    value: CageDetailsTabType.PORTS,
    children: <OntPortTab data={portDetails} />
  }, {
    label: $t({ defaultMessage: 'Clients ({count})' }, { count: clientDetails?.length || 0 }),
    value: CageDetailsTabType.CLIENTS,
    children: <OntClientTab data={clientDetails} />
  }]

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
          <UI.OntHeader>
            <UI.OntHeaderContent>
              <UI.OntTitle>{ state.selectedOnt?.name }</UI.OntTitle>
              <UI.OntInfo>
                { $t({ defaultMessage: 'Model' })}:
                { state.selectedOnt?.model || noDataDisplay }
                { $t({ defaultMessage: 'Profile' })}:
                { state.selectedOnt?.profileName || noDataDisplay }
              </UI.OntInfo>
            </UI.OntHeaderContent>
            <UI.ActionButtons>
              <Button
                type='link'
                size='small'
                onClick={() => dispatch({ type: 'OPEN_DRAWER', payload: 'editOnt' })}>
                {$t({ defaultMessage: 'Edit ONT' })}
              </Button>
              <Button
                type='link'
                size='small'
                onClick={() => dispatch({ type: 'OPEN_DRAWER', payload: 'ontDetails' })}>
                {$t({ defaultMessage: 'ONT Details' })}
              </Button>
              <OntDetailsDrawer
                ontDetails={state.selectedOnt}
                visible={state.drawers.ontDetails}
                onClose={() => dispatch({ type: 'CLOSE_DRAWER', payload: 'ontDetails' })}
              />
              <EditOntDrawer
                visible={state.drawers.editOnt}
                onClose={() => dispatch({ type: 'CLOSE_DRAWER', payload: 'editOnt' })}
              />
            </UI.ActionButtons>
          </UI.OntHeader>

          <OntInfoWidget
            ontDetails={state.selectedOnt}
            isLoading={false}
            isFetching={false}
          />

          <Tabs
            type='line'
            activeKey={state.currentTab}
            defaultActiveKey={activeSubTab || tabs[0].value}
            onChange={handleTabChange}
          >
            {tabs.map((tab) => (
              <Tabs.TabPane
                tab={tab.label}
                key={tab.value}
              >
                <Loader
                  // states={[{ isLoading: isCagesLoading, isFetching: isCagesFetching }]}
                  style={{ minHeight: '100px' }}
                >
                  {tab.children}
                </Loader>
              </Tabs.TabPane>
            ))}
          </Tabs>

        </>}
      </Col>
    </Row>
  )
}

export const CageDetails = () => {
  const { activeSubTab } = useParams()
  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready
  const cageDetails = oltCageList[3] as OltCage

  return (
    <CageDetailsProvider
      cageDetails={cageDetails}
      initialTab={activeSubTab}
    >
      <CageDetailPageHeader
        oltDetails={oltDetails}
        cageDetails={cageDetails}
      />
      <CageDetailsContent />
    </CageDetailsProvider>
  )
}