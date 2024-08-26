const { Router } = require("express");

const operations = require("../services/admin");
const path = require('path');
const verifyToken = require('../middleware/isAdmin')


const router = Router({ strict: true });

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'admin.html'));
});
router.get("/snapShot",verifyToken.verifyToken, operations.snapShot);
router.post("/acceptReq",verifyToken.verifyToken, operations.acceptReq);
router.post("/rejectReq",verifyToken.verifyToken, operations.rejectReq);
router.get('/getUsers',verifyToken.verifyToken, operations.getUsers);
router.delete("/deleteuser/:id",verifyToken.verifyToken, operations.deleteuser)
router.get('/getOneUser/:id',verifyToken.verifyToken, operations.getOneUser);
router.put('/updateUser/:id',verifyToken.verifyToken, operations.updateUser);
router.get('/requests',verifyToken.verifyToken, operations.requests);
// router.post('/register',operations.register);
// router.post('/login',operations.userLogin);
// router.get("/policies/:id", operations.getOnePolicy);
// router.post("/policies", operations.createNew);
// router.put("/policies/:id", operations.updatePolicy);
// router.delete("/policies/:id", operations.deletePolicy);

module.exports = router;