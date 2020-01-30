import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { Button, EmptyState, Label } from 'patternfly-react';
import * as React from 'react';
import { IListViewToolbarProps, ListViewToolbar } from '../../../Shared';
import { ConnectionStatus } from '../../DvConnection/DvConnectionCard';
import './ViewInfoList.css';

export interface IViewInfoListProps extends IListViewToolbarProps {
  connectionLoading: boolean;
  connectionName: string;
  connectionStatus: string;
  i18nEmptyStateInfo: string;
  i18nEmptyStateTitle: string;
  i18nName: string;
  i18nNameFilterPlaceholder: string;
  i18nRefresh: string;
  i18nRefreshInProgress: string;
  refreshConnectionSchema: (connectionName: string) => void;
}

export const ViewInfoList: React.FunctionComponent<
  IViewInfoListProps
> = props => {
  
  const handleRefreshClick = () => {
    props.refreshConnectionSchema(props.connectionName);
  };
  
  return (
    <>
      <ListViewToolbar {...props}>
        <div className="form-group">
          <Flex>
            <FlexItem>
              {props.connectionLoading ? (
                 <Title size="md">{props.i18nRefreshInProgress}</Title>
              ) : (
                <></>
              )}
            </FlexItem>
            <FlexItem>
              <Label
                className="view-info-list__connection-status"
                type={
                  props.connectionStatus === ConnectionStatus.ACTIVE
                    ? 'success'
                    : 'danger'
                }
              >
                {props.connectionStatus}
              </Label>
            </FlexItem>
            <FlexItem>
              <Button
                data-testid={'view-info-list__refresh-button'}
                bsStyle="default"
                onClick={handleRefreshClick}
                disabled={props.connectionLoading}
              >
                {props.i18nRefresh}&nbsp;
                {<SyncIcon />}
              </Button>
            </FlexItem>
          </Flex>
        </div>
      </ListViewToolbar>
      {props.children ? (
        <div className={'view-info-list'}>{props.children}</div>
      ) : (
        <EmptyState>
          <EmptyState.Icon />
          <EmptyState.Title>{props.i18nEmptyStateTitle}</EmptyState.Title>
          <EmptyState.Info>{props.i18nEmptyStateInfo}</EmptyState.Info>
        </EmptyState>
      )}
    </>
  );
};
