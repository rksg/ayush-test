/* eslint-disable max-len */
import { Button, cssStr, Modal, Subtitle } from '@acx-ui/components'
import { getIntl }                         from '@acx-ui/utils'

import * as UI from './styledComponents'
export function SwitchRequirementsModal (props: {
    modalVisible: boolean
    setModalVisible: (visible: boolean) => void,
}) {
  const { $t } = getIntl()
  const onClose = () => {
    props.setModalVisible(false)
  }
  const switchImgUrl = 'https://support.ruckuswireless.com/software_terms_and_conditions/3657-ruckus-icx-fastiron-09-0-10f-ga-software-release-zip'
  const usbUpgradeVedioUrl = 'https://www.youtube.com/watch?v=wDdeUBzwfNI'
  const upgradeProcessUrl = 'https://docs.commscope.com/bundle/fastiron-09010-upgradeguide/page/GUID-C8148B03-D98C-4F4D-939C-9111CECB0601.html'
  const imageDownloadUseUsb = 'https://docs.commscope.com/bundle/fastiron-09010-upgradeguide/page/GUID-6848A0EE-1480-4A6A-9A99-08DD64F969DF.html'
  const firmwareVersion = '09.0.10f'

  return (

    <Modal
      width={760}
      title={$t({ defaultMessage: 'Add Switch: Hardware & Configuration Requirements' })}
      visible={props.modalVisible}
      okText={$t({ defaultMessage: 'Generate' })}
      destroyOnClose={true}
      onCancel={onClose}
      footer={[
        <Button
          style={{ width: '83px' }}
          key='okBtn'
          type='primary'
          onClick={onClose}
        >
          {$t({ defaultMessage: 'OK' })}
        </Button>
      ]}
    >
      <Subtitle level={4}>
        {$t({ defaultMessage: 'Upgrading the switch' })}</Subtitle>
      <body>
        {$t({ defaultMessage: 'For switches that do not have a ‘cloud ready label’ or switches running version older than FastIron 08.0.90d, use one of the following methods to upgrade the switches to {firmwareVersion} ( UFI router image for factory default switches).' }, { firmwareVersion })}
        <UI.List>
          <UI.ListItems>
            {$t({ defaultMessage: 'Download FastIron {firmwareVersion} firmware (use UFI router image) from the following link:' }, { firmwareVersion })}
            <br />
            <a target='_blank'
              href={switchImgUrl}
              rel='noreferrer'> { switchImgUrl } </a>
          </UI.ListItems>

          <UI.ListItems>
            {$t({ defaultMessage: 'For a USB upgrade, use the procedure outlined at one of the following links:' })}
            <br />
            <a target='_blank'
              href={usbUpgradeVedioUrl}
              rel='noreferrer'> {usbUpgradeVedioUrl} {$t({ defaultMessage: '(video)' })}</a>
          </UI.ListItems>



          <UI.ListItems>
            <a target='_blank'
              href={imageDownloadUseUsb}
              rel='noreferrer'> {$t({ defaultMessage: 'Image Download Using USB ' })}</a>
              &nbsp;
            {$t({ defaultMessage: 'from the RUCKUS FastIron Software Upgrade Guide.' })}
          </UI.ListItems>


          <UI.ListItems>
            {$t({ defaultMessage: 'For a TFTP upgrade, follow the procedure outlined in the ' })}
            <a target='_blank'
              href={upgradeProcessUrl}
              rel='noreferrer'> {$t({ defaultMessage: 'Upgrade Process' })} </a>
            {$t({ defaultMessage: ' from the RUCKUS FastIron Software Upgrade Guide.' })}
          </UI.ListItems>
        </UI.List>
      </body>

      <Subtitle level={5}>
        {$t({ defaultMessage: 'Steps' })}
      </Subtitle>
      <body>
        <UI.OrderList>
          <UI.ListItems>
            {$t({ defaultMessage: 'Check the current running version via switch CLI using the ‘Show version’ command.' })}
          </UI.ListItems>
          <UI.ListItems>
            {$t({ defaultMessage: 'Use a direct upgrade to UFI or a 2 step upgrade to UFI depending on the current version.' })}
            &ensp;
            <span style={{ fontWeight: cssStr('--acx-body-font-weight-bold') }}>
              {$t({ defaultMessage: 'Firmware must always be copied to primary flash partition as shown in the example.' })}
            </span>
          </UI.ListItems>
          <UI.OrderList type={'a'}>
            <UI.ListItems>
              {$t({ defaultMessage: 'Switches running 08.0.80 and above can be directly upgraded to {firmwareVersion} UFI router image' },
                { firmwareVersion })}
              <br />
              {$t({ defaultMessage: 'Example:' })}
              <UI.CommandRectengle>
                copy tftp flash &lt;TFTP server IP address&gt; SPR09010fufi.bin primary
              </UI.CommandRectengle>
            </UI.ListItems>
            <UI.ListItems>
              {$t({ defaultMessage: 'Switches running 08.0.70x or older releases need to go through a 2 step upgrade process.' })}
              <br />
              {$t({ defaultMessage: 'Example:' })}
              <UI.CommandRectengle>
                copy tftp flash &lt;TFTP server IP address&gt; SPR08090d.bin primary
                <br />
                reload
                <br />
                copy tftp flash &lt;TFTP server IP address&gt; SPR09010fufi.bin primary
              </UI.CommandRectengle>
            </UI.ListItems>
          </UI.OrderList>
          <UI.ListItems>
            {$t({ defaultMessage: 'After upgrade, check the version again and make sure the switch is running UFI image.' })}
            <UI.CommandRectengle style={{ marginLeft: '20px' }}>
              SSH@7150-C12P#show version   <br />
              &copy; CommScope, Inc. All Rights Reserved.   <br />
              UNIT 1: compiled on May  2 2023 at 22:09:30 labeled as SPR09010f  <br />
              (33554432 bytes) from Primary SPR09010f.bin (UFI)
            </UI.CommandRectengle>
          </UI.ListItems>
        </UI.OrderList>
      </body>

      <UI.SubTitle4 level={4}>
        {$t({ defaultMessage: 'Connecting the switch to RUCKUS One' })}</UI.SubTitle4>

      <UI.DescriptionBody>
        {$t({ defaultMessage: 'Factory-default ICX switches and ICX switches with pre-existing configuration use different methods to connect to RUCKUS One.' })}
      </UI.DescriptionBody>

      <UI.SubTitle4 level={4} style={{ marginTop: '20px' }}>
        {$t({ defaultMessage: 'Factory Default Switches' })}</UI.SubTitle4>
      <UI.DescriptionBody>
        {$t({ defaultMessage: 'There are two options to connect the RUCKUS Switch to RUCKUS One:' })}
      </UI.DescriptionBody>

      <UI.DescriptionBody>
        {$t({ defaultMessage: 'Ruckus Networks recommends that the ICX switch obtain an IP address from a DHCP server for connecting to RUCKUS One.' })}
        <br />
        {$t({ defaultMessage: 'If DHCP is used to connect to RUCKUS One, the ICX switch automatically creates default VLAN 1 and router Interface VE1 with the IP addresses obtained from the DHCP server.' })}
      </UI.DescriptionBody>
      <UI.DescriptionBody>
        {$t({ defaultMessage: 'In the absence of a DHCP server, use the manager network-config wizard to connect to the cloud. Refer to "The Static IP Configuration Wizard" in this guide for more information.' })}
        <br/>
        {$t({ defaultMessage: 'The manager network-config wizard automatically creates router interface VE1 after the wizard completes.' })}
      </UI.DescriptionBody>

      <UI.SubTitle4 level={4}>
        {$t({ defaultMessage: 'Switches with Pre-existing Configuration' })}
      </UI.SubTitle4>
      <UI.DescriptionBody>
        {$t({ defaultMessage: 'For switches with existing configuration, "manager registrar" should be present in the running configuration of the switch. Use the manager registrar-query-restart command on the switch CLI to initiate cloud discovery followed by a manager connect command to establish a connection with RUCKUS One.' })}
      </UI.DescriptionBody>



      <UI.SubTitle4 level={4}>
        {$t({ defaultMessage: 'Upon Connection' })}
      </UI.SubTitle4>

      <UI.DescriptionBody>
        {$t({ defaultMessage: 'Once the ICX switch is connected to RUCKUS One:' })}
        <br />
        {$t({ defaultMessage: 'If it is the first time the ICX switch is connected to the cloud, the switch reloads after the necessary firmware is applied.' })}
        <br />
        {$t({ defaultMessage: 'RUCKUS One assigns a username and password to the switch once it is managed by RUCKUS One. Even if the switch is disconnected from the cloud, the switch username and password remain the same. The password can be obtained from RUCKUS One GUI under the Venue’s ‘Switch Settings’.' })}
      </UI.DescriptionBody>

      <Subtitle level={5}>
        {$t({ defaultMessage: 'NOTE' })}</Subtitle>

      <UI.DescriptionBody>
        {$t({ defaultMessage: 'The credentials are applicable for factory-default switches only. For switches with pre-existing configuration, you can continue using the existing authentication credentials configured on the switches.' })}
      </UI.DescriptionBody>

      <UI.DescriptionBody style={{ color: cssStr('--acx-semantics-red-60') }}>
        {$t({ defaultMessage: 'Switches must be kept on {firmwareVersion} release for RUCKUS One. No manual upgrade to a later ICX firmware should be performed unless directed by Ruckus Support. When a new cloud version becomes available, any required change in switch firmware will be handled by RUCKUS One automatically.' },
          { firmwareVersion })}
      </UI.DescriptionBody>

    </Modal>
  )

}

