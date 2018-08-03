require("dotenv").config();
const Updater = require("./updater");

const defaultDomain = process.env.DEFAULT_HOSTNAME || false;
const domainText = defaultDomain ? "[domain]" : "<domain>";

require("yargs")
  .usage("$0 <cmd> [args]")
  .demandCommand(1)
  .command(
    `update ${domainText}`,
    `Updates ${domainText} to your current local ip, it will also setup *.${domainText}`,
    yargs => {
      yargs.positional("domain", {
        alias: "u",
        type: "string",
        default: defaultDomain || undefined,
        describe: "the domain to setup e.g matt.dyndns.labrum.me"
      });
    },
    argv =>
      Updater.update(argv.domain, process.env.HOSTED_ZONE_ID)
        .then(console.log)
        .catch(console.error)
  )
  .command(
    "set <domain> <ip>",
    "sets <domain> and *.<domain> to <ip>",
    yargs => {
      yargs
        .positional("domain", {
          type: "string",
          describe: "the domain to setup e.g matt.dyndns.labrum.me"
        })
        .positional("ip", {
          type: "string",
          describe: "IP address to update"
        });
    },
    argv =>
      Updater.set(argv.domain, argv.ip, process.env.HOSTED_ZONE_ID)
        .then(console.log)
        .catch(console.error)
  )
  .help().argv;
