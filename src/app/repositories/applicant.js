const applicantModel = require('../models/applicant')

const register = applicant => applicantModel.create(applicant)

const update = (id, data) => applicantModel.findByIdAndUpdate(
  id,
  data,
  { new: true, fields: { password: 0 } }
)

module.exports = {
  register,
  update
}
