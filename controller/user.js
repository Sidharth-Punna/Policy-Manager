const { Router } = require("express");
const verifyToken = require('../middleware/isUser')
const operations = require("../services/user")
const path =require('path');
const router = Router({ strict: true });

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'user.html'));
});
router.get("/policies",verifyToken.verifyToken, operations.getAllPolicies);
router.post('/register',operations.register);
router.post('/login',operations.userLogin);
router.get("/policies/:policy_number", operations.getOnePolicy);
router.post("/policies", operations.requestNew);
router.post('/logOut',operations.logOut);
router.put("/policies/:policy_number", operations.updatePolicy);
router.delete("/policies/:policy_number", operations.deletePolicy);

module.exports = router;
