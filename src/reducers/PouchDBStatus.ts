import { notifyMessage } from '../actions/app';
import { store } from '../store';

export function NotifyStatus(message: String, status: string) {
  store.dispatch(notifyMessage(message + ' ' + status));
}
