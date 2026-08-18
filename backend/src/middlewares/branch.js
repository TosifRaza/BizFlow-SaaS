const setBranchFilter = (req, res, next) => {
  // If user has a specific branch assigned and is not owner/super_admin, force that branch
  if (req.user?.branchId && req.user.role !== 'owner' && req.user.role !== 'super_admin') {
    req.branchFilter = { branchId: req.user.branchId };
  } else if (req.query.branchId || req.headers['x-branch-id']) {
    req.branchFilter = { branchId: req.query.branchId || req.headers['x-branch-id'] };
  } else {
    req.branchFilter = {};
  }
  next();
};

module.exports = { setBranchFilter };
