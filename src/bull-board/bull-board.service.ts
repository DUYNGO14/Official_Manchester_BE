import { Injectable, OnModuleInit } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';

@Injectable()
export class BullBoardService implements OnModuleInit {
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue('emailQueue') private emailQueue: Queue,
  ) {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/queues');
  }

  onModuleInit() {
    createBullBoard({
      queues: [
        new BullMQAdapter(this.emailQueue),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  getServerAdapter(): ExpressAdapter {
    return this.serverAdapter;
  }
}