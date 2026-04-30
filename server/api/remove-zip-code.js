const { getIntegrationSdk, handleError } = require('../api-util/sdk');

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const ZIP_CODE_REGEX = /^\d{5}$/;

/**
 * POST /api/admin/zip-codes/remove
 *
 * Fetches the current zip code list from the admin user's private data,
 * filters out the given zip code, and saves the updated list.
 *
 * Expects body: { zipCode: string }
 */
module.exports = (req, res) => {
  if (req.tokenUserId !== ADMIN_USER_ID) {
    const error = new Error('Forbidden: admin access only.');
    error.status = 403;
    error.statusText = 'Forbidden';
    error.data = {};
    return handleError(res, error);
  }

  const { zipCode } = req.body || {};

  if (!zipCode || !ZIP_CODE_REGEX.test(zipCode)) {
    const error = new Error('zipCode must be a 5-digit string.');
    error.status = 400;
    error.statusText = 'Bad Request';
    error.data = {};
    return handleError(res, error);
  }

  const integrationSdk = getIntegrationSdk();

  integrationSdk.users
    .show({ id: ADMIN_USER_ID })
    .then(response => {
      const profile = response.data.data.attributes.profile;
      const current = (profile.privateData && profile.privateData.zipCodes) || [];
      const zipCodes = current.filter(z => z !== zipCode);

      return integrationSdk.users
        .updateProfile({ id: ADMIN_USER_ID, privateData: { zipCodes } })
        .then(() => res.status(200).json({ zipCodes }));
    })
    .catch(error => handleError(res, error));
};
