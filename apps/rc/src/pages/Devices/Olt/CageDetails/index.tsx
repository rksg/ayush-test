import { Button, Col, Row } from 'antd'
import { useIntl }          from 'react-intl'
import { useParams }        from 'react-router-dom'

import { Tabs, Loader } from '@acx-ui/components'
import {
  EditOntDrawer,
  OntDetailsDrawer,
  OntInfoWidget,
  OntTable
}    from '@acx-ui/olt/components'
import { Olt, OltCage, OltOnt } from '@acx-ui/olt/utils'
import { noDataDisplay }        from '@acx-ui/utils'

import { oltData, oltCageList, ontData } from '../mockdata'

import { CageDetailPageHeader } from './CageDetailPageHeader'
import {
  CageDetailsProvider,
  useCageDetails
}   from './cageDetailsState'
import { OntClientTab }   from './OntClientTab'
import { OntOverviewTab } from './OntOverviewTab'
import { OntPortTab }     from './OntPortTab'
import * as UI            from './styledComponents'

enum OverviewInfoType {
  PANEL = 'Panel',
  PORTS = 'Ports',
  CLIENTS = 'Clients'
}

const CageDetailsContent = () => {
  const { $t } = useIntl()
  const { activeSubTab } = useParams()
  const { state, dispatch } = useCageDetails()

  const handleTabChange = (val: string) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: val })
  }

  const tabs = [{
    label: $t({ defaultMessage: 'Panel' }),
    value: OverviewInfoType.PANEL,
    children: <OntOverviewTab />
  }, {
    label: $t({ defaultMessage: 'Ports' }),
    value: OverviewInfoType.PORTS,
    children: <OntPortTab data={state.selectedOnt?.portDetails} />
  }, {
    label: $t({ defaultMessage: 'Clients ({count})' }, { count: 10 }),
    value: OverviewInfoType.CLIENTS,
    children: <OntClientTab />
  }]

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

          <Tabs type='line'
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