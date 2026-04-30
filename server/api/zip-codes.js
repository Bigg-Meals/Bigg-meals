const { getIntegrationSdk, handleError } = require('../api-util/sdk');

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

/**
 * GET /api/admin/zip-codes
 *
 * Fetches the list of allowed zip codes stored in the admin user's private data
 * via the Integration SDK. Public endpoint — no authentication required.
 */
module.exports = (req, res) => {
  const integrationSdk = getIntegrationSdk();

  integrationSdk.users
    .show({ id: ADMIN_USER_ID })
    .then(response => {
      const profile = response.data.data.attributes.profile;
      const zipCodes = (profile.privateData && profile.privateData.zipCodes) || [];
      res.status(200).json({ zipCodes });
    })
    .catch(error => {
      handleError(res, error);
    });
};
