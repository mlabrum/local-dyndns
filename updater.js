const AWS = require("aws-sdk");
const route53 = new AWS.Route53();

const os = require("os");

module.exports = {
  getLocalIP() {
    var ifaces = os.networkInterfaces();

    for (let ifname of Object.keys(ifaces)) {
      for (let iface of ifaces[ifname]) {
        if ("IPv4" !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          continue;
        }

        if (/Vmware|VMnet|VirtualBox/i.test(ifname)) {
          // Remove virtualised iterfaces
          continue;
        }

        return iface.address;
      }
    }
  },

  /**
   * Finds the current local ip and uses that to set the domain
   */
  update(domain, hostedZoneId) {
    return this.set(domain, this.getLocalIP(), hostedZoneId);
  },

  /**
   * Sets the domain to the ip address
   */
  set(domain, ip, hostedZoneId) {
    return new Promise((accept, reject) =>
      route53.changeResourceRecordSets(
        {
          ChangeBatch: {
            Changes: [
              {
                Action: "UPSERT",
                ResourceRecordSet: {
                  Name: domain,
                  ResourceRecords: [
                    {
                      Value: ip
                    }
                  ],
                  TTL: 300,
                  Type: "A"
                }
			  },
			  {
                Action: "UPSERT",
                ResourceRecordSet: {
                  Name: `*.${domain}`,
                  ResourceRecords: [
                    {
                      Value: ip
                    }
                  ],
                  TTL: 300,
                  Type: "A"
                }
              }
            ],
            Comment: `Update ${domain} and *.${domain} to ${ip}`
          },
          HostedZoneId: hostedZoneId
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            accept(data);
          }
        }
      )
    );
  }
};
