import { useEffect, useMemo, useState } from 'react'

import { Image, Space } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, SummaryCard }    from '@acx-ui/components'
import { loadResidentPortalFavIcon, loadResidentPortalLogo, isValidColorHex } from '@acx-ui/rc/components'
import { useGetResidentPortalQuery }                                          from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'


import ColorBoxIcon              from './ColorBoxIcon'
import ResidentPortalVenuesTable from './ResidentPortalVenuesTable'

export default function ResidentPortalDetail () {
  const params = useParams()
  const { $t } = useIntl()
  const { data: residentPortalData, isLoading } = useGetResidentPortalQuery({ params })

  const [logoImage, setLogoImageString] = useState<string>('')
  const [maxLogoSize, setMaxLogoSize] = useState<number>(100)
  const [favIconImage, setFavIconImageString] = useState<string>('')

  // Determine Color Scheme Colors
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

      colors.mainColor =
        customColors.mainColor && isValidColorHex(customColors.mainColor)
          ? customColors.mainColor : colors.mainColor
      colors.accentColor =
          customColors.accentColor && isValidColorHex(customColors.accentColor)
            ? customColors.accentColor : colors.accentColor
      colors.separatorColor =
          customColors.separatorColor && isValidColorHex(customColors.separatorColor)
            ? customColors.separatorColor : colors.separatorColor
      colors.textColor =
          customColors.textColor && isValidColorHex(customColors.textColor)
            ? customColors.textColor : colors.textColor
    }

    return colors

  }, [residentPortalData])

  // Load Logo and FavIcon
  useEffect(() => {
    const fetchLogo = async () => {
      loadResidentPortalLogo(params)
        .then((base64String) => {
          if(base64String && base64String !== 'data:') {
            setLogoImageString(base64String)
            setMaxLogoSize(250)
          }})
        .catch(() => {
          setLogoImageString('')
          setMaxLogoSize(100) })

      loadResidentPortalFavIcon(params)
        .then((base64String) => {
          if(base64String && base64String !== 'data:') {
            setFavIconImageString(base64String)
          }})
        .catch(() => { setFavIconImageString('') })
    }

    fetchLogo()
  }, [residentPortalData, params])

  const residentPortalInfo = [
    {
      title: $t({ defaultMessage: 'Title' }),
      content: residentPortalData?.uiConfiguration?.text.title
    },
    {
      title: $t({ defaultMessage: 'Subtitle' }),
      content: residentPortalData?.uiConfiguration?.text.subTitle
    },
    {
      title: $t({ defaultMessage: 'Login Text' }),
      content: residentPortalData?.uiConfiguration?.text.loginText
    },
    {
      title: $t({ defaultMessage: 'Announcements' }),
      content: residentPortalData?.uiConfiguration?.text.announcements
    },
    {
      title: $t({ defaultMessage: 'Help Text' }),
      content: residentPortalData?.uiConfiguration?.text.helpText
    },
    {
      title: $t({ defaultMessage: 'Allow Residents to Set Passphrase' }),
      content: residentPortalData?.uiConfiguration?.access?.tenantSetDpsk ?
        $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
    },
    {
      title: $t({ defaultMessage: 'Color Scheme' }),
      content: <Space>
        <ColorBoxIcon style={{ color: mainColor }} />
        <ColorBoxIcon style={{ color: accentColor }} />
        <ColorBoxIcon style={{ color: separatorColor }} />
        <ColorBoxIcon style={{ color: textColor }} />
      </Space>
    },
    {
      title: $t({ defaultMessage: 'Logo' }),
      content: (logoImage) ?
        <Image
          style={{ maxHeight: maxLogoSize, maxWidth: maxLogoSize }}
          alt={residentPortalData?.uiConfiguration?.files?.logoFileName ?
            $t({ defaultMessage: 'Logo: {imageName}' },
              { imageName: residentPortalData?.uiConfiguration?.files?.logoFileName })
            : $t({ defaultMessage: 'Resident Portal Logo' })}
          src={`${logoImage}`} />
        : $t({ defaultMessage: 'No Custom Image Set' })
    },
    {
      title: $t({ defaultMessage: 'Favicon' }),
      content: favIconImage ?
        <Image
          style={{ maxHeight: 100, maxWidth: 100 }}
          alt={residentPortalData?.uiConfiguration?.files?.favIconFileName ?
            $t({ defaultMessage: 'Favicon: {imageName}' },
              { imageName:
            residentPortalData?.uiConfiguration?.files?.favIconFileName })
            : $t({ defaultMessage: 'Resident Portal Favicon' })}
          src={favIconImage}/>
        : $t({ defaultMessage: 'No Custom Image Set' })
    }
  ]

  return (
    <>
      <PageHeader
        title={residentPortalData?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Resident Portals' }),
            link: getServiceRoutePath({
              type: ServiceType.RESIDENT_PORTAL,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
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
        <GridRow>
          <GridCol col={{ span: 24 }}>
            <SummaryCard data={residentPortalInfo} colPerRow={3} />
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
