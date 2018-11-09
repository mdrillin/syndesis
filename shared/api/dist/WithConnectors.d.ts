import { IConnector } from "@syndesis/models";
import * as React from 'react';
import { IRestState } from "./Rest";
export interface IConnectorsResponse {
    items: IConnector[];
    totalCount: number;
}
export interface IWithConnectorsProps {
    children(props: IRestState<IConnectorsResponse>): any;
}
export declare class WithConnectors extends React.Component<IWithConnectorsProps> {
    render(): JSX.Element;
}
