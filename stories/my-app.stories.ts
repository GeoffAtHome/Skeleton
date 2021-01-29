import { html, TemplateResult } from 'lit-html';
import '../src/my-app';

export default {
  title: 'MyApp',
  component: 'my-app',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  title?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({
  title,
  backgroundColor = 'white',
}: ArgTypes) => html`
  <my-app
    style="--my-app-background-color: ${backgroundColor}"
    .title=${title}
  ></my-app>
`;

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
