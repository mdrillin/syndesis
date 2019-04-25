import { getEmptyIntegration, getSteps, WithConnections } from '@syndesis/api';
import { ConnectionOverview, Step } from '@syndesis/models';
import {
  ButtonLink,
  IntegrationEditorChooseConnection,
  IntegrationEditorConnectionsListItem,
  IntegrationEditorLayout,
  IntegrationsListSkeleton,
} from '@syndesis/ui';
import { WithLoader, WithRouteData } from '@syndesis/utils';
import * as H from 'history';
import * as React from 'react';
import { ApiError, PageTitle } from '../../../../shared';
import {
  ISelectConnectionRouteParams,
  ISelectConnectionRouteState,
} from './interfaces';

export interface ISelectConnectionPageProps {
  backHref?: (
    p: ISelectConnectionRouteParams,
    s: ISelectConnectionRouteState
  ) => H.LocationDescriptor;
  cancelHref: (
    p: ISelectConnectionRouteParams,
    s: ISelectConnectionRouteState
  ) => H.LocationDescriptor;
  header: React.ReactNode;
  selectHref: (
    connection: ConnectionOverview,
    p: ISelectConnectionRouteParams,
    s: ISelectConnectionRouteState
  ) => H.LocationDescriptor;
  sidebar: (props: { steps: Step[]; activeIndex: number }) => React.ReactNode;
}

/**
 * This page shows the list of connections containing actions with a **to**
 * pattern.
 *
 * This component expects some [params]{@link ISelectConnectionRouteParams} and
 * [state]{@link ISelectConnectionRouteState} to be properly set in the route
 * object.
 *
 * **Warning:** this component will throw an exception if the route state is
 * undefined.
 */
export class SelectConnectionPage extends React.Component<
  ISelectConnectionPageProps
> {
  public render() {
    return (
      <WithRouteData<ISelectConnectionRouteParams, ISelectConnectionRouteState>>
        {(params, state) => {
          const { flow, position } = params;
          const { integration = getEmptyIntegration() } = state;
          const flowAsNumber = parseInt(flow, 10) || 0;
          const positionAsNumber = parseInt(position, 10) || 0;
          return (
            <>
              <PageTitle title={'Choose a connection'} />
              <IntegrationEditorLayout
                header={this.props.header}
                sidebar={this.props.sidebar({
                  activeIndex: positionAsNumber,
                  steps: getSteps(integration, flowAsNumber),
                })}
                content={
                  <WithConnections>
                    {({ data, hasData, error }) => (
                      <IntegrationEditorChooseConnection
                        i18nTitle={'Choose a connection'}
                        i18nSubtitle={
                          'Click the connection that completes the integration. If the connection you need is not available, click Create Connection.'
                        }
                      >
                        <WithLoader
                          error={error}
                          loading={!hasData}
                          loaderChildren={<IntegrationsListSkeleton />}
                          errorChildren={<ApiError />}
                        >
                          {() => (
                            <>
                              {data.connectionsWithToAction.map((c, idx) => (
                                <IntegrationEditorConnectionsListItem
                                  key={idx}
                                  integrationName={c.name}
                                  integrationDescription={
                                    c.description || 'No description available.'
                                  }
                                  icon={
                                    <img src={c.icon} width={24} height={24} />
                                  }
                                  actions={
                                    <ButtonLink
                                      href={this.props.selectHref(
                                        c,
                                        params,
                                        state
                                      )}
                                    >
                                      Select
                                    </ButtonLink>
                                  }
                                />
                              ))}
                              <IntegrationEditorConnectionsListItem
                                integrationName={''}
                                integrationDescription={''}
                                icon={''}
                                actions={
                                  <ButtonLink href={'#'}>
                                    Create connection
                                  </ButtonLink>
                                }
                              />
                            </>
                          )}
                        </WithLoader>
                      </IntegrationEditorChooseConnection>
                    )}
                  </WithConnections>
                }
                backHref={
                  this.props.backHref
                    ? this.props.backHref(params, state)
                    : undefined
                }
                cancelHref={this.props.cancelHref(params, state)}
              />
            </>
          );
        }}
      </WithRouteData>
    );
  }
}
