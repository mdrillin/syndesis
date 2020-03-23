import * as React from 'react';
import { callFetch, IFetchHeaders } from './callFetch';

export const MONACO_EDITOR_CONNECTED = 'connected';

export interface IWithMonacoEditorProps {
  apiUri: string;
  headers: IFetchHeaders;
  children(props: IWithMonacoEditorChildrenProps): any;
}

export interface IWithMonacoEditorChildrenProps {
  registerMessageListener: (listener: () => void) => void;
  unregisterMessageListener: (listener: () => void) => void;
}

const RECONNECT_TIME = 5000;

export class WithMonacoEditor extends React.Component<IWithMonacoEditorProps> {
  private starting = false;
  private started = false;
  private unmounting = false;
  private retries = 0;
  private preferredProtocol: string = '';
  private eventSource: EventSource | undefined;
  private webSocket: WebSocket | undefined;

  public constructor(props: IWithMonacoEditorProps) {
    super(props);
  }

  public registerMessageListener(listener: () => void) {
    // test
  }

  public unregisterMessageListener(listener: () => void) {
    // test
  }

  public async componentDidMount() {
    this.start();
  }

  public async componentWillUnmount() {
    this.unmounting = true;
    this.close();
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IWithMonacoEditorProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return false;
  }

  public render() {
    return this.props.children({
      registerMessageListener: this.registerMessageListener,
      unregisterMessageListener: this.unregisterMessageListener,
    });
  }

  private close() {
    this.started = false;
    this.starting = false;
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = undefined;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private start() {
    this.startConnection(this.retries % 2 === 0);
  }

  private onFailure(error: any) {
    this.close();
    if (this.unmounting) {
      return;
    }
    this.retries++;
    // Initialy retry very quickly.
    let reconnectIn = RECONNECT_TIME;
    if (this.retries < 3) {
      reconnectIn = 1;
    }
    setTimeout(() => {
      // console.log('Reconnecting');
      switch (this.preferredProtocol) {
        // Once we find a protocol that works, keep using it.
        case 'ws':
          this.startConnection(true);
          break;
        case 'es':
          this.startConnection(false);
          break;
        default:
          // Keep flipping between WS and ES untill we find one that works.
          this.startConnection(this.retries % 2 === 0);
          break;
      }
    }, reconnectIn);
  }

  private async startConnection(connectUsingWebSockets: boolean) {
    if (this.starting || this.started || this.unmounting) {
      return;
    }
    this.starting = true;
    try {
      const response = await callFetch({
        body: '',
        headers: this.props.headers,
        method: 'POST',
        url: `${this.props.apiUri}/event/reservations`,
      });
      let reservation = await response.json();
      reservation = reservation.data;
      if (connectUsingWebSockets) {
        let wsApiEndpoint = this.props.apiUri.replace(/^http/, 'ws');
        wsApiEndpoint += '/event/streams.ws/' + reservation;
        // console.log('Connecting using web socket');
        this.starting = false;
        this.started = true;
        this.connectWebSocket(wsApiEndpoint);
      } else {
        this.starting = false;
        this.started = true;
      }
    } catch (error) {
      this.onFailure(error);
    }
  }

  private connectWebSocket(url: string) {
    this.webSocket = new WebSocket(url);
    this.webSocket.onmessage = event => {
      this.started = true;
      this.starting = false;
    };
    this.webSocket.onclose = event => {
      // console.log('ws.onclose: ', event);
      this.onFailure(event);
    };
    return this.webSocket;
  }
}
