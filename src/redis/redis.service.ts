import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    this.pubClient = new Redis({ host, port, lazyConnect: true });
    this.subClient = new Redis({ host, port, lazyConnect: true });
    this.pubClient.on('error', () => {});
    this.subClient.on('error', () => {});
    this.pubClient.connect().catch(() => {});
    this.subClient.connect().catch(() => {});
  }

  getPubClient(): Redis {
    return this.pubClient;
  }

  getSubClient(): Redis {
    return this.subClient;
  }

  async publish(channel: string, message: string): Promise<void> {
    if (this.pubClient.status !== 'ready') return;
    try {
      await this.pubClient.publish(channel, message);
    } catch {
      // Redis no disponible; se ignora
    }
  }

  async onApplicationShutdown() {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}
