const { forbiddenError } = require('../app/lib/error-wrap')

/**
 * check if user is admin
 * @return {Error}
 */
const checkIsAdmin = isAdmin => {
  if (!isAdmin) throw forbiddenError()
}

/**
 * check if user is applicant
 * @return {Error}
 */
const checkIsApplicant = profile => {
  if (profile !== 'applicant') throw forbiddenError()
}

/**
 * check if user is institution
 * @return {Error}
 */
const checkIsInstitution = profile => {
  if (profile !== 'institution') throw forbiddenError()
}

module.exports = {
  checkIsAdmin,
  checkIsApplicant,
  checkIsInstitution
}
