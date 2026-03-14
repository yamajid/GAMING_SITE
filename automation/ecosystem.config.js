module.exports = {
  apps: [
    {
      name: 'daily-scraper',
      script: './automation/daily-content-fresh.js',
      cron_restart: '0 2 * * *', // 2 AM UTC daily
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/daily-scraper-error.log',
      out_file: './logs/daily-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'scheduler-2x-daily',
      script: './automation/scheduler-2x-daily.js',
      cron_restart: '0 0,12 * * *', // 12 AM & 12 PM UTC
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/scheduler-2x-daily-error.log',
      out_file: './logs/scheduler-2x-daily-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'reddit-poster',
      script: './automation/reddit-one-click-poster.js',
      cron_restart: '0 6,18 * * *', // 6 AM & 6 PM UTC
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/reddit-poster-error.log',
      out_file: './logs/reddit-poster-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
