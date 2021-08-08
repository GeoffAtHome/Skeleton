import { notifyMessage } from '../actions/app';
import { store } from '../store';

export enum LoadingStatus {
  Unknown,
  Loading,
  Loaded,
}

export function NotifyStatus(message: String, status: LoadingStatus) {
  let msg = '';

  switch (status) {
    default:
      msg = `${message} unknown`;
      break;
    case LoadingStatus.Loading:
      msg = `${message} loading`;
      break;
    case LoadingStatus.Loaded:
      msg = `${message} loaded`;
      break;
  }

  store.dispatch(notifyMessage(msg));
}
