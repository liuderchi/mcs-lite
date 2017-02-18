/* eslint no-console:0 */

import fs from 'fs';
import R from 'ramda';
import glob from 'glob';
import path from 'path';
import Rx from 'rxjs/Rx';
import * as babel from 'babel-core';

const srcPattern = process.argv[2];
const desPath = process.argv[3];

process.env.NODE_ENV = 'production'; // for babel

// --- /src/a.js --- /src/b.js --- ...
const srcPath$ = Rx.Observable
  .from([srcPattern])
  .switchMap(pattern => Rx.Observable.from(glob.sync(pattern, { absolute: true })));

// --- contentA --- contentB --- ...
const content$ = srcPath$
  .map(filepath => fs.readFileSync(filepath, 'utf-8'));

// --- [] --- [] --- [{}, {}] --- ...
const messages$ = content$
  .map(content => babel.transform(content, {
    presets: [require.resolve('babel-preset-react-app')],
    plugins: [require.resolve('babel-plugin-react-intl')],
    babelrc: false,
  }))
  .map(R.path(['metadata', 'react-intl', 'messages']));

// ---------- JSON:[{}, {}] |
const results$ = messages$
  .filter(messages => messages.length !== 0)
  .reduce((acc, messages) => acc.concat(messages), [])
  .map(concated => JSON.stringify(concated, null, 2));

// Output
results$
  .do((results) => {
    fs.writeFileSync(desPath, results);
    console.log(`${path.relative(process.cwd(), srcPattern)} -> ${path.relative(process.cwd(), desPath)}`);
  })
  .catch(console.error)
  .subscribe();