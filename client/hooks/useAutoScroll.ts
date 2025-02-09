import { useEffect, RefObject } from 'react';
import type { Message } from '@/lib/types';

export const useAutoScroll = (
  ref: RefObject<HTMLDivElement>,
  messages: Message[],
  behavior: ScrollBehavior = 'smooth'
) => {
  useEffect(() => {
    const scrollToBottom = () => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior });
      }
    };

    scrollToBottom();
  }, [messages, ref, behavior]);
}; 