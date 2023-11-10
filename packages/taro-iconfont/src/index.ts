#!/usr/bin/env node

import colors from 'colors';

import { fetchXml } from './fetchXml';
import { generateComponent } from './generateComponent';
import { getConfig } from './getConfig';

const config = getConfig();
fetchXml(config.symbol_url)
  .then(result => {
    generateComponent(result, config);
  })
  .catch(e => {
    console.error(colors.red(e.message || 'Unknown Error'));
    process.exit(1);
  });
