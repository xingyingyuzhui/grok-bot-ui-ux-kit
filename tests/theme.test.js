import test from 'node:test';
import assert from 'node:assert/strict';
import {setTheme} from '../src/index.js';

test('system theme follows changes and preference replacement clears subscriptions', () => {
  const listeners=new Set();
  const media={matches:false,addEventListener:(_,listener)=>listeners.add(listener),removeEventListener:(_,listener)=>listeners.delete(listener)};
  const root={dataset:{},style:{}};
  const first=setTheme(root,'system',media);
  assert.equal(root.dataset.grokTheme,'light');
  media.matches=true;listeners.forEach(listener=>listener());
  assert.equal(root.dataset.grokTheme,'dark');
  const second=setTheme(root,'light',media);
  assert.equal(listeners.size,0);
  assert.equal(root.style.colorScheme,'light');
  first(); // An obsolete disposer must not remove the replacement subscription.
  second();
  const third=setTheme(root,'system',media);
  assert.equal(listeners.size,1);
  third();assert.equal(listeners.size,0);
});
