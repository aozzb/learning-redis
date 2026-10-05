//when revising, go through queue.js then worker.js then api.js

import { Queue } from 'bullmq';

const connection = {
  host: 'localhost',
  port: 6379,
};

const emailQueue = new Queue('emails', { connection });

module.exports = {
    emailQueue,
    connection,
};