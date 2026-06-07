module.exports = {
  apps: [
    {
      name: "twizz-project",
      script: "/root/apps/twizz-project/start-prod.sh",
      cwd: "/root/apps/twizz-project",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};

