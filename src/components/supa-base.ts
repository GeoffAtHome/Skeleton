import { html, css, LitElement, property, customElement } from 'lit-element';
import { SupabaseClient } from '@supabase/supabase-js';

import load, { ISupaBase } from './supa-base-loader';

let supabase: ISupaBase;
let spdb: SupabaseClient;

export function getSpDB() {
  return spdb;
}

function initSupaBase(
  e: CustomEvent<ISupaBase>,
  supabaseUrl: string,
  supabaseKey: string
) {
  supabase = e.detail;
  spdb = supabase.createClient(supabaseUrl, supabaseKey!);
}

@customElement('supa-base')
export class SupaBase extends LitElement {
  @property({ type: String })
  supabaseUrl: string = '';

  @property({ type: String })
  supabaseKey: string = '';

  static styles = css`
    :host {
      display: none;
    }
  `;

  render() {
    return html``;
  }

  protected firstUpdated() {
    this.addEventListener('SupaBaseLoaded', (e: any) => {
      initSupaBase(e, this.supabaseUrl, this.supabaseKey);
      const event = new CustomEvent<ISupaBase>('SupaBaseReady', {
        detail: window.supabase,
      });
      this.dispatchEvent(event);
    });
    load(this);
  }
}
