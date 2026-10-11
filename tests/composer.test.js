import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composerAction, shouldSubmit } from '../src/composer.js';

test('IME composition and open suggestion menus must not send', () => {
  assert.equal(shouldSubmit({key:'Enter',shiftKey:false,isComposing:true}), false);
  assert.equal(shouldSubmit({key:'Enter',shiftKey:false,isComposing:false}, true), false);
  assert.equal(shouldSubmit({key:'Enter',shiftKey:true,isComposing:false}), false);
  assert.equal(shouldSubmit({key:'Enter',shiftKey:false,isComposing:false}), true);
});
test('attachment-only input sends, unavailable and read-only states stay blocked', () => {
  assert.equal(composerAction({attachments:[{name:'brief.pdf'}]}).action, 'send');
  assert.equal(composerAction({text:'hello',canSend:false}).disabled, true);
  assert.equal(composerAction({text:'hello',readOnly:true}).action, 'none');
  assert.equal(composerAction({text:'   '}).action, 'start-voice');
});
test('recording offers stop, processing cannot send accumulated text', () => {
  assert.equal(composerAction({text:'draft',voice:'recording'}).action, 'stop-voice');
  assert.equal(composerAction({text:'draft',voice:'processing'}).disabled, true);
});
