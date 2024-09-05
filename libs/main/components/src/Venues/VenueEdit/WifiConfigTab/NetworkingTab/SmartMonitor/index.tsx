import { useContext, useEffect } from 'react';

import { Form, InputNumber, Space, Switch } from 'antd';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { AnchorContext, Loader, StepsForm, Tooltip } from '@acx-ui/components';
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle';
import {
  useGetVenueApSmartMonitorQuery,
  useLazyGetVenueApSmartMonitorQuery,
  useUpdateVenueApSmartMonitorMutation,
} from '@acx-ui/rc/services';
import { VenueApSmartMonitor, useConfigTemplate } from '@acx-ui/rc/utils';

import { VenueEditContext } from '../../..';
import { QuestionMarkCircleOutlined } from '@acx-ui/icons';

const { useWatch } = Form;

export function SmartMonitor() {
  const { $t } = useIntl();
  const { venueId } = useParams();
  const { isTemplate } = useConfigTemplate();
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API);
  
  const isConfigTemplateRbacEnabled = useIsSplitOn(
    Features.RBAC_CONFIG_TEMPLATE_TOGGLE
  );
  const resolvedRbacEnabled = isTemplate
    ? isConfigTemplateRbacEnabled
    : isUseRbacApi;

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData,
  } = useContext(VenueEditContext);
  const { setReadyToScroll } = useContext(AnchorContext);

  const form = Form.useFormInstance();

  const [
    updateVenueApSmartMonitor,
    { isLoading: isUpdatingVenueApSmartMonitor },
  ] = useUpdateVenueApSmartMonitorMutation();
  // eslint-disable-next-line max-len
  console.log(venueId)
  const venueApSmartMonitor =
  useGetVenueApSmartMonitorQuery({
      param: { venueId },
      enableRbac: isUseRbacApi,
    },{ skip: !venueId });

console.log(venueApSmartMonitor)
  const overrideEnabled = useWatch<boolean>('overrideEnabled');

  useEffect(() => {
    const venueApSmartMonitorData = venueApSmartMonitor;
    if (venueApSmartMonitorData) {
      form.setFieldsValue(venueApSmartMonitorData);

      setReadyToScroll?.((r) => [...new Set(r.concat('Smart-Monitor'))]);
    }
  }, [form, venueApSmartMonitor, setReadyToScroll]);

  const handleUpdateSmartMonitor = async () => {
    try {
      const formData = form.getFieldsValue();
      let payload: VenueApSmartMonitor = {
        smartMonitorEnabled: formData.smartMonitorEnabled,
        smartMonitorInterval: formData.smartMonitorInterval,
        smartMonitorThreshold: formData.smartMonitorThreshold,
      };

      await updateVenueApSmartMonitor({
        params: { venueId },
        payload: payload,
        enableRbac: isUseRbacApi,
      }).unwrap();
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  };

  const handleChanged = () => {
    setEditContextData &&
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: true,
      });

    setEditNetworkingContextData &&
      setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateSmartMonitor: handleUpdateSmartMonitor,
      });
  };

  const fieldDataKey = ['wlan', 'advancedCustomization', 'smartMonitor'];

  const smartMonitorEnabledFieldName = [...fieldDataKey, 'smartMonitorEnabled'];
  const smartMonitorIntervalFieldName = [
    ...fieldDataKey,
    'smartMonitorInterval',
  ];
  const smartMonitorThresholdFieldName = [
    ...fieldDataKey,
    'smartMonitorThreshold',
  ];

  return (
    <Loader
      states={[
        {
          isLoading: true,
          isFetching: true,
          // isLoading: venueApSmartMonitor ? true : false,
          // isFetching: isUpdatingVenueApSmartMonitor,
        },
      ]}
    >
      <StepsForm.FieldLabel width={'280px'}>
        {$t({ defaultMessage: 'Smart Monitor' })}
        <>
          {$t({ defaultMessage: 'Smart Monitor' })}
          <Tooltip
            title={$t({
              defaultMessage:
                'Enabling this feature will automatically disable WLANs if the default gateway of the access point is unreachable',
            })}
            placement="top"
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>
        <Form.Item
          name={smartMonitorEnabledFieldName}
          valuePropName={'checked'}
          initialValue={false}
          children={<Switch onChange={handleChanged} />}
        />
      </StepsForm.FieldLabel>
      {overrideEnabled && (
        <Space size={30}>
          <Form.Item
            required
            label={$t({ defaultMessage: 'Heartbeat Interval' })}
          >
            <Space align="center">
              <Form.Item
                noStyle
                name={smartMonitorIntervalFieldName}
                initialValue={3}
                rules={[
                  {
                    required: true,
                    message: $t({
                      defaultMessage: 'Please enter a number between 5 and 60',
                    }),
                  },
                ]}
                children={
                  <InputNumber
                    min={5}
                    max={60}
                    style={{ width: '75px' }}
                    onChange={handleChanged}
                  />
                }
              />
              <div>{$t({ defaultMessage: 'Seconds' })}</div>
            </Space>
          </Form.Item>
          <Form.Item required label={$t({ defaultMessage: 'Max Retries' })}>
            <Space align="center">
              <Form.Item
                noStyle
                name={smartMonitorThresholdFieldName}
                initialValue={3}
                rules={[
                  {
                    required: true,
                    message: $t({
                      defaultMessage: 'Please enter a number between 1 and 10',
                    }),
                  },
                ]}
                children={
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ width: '75px' }}
                    onChange={handleChanged}
                  />
                }
              />
              <div>{$t({ defaultMessage: 'Retries' })}</div>
            </Space>
          </Form.Item>
        </Space>
      )}
    </Loader>
  );
}
