'use client';

import { useEffect, useState } from 'react';

export type PlatformId = 'youtube' | 'tiktok' | 'instagram';

const STORAGE_KEY = 'clipflow:connected-platforms';

type Listener = (connected: Record<string, boolean>) => void;
const listeners = new Set<Listener>();

function readStorage(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  listeners.forEach((l) => l(data));
}

export function connectPlatform(id: PlatformId) {
  const current = readStorage();
  writeStorage({ ...current, [id]: true });
}

export function disconnectPlatform(id: PlatformId) {
  const current = readStorage();
  writeStorage({ ...current, [id]: false });
}

export function getConnectedPlatforms(): Record<string, boolean> {
  return readStorage();
}

export function useConnectedPlatforms(): [
  Record<string, boolean>,
  (id: PlatformId) => void,
  (id: PlatformId) => void,
] {
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setConnected(readStorage());
    const listener: Listener = (data) => setConnected({ ...data });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const connect = (id: PlatformId) => connectPlatform(id);
  const disconnect = (id: PlatformId) => disconnectPlatform(id);

  return [connected, connect, disconnect];
}
