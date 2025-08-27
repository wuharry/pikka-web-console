import type { ChannelMessage, IChannel } from "@/client/types";

// 未來要換 WebSocket，只要新增 channel-websocket.ts 也實作 IChannel，上層完全不變。
export function createChannelBroadcast({ name }: { name: string }): IChannel {
  const channel = new BroadcastChannel(name);
  const channelPayload: ChannelMessage[] = [];

  const onMessage = (handler: (msg: ChannelMessage) => void) => {
    channel.onmessage = (e) => {
      handler(e.data);
    };
  };
  const send = (msg: ChannelMessage) => {
    channel.postMessage(msg);
  };
  const close = () => {
    channel.close();
  };

  return {
    onMessage,
    send,
    close,
  };
}
