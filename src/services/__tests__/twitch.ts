import Twitch from "../twitch";
import Main from "../../main";

const debug = require('debug')('app:Twitch:test');

const main = {
  config: {
    twitchToken: '',
    twitchSecret: '',
  },
} as Main;

test('findChannel', async () => {
  const twitch = new Twitch(main);

  const channel = await twitch.findChannel('karmikkoala');

  expect(channel).toEqual({
    id: 54742538,
    title: 'KarmikKoala',
    url: 'https://twitch.tv/karmikkoala',
  });
});

test('findChannel2', async () => {
  const twitch = new Twitch(main);

  const channel = await twitch.findChannel('https://www.twitch.tv/karmikkoala');

  expect(channel).toEqual({
    id: 54742538,
    title: 'KarmikKoala',
    url: 'https://twitch.tv/karmikkoala',
  });
});

test('getExistsChannelIds', async () => {
  const twitch = new Twitch(main);

  const channel = await twitch.findChannel('karmikkoala');

  const result = await twitch.getExistsChannelIds([channel.id]);

  expect(result).toEqual([54742538]);
});

test('getStreams', async () => {
  const twitch = new Twitch(main);

  const channel = await twitch.findChannel('karmikkoala');

  const result = await twitch.getStreams([channel.id]);

  debug(result);
});



