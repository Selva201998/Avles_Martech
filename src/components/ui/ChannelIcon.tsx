import { BellRing, Mail, MessageSquare } from 'lucide-react';
import type { Channel } from '../../types';

export function ChannelIcon({ channel }: { channel: Channel }) {
  const Icon = channel === 'Email' ? Mail : channel === 'Push Notification' ? BellRing : MessageSquare;
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}
