module.exports = {
  apps: [
    {
      name: "zeline",
      script: "index.js",
      autorestart: true,
      watch: false,
      max_memory_restart: "800M"
    }
  ]
}
