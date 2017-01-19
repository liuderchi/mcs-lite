import { configure, addDecorator } from '@kadira/storybook';
import centered from './decorator-centered';

const context = require.context('../src/', true, /\.example\.js$/);

addDecorator(centered);

function loadStories() {
  context.keys().forEach(context);
}

configure(loadStories, module);
