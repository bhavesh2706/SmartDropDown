/**
 * @format
 */

import 'react-native';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>,
  );
});
