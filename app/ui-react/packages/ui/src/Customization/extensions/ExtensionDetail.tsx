import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Level,
  LevelItem,
  PageSection,
  Text,
  TextContent,
  Title,
  TitleLevel,
  Tooltip,
} from '@patternfly/react-core';
import * as H from '@syndesis/history';
import * as React from 'react';
import { ButtonLink } from '../../Layout';
import { Container } from '../../Layout/Container';
import {
  ConfirmationButtonStyle,
  ConfirmationDialog,
  ConfirmationIconType,
} from '../../Shared';
import './ExtensionDetail.css';

export interface IExtensionDetailProps {
  /**
   * The name of the extension.
   */
  extensionName: string;

  /**
   * The number of integrations that use this extension.
   */
  extensionUses: number;

  /**
   * The localized text of the cancel button used when deleting this extension.
   */
  i18nCancelText: string;

  /**
   * The localized text of the delete button.
   */
  i18nDelete: string;

  /**
   * The localized delete confirmation message.
   */
  i18nDeleteModalMessage: string;

  /**
   * The localized title of the delete dialog.
   */
  i18nDeleteModalTitle: string;

  /**
   * The localized tooltip of the delete button.
   */
  i18nDeleteTip?: string;

  /**
   * The localized message that displays the extension ID.
   */
  i18nIdMessage: string;

  /**
   * The localized text for the overview section title.
   */
  i18nOverviewSectionTitle: string;

  /**
   * The localized text of the supports section title.
   */
  i18nSupportsSectionTitle: string;

  /**
   * The localized text of the update button.
   */
  i18nUpdate: string;

  /**
   * The localized tooltip of the update button.
   */
  i18nUpdateTip?: string;

  /**
   * The localized text of the usage section title.
   */
  i18nUsageSectionTitle: string;

  /**
   * The JSX element that displayes the integrations used by this extension.
   */
  integrationsSection: JSX.Element;

  /**
   * An href to use when the extension is being updated.
   */
  linkUpdateExtension: H.LocationDescriptor;

  /**
   * The callback for when the delete button is clicked.
   */
  onDelete: () => void;

  /**
   * The JSX element that displays the overview section.
   */
  overviewSection: JSX.Element;

  /**
   * The JSX element that displays the supports section.
   */
  supportsSection: JSX.Element;
}

export const ExtensionDetail: React.FunctionComponent<
  IExtensionDetailProps
> = props => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const doCancel = () => {
    setShowDeleteDialog(false);
  };

  const doDelete = () => {
    setShowDeleteDialog(false);

    // TODO: disable components while delete is processing
    props.onDelete();
  };

  const showConfirmationDialog = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <ConfirmationDialog
        buttonStyle={ConfirmationButtonStyle.DANGER}
        i18nCancelButtonText={props.i18nCancelText}
        i18nConfirmButtonText={props.i18nDelete}
        i18nConfirmationMessage={props.i18nDeleteModalMessage}
        i18nTitle={props.i18nDeleteModalTitle}
        icon={ConfirmationIconType.DANGER}
        showDialog={showDeleteDialog}
        onCancel={doCancel}
        onConfirm={doDelete}
      />
      <PageSection variant={'light'}>
        <Level gutter={'sm'}>
          <TextContent>
            <Title
              size="xl"
              headingLevel={TitleLevel.h1}
              className="extension-detail__extensionTitle"
            >
              {props.extensionName}
            </Title>
            <Text className="extension-detail__extensionId">
              {props.i18nIdMessage}
            </Text>
          </TextContent>
          <LevelItem className="extension-detail__titleButtons">
            <Tooltip
              position={'top'}
              enableFlip={true}
              content={
                <div id={'updateTip'}>
                  {props.i18nUpdateTip ? props.i18nUpdateTip : props.i18nUpdate}
                </div>
              }
            >
              <ButtonLink
                data-testid={'extension-detail-update-button'}
                href={props.linkUpdateExtension}
                as={'primary'}
              >
                {props.i18nUpdate}
              </ButtonLink>
            </Tooltip>
            <Tooltip
              position={'top'}
              enableFlip={true}
              content={
                <div id={'deleteTip'}>
                  {props.i18nDeleteTip ? props.i18nDeleteTip : props.i18nDelete}
                </div>
              }
            >
              <Button
                data-testid={'extension-detail-delete-button'}
                isDisabled={props.extensionUses !== 0}
                variant={ButtonVariant.secondary}
                onClick={showConfirmationDialog}
              >
                {props.i18nDelete}
              </Button>
            </Tooltip>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            <TextContent>
              <Title
                headingLevel="h5"
                size="md"
                className="customization-details__heading"
              >
                {props.i18nOverviewSectionTitle}
              </Title>
              <Container>{props.overviewSection}</Container>

              <Title
                headingLevel="h5"
                size="md"
                className="customization-details__heading"
              >
                {props.i18nSupportsSectionTitle}
              </Title>
              <Container>{props.supportsSection}</Container>

              <Title
                headingLevel="h5"
                size="md"
                className="customization-details__heading"
              >
                {props.i18nUsageSectionTitle}
              </Title>
              <Container>{props.integrationsSection}</Container>
            </TextContent>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};
