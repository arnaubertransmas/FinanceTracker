import { createApp } from "./app";
import { env } from "./config/env";
import { scheduleRecurringTransactionsJob } from "./jobs/recurringTransactions.job";
import { scheduleDbKeepAliveJob } from "./jobs/dbKeepAlive.job";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`FinanceTracker backend listening on http://localhost:${env.PORT}`);
  scheduleRecurringTransactionsJob();
  scheduleDbKeepAliveJob();
});
