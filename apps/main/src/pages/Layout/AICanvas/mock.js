export default [
  {
    id: 'a1',
    type: 'section',
    hasTab: false,
    groups: [{
      id: 0,
      sectionId: 'a1',
      type: 'group',
      cards: [
        {
          id: 0,
          gridx: 0,
          gridy: 0,
          width: 1,
          height: 4,
          type: 'card',
          isShadow: false,
          widgetType: '2-AlarmWidget',
          currentSizeIndex: 0,
          sizes: [
            {
              width: 1,
              height: 4
            },
            {
              width: 2,
              height: 6
            },
            {
              width: 4,
              height: 9
            }
          ]
        },
        {
          id: 102,
          gridx: 1,
          gridy: 0,
          width: 1,
          height: 6,
          type: 'card',
          isShadow: false,
          widgetType: '3-VenuesDashboardWidgetV2'
        },
        {
          id: 100,
          gridx: 2,
          gridy: 0,
          width: 1,
          height: 4,
          type: 'card',
          isShadow: false,
          widgetType: '3-SwitchesTrafficByVolume'
        }
      ]
    }]
  }
  // {
  //   id: 'a2',
  //   type: 'section',
  //   hasTab: true,
  //   groups: [
  //     {
  //       id: 1,
  //       sectionId: 'a2',
  //       type: 'group',
  //       tabLabel: 'Wi-Fi',
  //       tabValue: 'ap',
  //       defaultTab: true,
  //       cards: [
  //         {
  //           id: 101,
  //           gridx: 0,
  //           gridy: 0,
  //           width: 2,
  //           height: 5,
  //           type: 'card',
  //           isShadow: false,
  //           widgetType: '4-MapWidget'
  //         }
  //       ]
  //     },
  //     {
  //       id: 2,
  //       sectionId: 'a2',
  //       type: 'group',
  //       tabLabel: 'Switch',
  //       tabValue: 'switch',
  //       defaultTab: false,
  //       cards: [
  //         {
  //           id: 104,
  //           gridx: 0,
  //           gridy: 0,
  //           width: 1,
  //           height: 5,
  //           type: 'card',
  //           isShadow: false,
  //           widgetType: '4-MapWidget'
  //         }
  //       ]
  //     }
  //   ]
  // }
]