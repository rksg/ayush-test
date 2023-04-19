import { useIntl }         from 'react-intl'
import { useParams } from 'react-router-dom'

import { Avatar, Space, Typography } from 'antd'
import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { useGetResidentPortalQuery }                          from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink, useNavigate } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'
import ColorBoxIcon from './ColorBoxIcon';
import { useMemo } from 'react'
import ResidentPortalVenuesTable from './ResidentPortalVenuesTable'

export default function ResidentPortalDetail () {
  const params = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { data: residentPortalData, isLoading } = useGetResidentPortalQuery({ params })

  const { mainColor, accentColor, separatorColor, textColor } = useMemo(() => {
    // Default Ruckus colors 
    // -- keep this up to date with the default colors used in the resident portal UI
    let colors = {
      mainColor: '#101820',
      accentColor: '#E57200',
      separatorColor: '#D9D9D6',
      textColor: '#54585A'
    }

    if (residentPortalData 
      && residentPortalData.uiConfiguration 
      && residentPortalData.uiConfiguration.color) {
        const customColors = residentPortalData.uiConfiguration.color

        colors.mainColor = customColors.mainColor ? customColors.mainColor : colors.mainColor
        colors.accentColor = customColors.accentColor ? customColors.accentColor : colors.accentColor
        colors.separatorColor = customColors.separatorColor ? customColors.separatorColor : colors.separatorColor
        colors.textColor = customColors.textColor ? customColors.textColor : colors.textColor
    }

    return colors

  }, [residentPortalData])

  return (
    <>
      <PageHeader
        title={residentPortalData?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: getServiceRoutePath({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.RESIDENT_PORTAL,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        { isFetching: isLoading, isLoading: false }
      ]}>
        {/* <Space direction='vertical' size={30}> */}
        <GridRow>
          <GridCol col={{ span: 24 }}>
            <Card>
            {/* <UI.InfoMargin> */}
              <GridRow>
                <GridCol col={{ span: 6 }}>
                  {/* <Space direction='vertical' size={10}> */}
                    <Card.Title>
                      {$t({ defaultMessage: 'Title' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      {/* TODO: Error Handling */}
                      {residentPortalData?.uiConfiguration?.text.title}
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
                <GridCol col={{ span: 6 }}>
                  {/* <Space direction='vertical' size={10}> */}
                    <Card.Title>
                      {$t({ defaultMessage: 'Subtitle' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      {/* TODO: Error Handling */}
                      {residentPortalData?.uiConfiguration?.text.subTitle}
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
                <GridCol col={{ span: 6 }}>
                  {/* <Space direction='vertical' size={10}> */}
                    <Card.Title>
                      {$t({ defaultMessage: 'Login Text' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      {/* TODO: Error Handling */}
                      {residentPortalData?.uiConfiguration?.text.loginText}
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol col={{ span: 6 }}>
                  {/* <Space direction='vertical' size={10}> */}
                    <Card.Title>
                      {$t({ defaultMessage: 'Annoucements' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      {/* TODO: Error Handling */}
                      {residentPortalData?.uiConfiguration?.text.announcements}
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
                <GridCol col={{ span: 6 }}>
                  {/* <Space direction='vertical' size={10}> */}
                    <Card.Title>
                      {$t({ defaultMessage: 'Help Text' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      {/* TODO: Error Handling */}
                      {residentPortalData?.uiConfiguration?.text.helpText}
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol col={{ span: 6 }}>
                    <Card.Title>
                      {$t({ defaultMessage: 'Color Scheme' })}
                    </Card.Title>
                    <Typography.Paragraph>
                      <Space>
                        <ColorBoxIcon style={{color: mainColor}} />
                        <ColorBoxIcon style={{color: accentColor}} />
                        <ColorBoxIcon style={{color: separatorColor}} />
                        <ColorBoxIcon style={{color: textColor}} />
                      </Space>
                    </Typography.Paragraph>
                  {/* </Space> */}
                </GridCol>
              </GridRow>
            {/* </UI.InfoMargin> */}
          </Card>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <Card>
            <ResidentPortalVenuesTable />
          </Card>
      </GridCol>
      </GridRow>      
      </Loader>
    </>
  )
}
